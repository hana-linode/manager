import * as React from 'react';

import EdgeServer from 'src/assets/icons/entityIcons/edge-server.svg';
import { Flag } from 'src/components/Flag';
import { Notice } from 'src/components/Notice/Notice';
import { RegionSelect } from 'src/components/RegionSelect/RegionSelect';
import { sxEdgeIcon } from 'src/components/RegionSelect/RegionSelect.styles';
import { useIsEdgeRegion } from 'src/components/RegionSelect/RegionSelect.utils';
import { TooltipIcon } from 'src/components/TooltipIcon';
import { Typography } from 'src/components/Typography';
import { useRegionsQuery } from 'src/queries/regions';
import { useTypeQuery } from 'src/queries/types';
import { getRegionCountryGroup } from 'src/utilities/formatRegion';
import { getLinodeBackupPrice } from 'src/utilities/pricing/backups';
import { PRICES_RELOAD_ERROR_NOTICE_TEXT } from 'src/utilities/pricing/constants';
import {
  getLinodeRegionPrice,
  isLinodeTypeDifferentPriceInSelectedRegion,
} from 'src/utilities/pricing/linodes';

import {
  StyledDiv,
  StyledMigrationBox,
  StyledMigrationContainer,
  StyledPaper,
  StyledSpan,
} from './ConfigureForm.styles';
import { MigrationPricing } from './MigrationPricing';

import type { MigrationPricingProps } from './MigrationPricing';
import type { Linode, PriceObject } from '@linode/api-v4';

interface Props {
  backupEnabled: Linode['backups']['enabled'];
  currentRegion: string;
  errorText?: string;
  handleSelectRegion: (id: string) => void;
  helperText?: string;
  linodeType: Linode['type'];
  selectedRegion: null | string;
}

export type MigratePricePanelType = 'current' | 'new';

export const ConfigureForm = React.memo((props: Props) => {
  const {
    backupEnabled,
    currentRegion,
    errorText,
    handleSelectRegion,
    helperText,
    linodeType,
    selectedRegion,
  } = props;

  const { data: regions } = useRegionsQuery();
  const { data: currentLinodeType } = useTypeQuery(
    linodeType || '',
    Boolean(linodeType)
  );
  const currentActualRegion = regions?.find((r) => r.id === currentRegion);
  const country =
    regions?.find((thisRegion) => thisRegion.id == currentRegion)?.country ??
    'us';
  const shouldDisplayPriceComparison = Boolean(
    selectedRegion &&
      isLinodeTypeDifferentPriceInSelectedRegion({
        regionA: currentRegion,
        regionB: selectedRegion,
        type: currentLinodeType,
      })
  );

  const currentRegionPrice: PriceObject | undefined = getLinodeRegionPrice(
    currentLinodeType,
    currentRegion
  );

  const selectedRegionPrice: PriceObject | undefined = getLinodeRegionPrice(
    currentLinodeType,
    selectedRegion
  );

  const panelPrice = React.useCallback(
    (
      region: string,
      regionPrice: PriceObject | undefined,
      panelType: MigratePricePanelType
    ): MigrationPricingProps => {
      const backupPriceDisplay = (region: string) =>
        currentLinodeType && backupEnabled
          ? getLinodeBackupPrice(currentLinodeType, region)
          : 'disabled';

      return {
        backups: backupPriceDisplay(region),
        hourly: regionPrice?.hourly,
        monthly: regionPrice?.monthly,
        panelType,
      };
    },
    [backupEnabled, currentLinodeType]
  );

  const linodeIsInEdgeRegion = useIsEdgeRegion(regions ?? [], currentRegion);

  const filterRegions = () => {
    if (linodeIsInEdgeRegion) {
      // edge regions can only be migrated to other edge regions
      return regions?.filter(
        (eachRegion) =>
          eachRegion.id !== currentRegion && eachRegion.site_type === 'edge'
      );
    }
    return regions?.filter((eachRegion) => eachRegion.id !== currentRegion);
  };

  return (
    <StyledPaper>
      <Typography variant="h3">Configure Migration</Typography>
      <StyledMigrationContainer>
        <StyledMigrationBox>
          <StyledSpan>Current Region</StyledSpan>
          <StyledDiv>
            <Flag country={country} />
            <Typography>{`${getRegionCountryGroup(currentActualRegion)}: ${
              currentActualRegion?.label ?? currentRegion
            }`}</Typography>
            {linodeIsInEdgeRegion && (
              <TooltipIcon
                icon={<EdgeServer />}
                status="other"
                sxTooltipIcon={sxEdgeIcon}
                text="This region is an Edge server."
              />
            )}
          </StyledDiv>
          {shouldDisplayPriceComparison && (
            <MigrationPricing
              {...panelPrice(currentRegion, currentRegionPrice, 'current')}
            />
          )}
        </StyledMigrationBox>

        <StyledMigrationBox>
          <RegionSelect
            textFieldProps={{
              helperText,
            }}
            currentCapability="Linodes"
            errorText={errorText}
            geckoEnabled={linodeIsInEdgeRegion}
            handleSelection={handleSelectRegion}
            label="New Region"
            regions={filterRegions() ?? []}
            selectedId={selectedRegion}
          />
          {shouldDisplayPriceComparison && selectedRegion && (
            <MigrationPricing
              {...panelPrice(selectedRegion, selectedRegionPrice, 'new')}
            />
          )}
        </StyledMigrationBox>
      </StyledMigrationContainer>
      {!currentRegionPrice && selectedRegion && (
        <Notice
          spacingBottom={16}
          spacingTop={8}
          text={PRICES_RELOAD_ERROR_NOTICE_TEXT}
          variant="error"
        />
      )}
    </StyledPaper>
  );
});
