import {
  withUnimodules,
  getModuleFileExtensionsWithoutDotPrefix,
} from '@expo/webpack-config/utils';

export const pageExtensions = getModuleFileExtensionsWithoutDotPrefix('web');

export const devSwSrc = require.resolve(`@expo/webpack-config/web-default/expo-service-worker.js`);

export { withUnimodules };
