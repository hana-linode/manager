import { VPC } from '@linode/api-v4/lib';
import { useMediaQuery } from '@mui/material';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Unstable_Grid2';
import { useTheme } from '@mui/material/styles';
import * as React from 'react';
import { HashLink } from 'react-router-hash-link';

import { Box } from 'src/components/Box';
import { Link } from 'src/components/Link';
import { Typography, TypographyProps } from 'src/components/Typography';
import { AccessTable } from 'src/features/Linodes/AccessTable';
import { useProfile } from 'src/queries/profile';
import { pluralize } from 'src/utilities/pluralize';

import {
  StyledBodyGrid,
  StyledColumnLabelGrid,
  StyledLabelBox,
  StyledListItem,
  StyledSummaryGrid,
  StyledVPCBox,
  sxLastListItem,
} from './LinodeEntityDetail.styles';
import { ipv4TableID } from './LinodesDetail/LinodeNetworking/LinodeIPAddresses';
import { lishLink, sshLink } from './LinodesDetail/utilities';
import { LinodeHandlers } from './LinodesLanding/LinodesLanding';

import type { Interface, Linode } from '@linode/api-v4/lib/linodes/types';
import type { Subnet } from '@linode/api-v4/lib/vpcs';

interface LinodeEntityDetailProps {
  id: number;
  isSummaryView?: boolean;
  linode: Linode;
  openTagDrawer: (tags: string[]) => void;
  variant?: TypographyProps['variant'];
}

export type Props = LinodeEntityDetailProps & {
  handlers: LinodeHandlers;
};

export interface BodyProps {
  configInterfaceWithVPC?: Interface;
  displayVPCSection: boolean;
  gbRAM: number;
  gbStorage: number;
  ipv4: Linode['ipv4'];
  ipv6: Linode['ipv6'];
  isVPCOnlyLinode: boolean;
  linodeId: number;
  linodeLabel: string;
  linodePlan: null | string;
  linodeRegionDisplay: null | string;
  numCPUs: number;
  numVolumes: number;
  region: string;
  vpcLinodeIsAssignedTo?: VPC;
}

export const LinodeEntityDetailBody = React.memo((props: BodyProps) => {
  const {
    configInterfaceWithVPC,
    displayVPCSection,
    gbRAM,
    gbStorage,
    ipv4,
    ipv6,
    isVPCOnlyLinode,
    linodeId,
    linodeLabel,
    linodePlan,
    linodeRegionDisplay,
    numCPUs,
    numVolumes,
    region,
    vpcLinodeIsAssignedTo,
  } = props;

  const { data: profile } = useProfile();
  const username = profile?.username ?? 'none';

  const theme = useTheme();

  // Filter and retrieve subnets associated with a specific Linode ID
  const linodeAssociatedSubnets = vpcLinodeIsAssignedTo?.subnets.filter(
    (subnet) => subnet.linodes.some((linode) => linode.id === linodeId)
  );

  const numIPAddresses = ipv4.length + (ipv6 ? 1 : 0);

  const firstAddress = ipv4[0];

  // If IPv6 is enabled, always use it in the second address slot. Otherwise use
  // the second IPv4 address if it exists.
  const secondAddress = ipv6 ? ipv6 : ipv4.length > 1 ? ipv4[1] : null;
  const matchesLgUp = useMediaQuery(theme.breakpoints.up('lg'));

  return (
    <>
      <StyledBodyGrid container spacing={2} sx={{ mb: 0 }}>
        <Grid
          container
          flexDirection={matchesLgUp ? 'row' : 'column'}
          padding={0}
          sm={4}
          spacing={0}
          xs={12}
        >
          {/* <StyledColumnLabelGrid mb={matchesLgUp ? 0 : 2} xs={12}>
            Summary
          </StyledColumnLabelGrid> */}
          <StyledSummaryGrid container spacing={1}>
            <Card>
              <CardContent sx={{ paddingBottom: '16px !important' }}>
                <Box display="flex" justifyContent="space-between">
                  <Typography
                    color="text.secondary"
                    gutterBottom
                    sx={{ fontSize: 14 }}
                  >
                    {linodePlan}
                  </Typography>
                </Box>
                <Box display="flex" marginTop={2}>
                  <Box marginRight={4}>
                    <Typography color="text.secondary">RAM</Typography>
                    <Typography component="div" variant="h5">
                      {gbRAM} GB
                    </Typography>
                  </Box>
                  <Box marginRight={4}>
                    <Typography color="text.secondary">CPUs</Typography>
                    <Typography component="div" variant="h5">
                      {numCPUs}
                    </Typography>
                  </Box>
                  <Box marginRight={4}>
                    <Typography color="text.secondary">Storage</Typography>
                    <Typography component="div" variant="h5">
                      {gbStorage} GB
                    </Typography>
                  </Box>
                  <Box>
                    <Typography color="text.secondary">Volumes</Typography>
                    <Typography component="div" variant="h5">
                      {numVolumes}
                    </Typography>
                  </Box>
                </Box>
                <Typography color="text.secondary" marginTop={2}>
                  {linodeRegionDisplay}
                </Typography>
              </CardContent>
            </Card>
            {/* <Grid alignItems="center" display="flex" lg={6} sm={12} xs={6}>
              <Typography>
                {pluralize('CPU Core', 'CPU Cores', numCPUs)}
              </Typography>
            </Grid>
            <Grid alignItems="center" display="flex" lg={6} sm={12} xs={6}>
              <Typography>{gbStorage} GB Storage</Typography>
            </Grid>
            <Grid lg={6} sm={12} xs={6}>
              <Typography>{gbRAM} GB RAM</Typography>
            </Grid>
            <Grid lg={6} sm={12} xs={6}>
              <Typography>
                {pluralize('Volume', 'Volumes', numVolumes)}
              </Typography>
            </Grid> */}
          </StyledSummaryGrid>
        </Grid>
        <Grid container sm={8} xs={12}>
          <Grid container xs={12}>
            <AccessTable
              footer={
                numIPAddresses > 2 ? (
                  <Typography
                    sx={{ position: matchesLgUp ? 'absolute' : 'relative' }}
                    variant="body1"
                  >
                    <HashLink
                      to={`/linodes/${linodeId}/networking#${ipv4TableID}`}
                    >
                      View all IP Addresses
                    </HashLink>
                  </Typography>
                ) : undefined
              }
              gridSize={{ lg: 5, xs: 12 }}
              isVPCOnlyLinode={isVPCOnlyLinode}
              rows={[{ text: firstAddress }, { text: secondAddress }]}
              sx={{ padding: 0 }}
              title={`Public IP Address${numIPAddresses > 1 ? 'es' : ''}`}
            />
            <AccessTable
              rows={[
                { heading: 'SSH Access', text: sshLink(ipv4[0]) },
                {
                  heading: 'LISH Console via SSH',
                  text: lishLink(username, region, linodeLabel),
                },
              ]}
              gridSize={{ lg: 7, xs: 12 }}
              isVPCOnlyLinode={isVPCOnlyLinode}
              sx={{ padding: 0, pt: matchesLgUp ? 0 : 2 }}
              title="Access"
            />
          </Grid>
        </Grid>
      </StyledBodyGrid>
      {displayVPCSection && vpcLinodeIsAssignedTo && (
        <Grid
          sx={{
            borderTop: `1px solid ${theme.borderColors.borderTable}`,
            padding: `${theme.spacing(1)} ${theme.spacing(2)}`,
          }}
          container
          direction="column"
          spacing={2}
        >
          <StyledColumnLabelGrid data-testid="vpc-section-title">
            VPC
          </StyledColumnLabelGrid>
          <Grid
            sx={{
              margin: 0,
              padding: '0 0 8px 0',
              [theme.breakpoints.down('md')]: {
                display: 'flex',
                flexDirection: 'column',
                paddingLeft: '8px',
              },
            }}
            container
            direction="row"
            spacing={2}
          >
            <StyledVPCBox>
              <StyledListItem>
                <StyledLabelBox component="span">Label:</StyledLabelBox>{' '}
                <Link
                  data-testid="assigned-vpc-label"
                  to={`/vpcs/${vpcLinodeIsAssignedTo.id}`}
                >
                  {vpcLinodeIsAssignedTo.label}
                </Link>
              </StyledListItem>
            </StyledVPCBox>
            <StyledVPCBox>
              <StyledListItem>
                <StyledLabelBox component="span" data-testid="subnets-string">
                  Subnets:
                </StyledLabelBox>{' '}
                {getSubnetsString(linodeAssociatedSubnets ?? [])}
              </StyledListItem>
            </StyledVPCBox>
            <StyledVPCBox>
              <StyledListItem sx={{ ...sxLastListItem }}>
                <StyledLabelBox component="span" data-testid="vpc-ipv4">
                  VPC IPv4:
                </StyledLabelBox>{' '}
                {configInterfaceWithVPC?.ipv4?.vpc}
              </StyledListItem>
            </StyledVPCBox>
          </Grid>
        </Grid>
      )}
    </>
  );
});

export const getSubnetsString = (data: Subnet[]) => {
  const firstThreeSubnets = data.slice(0, 3);
  const subnetLabels = firstThreeSubnets.map((subnet) => subnet.label);
  const firstThreeSubnetsString = subnetLabels.join(', ');

  return data.length > 3
    ? firstThreeSubnetsString.concat(`, plus ${data.length - 3} more.`)
    : firstThreeSubnetsString;
};
