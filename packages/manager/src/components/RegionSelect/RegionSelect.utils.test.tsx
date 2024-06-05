import { accountAvailabilityFactory, regionFactory } from 'src/factories';

import {
  getRegionOptions,
  getSelectedRegionById,
  getSelectedRegionsByIds,
  isRegionOptionUnavailable,
} from './RegionSelect.utils';

import type {
  RegionFilterValue,
  RegionSelectOption,
} from './RegionSelect.types';
import type { Region } from '@linode/api-v4';

const accountAvailabilityData = [
  accountAvailabilityFactory.build({
    region: 'ap-south',
    unavailable: ['Linodes'],
  }),
];

const regions: Region[] = [
  regionFactory.build({
    capabilities: ['Linodes'],
    country: 'us',
    id: 'us-1',
    label: 'US Location',
  }),
  regionFactory.build({
    capabilities: ['Linodes'],
    country: 'ca',
    id: 'ca-1',
    label: 'CA Location',
  }),
  regionFactory.build({
    capabilities: ['Linodes'],
    country: 'jp',
    id: 'jp-1',
    label: 'JP Location',
  }),
];

const distributedRegions = [
  ...regions,
  regionFactory.build({
    capabilities: ['Linodes'],
    country: 'us',
    id: 'us-den-10',
    label: 'Gecko Distributed Region Test',
    site_type: 'distributed',
  }),
  regionFactory.build({
    capabilities: ['Linodes'],
    country: 'de',
    id: 'de-den-11',
    label: 'Gecko Distributed Region Test 2',
    site_type: 'distributed',
  }),
];

const expectedRegions: RegionSelectOption[] = [
  {
    data: { country: 'ca', region: 'North America' },
    disabledProps: {
      disabled: false,
    },
    label: 'CA Location (ca-1)',
    site_type: 'core',
    value: 'ca-1',
  },
  {
    data: {
      country: 'us',
      region: 'North America',
    },
    disabledProps: {
      disabled: false,
    },
    label: 'US Location (us-1)',
    site_type: 'core',
    value: 'us-1',
  },
  {
    data: { country: 'jp', region: 'Asia' },
    disabledProps: {
      disabled: false,
    },
    label: 'JP Location (jp-1)',
    site_type: 'core',
    value: 'jp-1',
  },
];

const expectedDistributedRegions = [
  {
    data: { country: 'us', region: 'North America' },
    disabledProps: {
      disabled: false,
    },
    label: 'Gecko Distributed Region Test (us-den-10)',
    site_type: 'distributed',
    value: 'us-den-10',
  },
  {
    data: { country: 'de', region: 'Europe' },
    disabledProps: {
      disabled: false,
    },
    label: 'Gecko Distributed Region Test 2 (de-den-11)',
    site_type: 'distributed',
    value: 'de-den-11',
  },
];

describe('getRegionOptions', () => {
  it('should return an empty array if no regions are provided', () => {
    const regions: Region[] = [];
    const result = getRegionOptions({
      accountAvailabilityData,
      currentCapability: 'Linodes',
      regions,
    });

    expect(result).toEqual([]);
  });

  it('should return a sorted array of OptionType objects with North America first', () => {
    const result: RegionSelectOption[] = getRegionOptions({
      accountAvailabilityData,
      currentCapability: 'Linodes',
      regions,
    });

    expect(result).toEqual(expectedRegions);
  });

  it('should filter out regions that do not have the currentCapability if currentCapability is provided', () => {
    const regionsToFilter: Region[] = [
      ...regions,
      regionFactory.build({
        capabilities: ['Object Storage'],
        country: 'pe',
        id: 'peru-1',
        label: 'Peru Location',
      }),
    ];

    const result: RegionSelectOption[] = getRegionOptions({
      accountAvailabilityData,
      currentCapability: 'Linodes',
      regions: regionsToFilter,
    });

    expect(result).toEqual(expectedRegions);
  });

  it('should filter out distributed regions if regionFilter is core', () => {
    const result: RegionSelectOption[] = getRegionOptions({
      accountAvailabilityData,
      currentCapability: 'Linodes',
      regionFilter: 'core',
      regions: distributedRegions,
    });

    expect(result).toEqual(expectedRegions);
  });

  it('should filter out core regions if regionFilter is "distributed"', () => {
    const result: RegionSelectOption[] = getRegionOptions({
      accountAvailabilityData,
      currentCapability: 'Linodes',
      regionFilter: 'distributed',
      regions: distributedRegions,
    });

    expect(result).toEqual(expectedDistributedRegions);
  });

  it('should filter out distributed regions by continent if the regionFilter includes continent', () => {
    const resultNA: RegionSelectOption[] = getRegionOptions({
      accountAvailabilityData,
      currentCapability: 'Linodes',
      regionFilter: 'distributed-NA' as RegionFilterValue,
      regions: distributedRegions,
    });
    const resultEU: RegionSelectOption[] = getRegionOptions({
      accountAvailabilityData,
      currentCapability: 'Linodes',
      regionFilter: 'distributed-EU' as RegionFilterValue,
      regions: distributedRegions,
    });

    expect(resultNA).toEqual([expectedDistributedRegions[0]]);
    expect(resultEU).toEqual([expectedDistributedRegions[1]]);
  });

  it('should not filter out distributed regions by continent if the regionFilter includes all', () => {
    const resultAll: RegionSelectOption[] = getRegionOptions({
      accountAvailabilityData,
      currentCapability: 'Linodes',
      regionFilter: 'distributed-ALL' as RegionFilterValue,
      regions: distributedRegions,
    });

    expect(resultAll).toEqual(expectedDistributedRegions);
  });

  it('should not filter out any regions if regionFilter is undefined', () => {
    const expectedRegionsWithDistributed = [
      expectedRegions[0],
      expectedDistributedRegions[0],
      expectedRegions[1],
      expectedRegions[2],
      expectedDistributedRegions[1],
    ];

    const result: RegionSelectOption[] = getRegionOptions({
      accountAvailabilityData,
      currentCapability: 'Linodes',
      regionFilter: undefined,
      regions: distributedRegions,
    });

    expect(result).toEqual(expectedRegionsWithDistributed);
  });

  it('should have its option disabled if the region is unavailable', () => {
    const _regions = [
      ...regions,
      regionFactory.build({
        capabilities: ['Linodes'],
        country: 'us',
        id: 'ap-south',
        label: 'US Location 2',
      }),
    ];

    const result: RegionSelectOption[] = getRegionOptions({
      accountAvailabilityData,
      currentCapability: 'Linodes',
      regions: _regions,
    });

    const unavailableRegion = result.find(
      (region) => region.value === 'ap-south'
    );

    expect(unavailableRegion?.disabledProps?.disabled).toBe(true);
  });

  it('should have its option disabled if `handleDisabledRegion` is passed', () => {
    const result: RegionSelectOption[] = getRegionOptions({
      accountAvailabilityData,
      currentCapability: 'Linodes',
      handleDisabledRegion: (region) => ({
        ...region,
        disabled: true,
      }),
      regions,
    });

    const unavailableRegion = result.find((region) => region.value === 'us-1');

    expect(unavailableRegion?.disabledProps?.disabled).toBe(true);
  });
});

describe('getSelectedRegionById', () => {
  it('should return the correct OptionType for a selected region', () => {
    const selectedRegionId = 'us-1';

    const result = getSelectedRegionById({
      accountAvailabilityData,
      currentCapability: 'Linodes',
      regions,
      selectedRegionId,
    });

    // Expected result
    const expected = {
      data: {
        country: 'us',
        region: 'North America',
      },
      label: 'US Location (us-1)',
      site_type: 'core',
      value: 'us-1',
    };

    expect(result).toEqual(expected);
  });

  it('should return undefined for an unknown region', () => {
    const selectedRegionId = 'unknown';

    const result = getSelectedRegionById({
      accountAvailabilityData,
      currentCapability: 'Linodes',
      regions,
      selectedRegionId,
    });

    expect(result).toBeUndefined();
  });
});

describe('getRegionOptionAvailability', () => {
  it('should return true if the region is not available', () => {
    const result = isRegionOptionUnavailable({
      accountAvailabilityData,
      currentCapability: 'Linodes',
      region: regionFactory.build({
        id: 'ap-south',
      }),
    });

    expect(result).toBe(true);
  });

  it('should return false if the region is available', () => {
    const result = isRegionOptionUnavailable({
      accountAvailabilityData,
      currentCapability: 'Linodes',
      region: regionFactory.build({
        id: 'us-east',
      }),
    });

    expect(result).toBe(false);
  });
});

describe('getSelectedRegionsByIds', () => {
  it('should return an array of RegionSelectOptions for the given selectedRegionIds', () => {
    const selectedRegionIds = ['us-1', 'ca-1'];

    const result = getSelectedRegionsByIds({
      accountAvailabilityData,
      currentCapability: 'Linodes',
      regions,
      selectedRegionIds,
    });

    const expected = [
      {
        data: {
          country: 'us',
          region: 'North America',
        },
        label: 'US Location (us-1)',
        site_type: 'core',
        value: 'us-1',
      },
      {
        data: {
          country: 'ca',
          region: 'North America',
        },
        label: 'CA Location (ca-1)',
        site_type: 'core',
        value: 'ca-1',
      },
    ];

    expect(result).toEqual(expected);
  });

  it('should exclude regions that are not found in the regions array', () => {
    const selectedRegionIds = ['us-1', 'non-existent-region'];

    const result = getSelectedRegionsByIds({
      accountAvailabilityData,
      currentCapability: 'Linodes',
      regions,
      selectedRegionIds,
    });

    const expected = [
      {
        data: {
          country: 'us',
          region: 'North America',
        },
        label: 'US Location (us-1)',
        site_type: 'core',
        value: 'us-1',
      },
    ];

    expect(result).toEqual(expected);
  });
});
