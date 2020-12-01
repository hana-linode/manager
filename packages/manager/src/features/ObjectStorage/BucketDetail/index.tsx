import { ObjectStorageClusterID } from '@linode/api-v4/lib/object-storage';
import * as React from 'react';
import { matchPath, RouteComponentProps } from 'react-router-dom';
import Breadcrumb from 'src/components/Breadcrumb';
import Box from 'src/components/core/Box';
import TabPanels from 'src/components/core/ReachTabPanels';
import Tabs from 'src/components/core/ReachTabs';
import { makeStyles, Theme } from 'src/components/core/styles';
import DocumentationButton from 'src/components/DocumentationButton';
import SafeTabPanel from 'src/components/SafeTabPanel';
import SuspenseLoader from 'src/components/SuspenseLoader';
import TabLinkList from 'src/components/TabLinkList';

const ObjectList = React.lazy(() => import('./BucketDetail'));
// const Access = React.lazy(() => import('./BucketAccess'));
const BucketSSL = React.lazy(() => import('./BucketSSL'));

const useStyles = makeStyles((theme: Theme) => ({
  headerBox: {
    marginBottom: theme.spacing(2)
  }
}));

interface MatchProps {
  clusterId: ObjectStorageClusterID;
  bucketName: string;
}

type CombinedProps = RouteComponentProps<MatchProps>;

export const BucketDetailLanding: React.FC<CombinedProps> = props => {
  const classes = useStyles();
  const matches = (p: string) => {
    return Boolean(matchPath(p, { path: props.location.pathname }));
  };
  const { bucketName, clusterId } = props.match.params;

  const tabs = [
    {
      title: 'Objects',
      routeName: `${props.match.url}/objects`
    },
    // {
    //   title: 'Access',
    //   routeName: `${props.match.url}/access`
    // },
    {
      title: 'SSL/TLS',
      routeName: `${props.match.url}/ssl`
    }
  ];

  const [index, setIndex] = React.useState(
    tabs.findIndex(tab => matches(tab.routeName)) || 0
  );

  const handleTabChange = (index: number) => {
    setIndex(index);
    props.history.push(tabs[index].routeName);
  };

  return (
    <>
      <Box
        display="flex"
        flexDirection="row"
        justifyContent="space-between"
        className={classes.headerBox}
      >
        <Breadcrumb
          // The actual pathname doesn't match what we want in the Breadcrumb,
          // so we create a custom one.
          pathname={`/object-storage/${bucketName}`}
          crumbOverrides={[
            {
              position: 1,
              label: 'Object Storage'
            }
          ]}
          labelOptions={{ noCap: true }}
        />
        <DocumentationButton href="https://www.linode.com/docs/platform/object-storage/" />
      </Box>

      <Tabs index={index} onChange={handleTabChange}>
        <TabLinkList tabs={tabs} />

        <React.Suspense fallback={<SuspenseLoader />}>
          <TabPanels>
            <SafeTabPanel index={0}>
              <ObjectList {...props} />
            </SafeTabPanel>
            {/* <SafeTabPanel index={1}>
              <Access />
            </SafeTabPanel> */}
            <SafeTabPanel index={1}>
              <BucketSSL bucketName={bucketName} clusterId={clusterId} />
            </SafeTabPanel>
          </TabPanels>
        </React.Suspense>
      </Tabs>
    </>
  );
};

export default React.memo(BucketDetailLanding);
