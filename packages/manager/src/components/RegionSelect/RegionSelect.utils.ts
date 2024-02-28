import { CONTINENT_CODE_TO_CONTINENT } from '@linode/api-v4';

import { useFlags } from 'src/hooks/useFlags';
import {
  getRegionCountryGroup,
  getSelectedRegion,
} from 'src/utilities/formatRegion';

import type {
  GetRegionOptionAvailability,
  GetRegionOptions,
  GetSelectedRegionById,
  GetSelectedRegionsByIdsArgs,
  RegionSelectOption,
  SupportedEdgeTypes,
} from './RegionSelect.types';
import type { AccountAvailability, Region } from '@linode/api-v4';
import type { LinodeCreateType } from 'src/features/Linodes/LinodesCreate/types';

const NORTH_AMERICA = CONTINENT_CODE_TO_CONTINENT.NA;

/**
 * Returns an array of OptionType objects for use in the RegionSelect component.
 * Regions are sorted alphabetically by region, with North America first.
 *
 * @returns An array of RegionSelectOption objects
 */
export const getRegionOptions = ({
  accountAvailabilityData,
  currentCapability,
  hideEdgeServers = false,
  regions,
}: GetRegionOptions): RegionSelectOption[] => {
  const filteredRegionsByCapability = currentCapability
    ? regions.filter((region) =>
        region.capabilities.includes(currentCapability)
      )
    : regions;

  const filteredRegionsByCapabilityAndSiteType = hideEdgeServers
    ? filteredRegionsByCapability.filter(
        (region) => region.site_type !== 'edge'
      )
    : filteredRegionsByCapability;

  return filteredRegionsByCapabilityAndSiteType
    .map((region: Region) => {
      const group = getRegionCountryGroup(region);

      return {
        data: {
          country: region.country,
          region: group,
        },
        label: `${region.label} (${region.id})`,
        site_type: region.site_type,
        unavailable: getRegionOptionAvailability({
          accountAvailabilityData,
          currentCapability,
          region,
        }),
        value: region.id,
      };
    })
    .sort((region1, region2) => {
      // North America group comes first
      if (
        region1.data.region === NORTH_AMERICA &&
        region2.data.region !== NORTH_AMERICA
      ) {
        return -1;
      }
      if (
        region1.data.region !== NORTH_AMERICA &&
        region2.data.region === NORTH_AMERICA
      ) {
        return 1;
      }

      // Rest of the regions are sorted alphabetically
      if (region1.data.region < region2.data.region) {
        return -1;
      }
      if (region1.data.region > region2.data.region) {
        return 1;
      }

      // Then we group by country
      if (region1.data.country < region2.data.country) {
        return 1;
      }
      if (region1.data.country > region2.data.country) {
        return -1;
      }

      // If regions are in the same group or country, sort alphabetically by label
      if (region1.label < region2.label) {
        return -1;
      }

      return 1;
    });
};

/**
 * Util to map a region ID to an OptionType object.
 *
 * @returns an RegionSelectOption object for the currently selected region.
 */
export const getSelectedRegionById = ({
  accountAvailabilityData,
  currentCapability,
  regions,
  selectedRegionId,
}: GetSelectedRegionById): RegionSelectOption | undefined => {
  const selectedRegion = getSelectedRegion(regions, selectedRegionId);

  if (!selectedRegion) {
    return undefined;
  }

  const group = getRegionCountryGroup(selectedRegion);

  return {
    data: {
      country: selectedRegion?.country,
      region: group,
    },
    label: `${selectedRegion.label} (${selectedRegion.id})`,
    site_type: selectedRegion.site_type,
    unavailable: getRegionOptionAvailability({
      accountAvailabilityData,
      currentCapability,
      region: selectedRegion,
    }),
    value: selectedRegion.id,
  };
};

/**
 * Util to determine if a region is available to the user for a given capability.
 *
 * @returns a boolean indicating whether the region is available to the user.
 */
export const getRegionOptionAvailability = ({
  accountAvailabilityData,
  currentCapability,
  region,
}: GetRegionOptionAvailability): boolean => {
  if (!accountAvailabilityData || !currentCapability) {
    return false;
  }

  const regionWithUnavailability:
    | AccountAvailability
    | undefined = accountAvailabilityData.find(
    (regionAvailability: AccountAvailability) =>
      regionAvailability.region === region.id
  );

  if (!regionWithUnavailability) {
    return false;
  }

  return regionWithUnavailability.unavailable.includes(currentCapability);
};

/**
 * This utility function takes an array of region IDs and returns an array of corresponding RegionSelectOption objects.
 *
 * @returns An array of RegionSelectOption objects corresponding to the selected region IDs.
 */
export const getSelectedRegionsByIds = ({
  accountAvailabilityData,
  currentCapability,
  regions,
  selectedRegionIds,
}: GetSelectedRegionsByIdsArgs): RegionSelectOption[] => {
  return selectedRegionIds
    .map((selectedRegionId) =>
      getSelectedRegionById({
        accountAvailabilityData,
        currentCapability,
        regions,
        selectedRegionId,
      })
    )
    .filter((region): region is RegionSelectOption => !!region);
};

/**
 * Util to determine whether a create type has support for edge regions.
 *
 * @returns a boolean indicating whether or not to enable gecko.
 */
export const useIsGeckoEnabled = (createType: LinodeCreateType) => {
  const flags = useFlags();

  const supportedEdgeTypes: SupportedEdgeTypes[] = [
    'Distributions',
    'StackScripts',
  ];
  return Boolean(
    flags.gecko &&
      !supportedEdgeTypes.includes(createType as SupportedEdgeTypes)
  );
};

/**
 * Util to determine whether a selected region is an edge region.
 *
 * @returns a boolean indicating whether or not the selected region is an edge region.
 */
export const isEdgeRegion = (regionsData: Region[], selectedRegion: string) => {
  return (
    regionsData.find(
      (region) =>
        region.id === selectedRegion || region.label === selectedRegion
    )?.site_type === 'edge'
  );
};

export const useIsEdgeRegion = (
  regionsData: Region[],
  selectedRegion: string
) => {
  const flags = useFlags();
  return Boolean(flags.gecko && isEdgeRegion(regionsData, selectedRegion));
};
