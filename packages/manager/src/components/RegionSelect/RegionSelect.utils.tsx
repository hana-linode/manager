import { CONTINENT_CODE_TO_CONTINENT } from '@linode/api-v4';

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
  SupportedDistributedRegionTypes,
} from './RegionSelect.types';
import type { AccountAvailability, Region } from '@linode/api-v4';
import type { LinodeCreateType } from 'src/features/Linodes/LinodesCreate/types';

const NORTH_AMERICA = CONTINENT_CODE_TO_CONTINENT.NA;

/**
 * Returns an array of OptionType objects for use in the RegionSelect component.
 * Handles the disabled state of each region based on the user's account availability or an optional custom handler.
 * Regions are sorted alphabetically by region, with North America first.
 *
 * @returns An array of RegionSelectOption objects
 */
export const getRegionOptions = ({
  accountAvailabilityData,
  currentCapability,
  flags,
  handleDisabledRegion,
  regionFilter,
  regions,
}: GetRegionOptions): RegionSelectOption[] => {
  const filteredRegionsByCapability = currentCapability
    ? regions.filter((region) =>
        region.capabilities.includes(currentCapability)
      )
    : regions;

  const filteredRegionsByCapabilityAndSiteType = regionFilter
    ? filteredRegionsByCapability.filter((region) => {
        const [, distributedContinentCode] = regionFilter.split('distributed-');
        // Filter distributed regions by geographical area
        if (distributedContinentCode && distributedContinentCode !== 'ALL') {
          const group = getRegionCountryGroup(region);
          return (
            (region.site_type === 'edge' ||
              region.site_type === 'distributed') &&
            CONTINENT_CODE_TO_CONTINENT[distributedContinentCode] === group
          );
        }
        return regionFilter.includes(region.site_type);
      })
    : filteredRegionsByCapability;

  const isRegionUnavailable = (region: Region) =>
    isRegionOptionUnavailable({
      accountAvailabilityData,
      currentCapability,
      region,
    });

  return filteredRegionsByCapabilityAndSiteType
    .map((region: Region) => {
      const group = getRegionCountryGroup(region);

      // The region availability is the first check we run, regardless of the handleDisabledRegion function.
      // This check always runs, and if the region is unavailable, the region will be disabled.
      const disabledProps = isRegionUnavailable(region)
        ? {
            disabled: true,
            reason:
              'This region is currently unavailable. For help, open a support ticket.',
            tooltipWidth: 250,
          }
        : handleDisabledRegion?.(region)?.disabled
        ? handleDisabledRegion(region)
        : {
            disabled: false,
          };

      const getLabel = () => {
        // Display regions sorted by Country first
        if (flags?.gecko2?.enabled && flags.gecko2.ga) {
          const [city] = region.label.split(', ');
          return `${region.country.toUpperCase()}, ${city}`;
        }

        return `${region.label} (${region.id})`;
      };

      return {
        data: {
          country: region.country,
          region: group,
        },
        disabledProps,
        label: getLabel(),
        site_type: region.site_type,
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
      if (flags?.gecko2?.enabled && !flags.gecko2.ga) {
        // Display regions as normal for Gecko Beta
        if (region1.data.country < region2.data.country) {
          return 1;
        }
        if (region1.data.country > region2.data.country) {
          return -1;
        }
      }

      // Then we group by label
      if (region1.label < region2.label) {
        return -1;
      }
      if (region1.label > region2.label) {
        return 1;
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
    value: selectedRegion.id,
  };
};

/**
 * Util to determine if a region is available to the user for a given capability.
 *
 * @returns a boolean indicating whether the region is available to the user.
 */
export const isRegionOptionUnavailable = ({
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
 * Util to determine whether a create type has support for distributed regions.
 *
 * @returns a boolean indicating whether or not the create type supports distributed regions.
 */
export const isDistributedRegionSupported = (createType: LinodeCreateType) => {
  const supportedDistributedRegionTypes: SupportedDistributedRegionTypes[] = [
    'Distributions',
    'StackScripts',
  ];
  return (
    supportedDistributedRegionTypes.includes(
      createType as SupportedDistributedRegionTypes
    ) || typeof createType === 'undefined' // /linodes/create route
  );
};

/**
 * Util to determine whether a selected region is a distributed region.
 *
 * @returns a boolean indicating whether or not the selected region is a distributed region.
 */
export const getIsDistributedRegion = (
  regionsData: Region[],
  selectedRegion: string
) => {
  const region = regionsData.find(
    (region) => region.id === selectedRegion || region.label === selectedRegion
  );
  return region?.site_type === 'distributed' || region?.site_type === 'edge';
};
