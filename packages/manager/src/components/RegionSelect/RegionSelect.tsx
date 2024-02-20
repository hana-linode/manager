import { Typography } from '@mui/material';
import * as React from 'react';
import { useLocation } from 'react-router-dom';

import EdgeServer from 'src/assets/icons/entityIcons/edge-server.svg';
import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';
import { Flag } from 'src/components/Flag';
import { Link } from 'src/components/Link';
import { TooltipIcon } from 'src/components/TooltipIcon';
import { useFlags } from 'src/hooks/useFlags';
import { useAccountAvailabilitiesQueryUnpaginated } from 'src/queries/accountAvailability';
import { getQueryParamFromQueryString } from 'src/utilities/queryParams';

import { RegionOption } from './RegionOption';
import {
  StyledAutocompleteContainer,
  StyledEdgeBox,
  StyledFlagContainer,
  sxEdgeIcon,
} from './RegionSelect.styles';
import { getRegionOptions, getSelectedRegionById } from './RegionSelect.utils';

import type {
  RegionSelectOption,
  RegionSelectProps,
} from './RegionSelect.types';

/**
 * A specific select for regions.
 *
 * The RegionSelect automatically filters regions based on capability using its `currentCapability` prop. For example, if
 * `currentCapability="VPCs"`, only regions that support VPCs will appear in the RegionSelect dropdown. There is no need to
 * prefilter regions when passing them to the RegionSelect. See the description of `currentCapability` prop for more information.
 */
export const RegionSelect = React.memo((props: RegionSelectProps) => {
  const {
    currentCapability,
    disabled,
    errorText,
    handleSelection,
    helperText,
    isClearable,
    label,
    regions,
    required,
    selectedId,
    width,
  } = props;

  const flags = useFlags();
  const location = useLocation();
  const createType = getQueryParamFromQueryString(location.search, 'type');

  const {
    data: accountAvailability,
    isLoading: accountAvailabilityLoading,
  } = useAccountAvailabilitiesQueryUnpaginated();

  const regionFromSelectedId: RegionSelectOption | null =
    getSelectedRegionById({
      accountAvailabilityData: accountAvailability,
      currentCapability,
      regions,
      selectedRegionId: selectedId ?? '',
    }) ?? null;

  const [selectedRegion, setSelectedRegion] = React.useState<
    RegionSelectOption | null | undefined
  >(regionFromSelectedId);

  const handleRegionChange = (selection: RegionSelectOption | null) => {
    setSelectedRegion(selection);
    handleSelection(selection?.value || '');
  };

  React.useEffect(() => {
    if (selectedId) {
      setSelectedRegion(regionFromSelectedId);
    } else {
      // We need to reset the state when create types change
      setSelectedRegion(null);
    }
  }, [selectedId]);

  // Hide edge sites from Marketplace, Cloning, and Images
  const unsupportedEdgeEntities = [
    'Clone Linode',
    'Images',
    'One-Click',
  ].includes(createType);
  const geckoEnabled = Boolean(flags.gecko && !unsupportedEdgeEntities);

  const showGeckoHelperText =
    geckoEnabled &&
    currentCapability &&
    regions.find(
      (region) =>
        region.site_type === 'edge' &&
        region.capabilities.includes(currentCapability)
    );

  const options = React.useMemo(
    () =>
      getRegionOptions({
        accountAvailabilityData: accountAvailability,
        currentCapability,
        hideEdgeServers: !geckoEnabled,
        regions,
      }),
    [accountAvailability, currentCapability, regions, geckoEnabled]
  );

  return (
    <StyledAutocompleteContainer sx={{ width }}>
      <Autocomplete
        isOptionEqualToValue={(
          option: RegionSelectOption,
          { value }: RegionSelectOption
        ) => option.value === value}
        onChange={(_, selectedOption: RegionSelectOption) => {
          handleRegionChange(selectedOption);
        }}
        onKeyDown={(e) => {
          if (e.key !== 'Tab') {
            setSelectedRegion(null);
            handleRegionChange(null);
          }
        }}
        renderOption={(props, option) => {
          return (
            <RegionOption
              displayEdgeServerIcon={
                geckoEnabled && option.site_type === 'edge'
              }
              key={option.value}
              option={option}
              props={props}
            />
          );
        }}
        sx={(theme) => ({
          [theme.breakpoints.up('md')]: {
            width: '416px',
          },
        })}
        textFieldProps={{
          InputProps: {
            endAdornment: geckoEnabled &&
              selectedRegion?.site_type === 'edge' && (
                <TooltipIcon
                  icon={<EdgeServer />}
                  status="other"
                  sxTooltipIcon={sxEdgeIcon}
                  text="This region is an Edge server."
                />
              ),
            required,
            startAdornment: selectedRegion && (
              <StyledFlagContainer>
                <Flag country={selectedRegion?.data.country} />
              </StyledFlagContainer>
            ),
          },
          tooltipText: helperText,
        }}
        autoHighlight
        clearOnBlur
        data-testid="region-select"
        disableClearable={!isClearable}
        disabled={disabled}
        errorText={errorText}
        getOptionDisabled={(option: RegionSelectOption) => option.unavailable}
        groupBy={(option: RegionSelectOption) => option.data.region}
        label={label ?? 'Region'}
        loading={accountAvailabilityLoading}
        loadingText="Loading regions..."
        noOptionsText="No results"
        options={options}
        placeholder="Select a Region"
        value={selectedRegion}
      />
      {showGeckoHelperText && ( // @TODO Gecko MVP: Add docs link
        <StyledEdgeBox>
          <EdgeServer />
          <Typography sx={{ textWrap: 'nowrap' }}>
            {' '}
            Indicates an Edge server region. <Link to="#">Learn more</Link>
          </Typography>
        </StyledEdgeBox>
      )}
    </StyledAutocompleteContainer>
  );
});
