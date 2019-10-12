// Import withOffline for workbox support
const withOffline = require('next-offline');
const {
  pageExtensions,
  withUnimodules,
  // import the Expo service worker for notifications support
  devSwSrc,
} = require('@expo/next-adapter/config');

module.exports = withOffline({
  devSwSrc,
  pageExtensions,
  webpack(config, options) {
    // Further custom configuration here
    return withUnimodules(config, {
      projectRoot: __dirname,
    });
  },
});
