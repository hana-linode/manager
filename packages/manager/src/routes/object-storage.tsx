import { Outlet, createRoute } from '@tanstack/react-router';
import React from 'react';

import { ProductInformationBanner } from 'src/components/ProductInformationBanner/ProductInformationBanner';
import { SuspenseLoader } from 'src/components/SuspenseLoader';

import { rootRoute } from './root';

export const ObjectStorageRoutes = () => {
  return (
    <React.Suspense fallback={<SuspenseLoader />}>
      <ProductInformationBanner bannerLocation="Object Storage" />
      <Outlet />
    </React.Suspense>
  );
};

export const objectStorageRoute = createRoute({
  component: ObjectStorageRoutes,
  getParentRoute: () => rootRoute,
  path: 'object-storage',
});

const objectStorageIndexRoute = createRoute({
  getParentRoute: () => objectStorageRoute,
  path: '/',
}).lazy(() =>
  import('src/features/ObjectStorage/ObjectStorageLanding').then(
    (m) => m.objectStorageLandingLazyRoute
  )
);

const objectStorageBucketsRoute = createRoute({
  getParentRoute: () => objectStorageRoute,
  path: 'buckets',
}).lazy(() =>
  import('src/features/ObjectStorage/ObjectStorageLanding').then(
    (m) => m.objectStorageLandingLazyRoute
  )
);

const objectStorageAccessKeysRoute = createRoute({
  getParentRoute: () => objectStorageRoute,
  path: 'access-keys',
}).lazy(() =>
  import('src/features/ObjectStorage/ObjectStorageLanding').then(
    (m) => m.objectStorageLandingLazyRoute
  )
);

const objectStorageBucketCreateRoute = createRoute({
  getParentRoute: () => objectStorageBucketsRoute,
  path: 'create',
}).lazy(() =>
  import('src/features/ObjectStorage/ObjectStorageLanding').then(
    (m) => m.objectStorageLandingLazyRoute
  )
);

const objectStorageBucketDetailRoute = createRoute({
  getParentRoute: () => objectStorageBucketsRoute,
  path: '$clusterId/$bucketName',
}).lazy(() =>
  import('src/features/ObjectStorage/BucketDetail').then(
    (m) => m.bucketDetailLandingLazyRoute
  )
);

const objectStorageBucketDetailObjectsRoute = createRoute({
  getParentRoute: () => objectStorageBucketDetailRoute,
  path: 'objects',
}).lazy(() =>
  import('src/features/ObjectStorage/BucketDetail').then(
    (m) => m.bucketDetailLandingLazyRoute
  )
);

const objectStorageBucketDetailAccessRoute = createRoute({
  getParentRoute: () => objectStorageBucketDetailRoute,
  path: 'access',
}).lazy(() =>
  import('src/features/ObjectStorage/BucketDetail').then(
    (m) => m.bucketDetailLandingLazyRoute
  )
);

const objectStorageBucketSSLRoute = createRoute({
  getParentRoute: () => objectStorageBucketDetailRoute,
  path: 'ssl',
}).lazy(() =>
  import('src/features/ObjectStorage/BucketDetail').then(
    (m) => m.bucketDetailLandingLazyRoute
  )
);
export const objectStorageRouteTree = objectStorageRoute.addChildren([
  objectStorageIndexRoute,
  objectStorageBucketsRoute.addChildren([
    objectStorageBucketDetailRoute.addChildren([
      objectStorageBucketDetailObjectsRoute,
      objectStorageBucketDetailAccessRoute,
      objectStorageBucketSSLRoute,
    ]),
    objectStorageBucketCreateRoute,
  ]),
  objectStorageAccessKeysRoute,
]);
