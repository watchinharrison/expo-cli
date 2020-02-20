import { ExpoConfig, getConfigForPWA, setCustomConfigPath } from '@expo/config';
import { getAbsolutePathWithProjectRoot } from '@expo/config/paths';
// @ts-ignore: no types found
import pwaManifest from '@pwa/manifest';

import generateMeta from './generate-html';

function isObject(item: any): boolean {
  return typeof item === 'object' && !Array.isArray(item) && item !== null;
}

function createPWAManifestFromExpoConfig(appJson: ExpoConfig): any {
  if (!isObject(appJson)) {
    throw new Error('app.json must be an object');
  }

  const { web = {} } = appJson;

  const manifest: any = {
    // PWA
    background_color: web.backgroundColor,
    description: web.description,
    dir: web.dir,
    display: web.display,
    lang: web.lang,
    name: web.name,
    orientation: web.orientation,
    scope: web.scope,
    short_name: web.shortName,
    start_url: typeof web.startUrl === 'undefined' ? '/?utm_source=web_app_manifest' : web.startUrl,
    theme_color: web.themeColor,
    crossorigin: web.crossorigin,
    // startupImages: web.startupImages,
    // icons: web.icons,
  };

  if (Array.isArray(web.relatedApplications) && web.relatedApplications.length > 0) {
    manifest.related_applications = web.relatedApplications;
    manifest.prefer_related_applications = web.preferRelatedApplications;
  }

  return manifest;
}

export async function generateManifestAsync(options: {
  src: string;
  dest: string;
  publicPath: string;
}): Promise<string[]> {
  const projectRoot = process.cwd();
  setCustomConfigPath(projectRoot, options.src);
  const expoConfig = getConfigForPWA(
    projectRoot,
    (...pathComponents) => getAbsolutePathWithProjectRoot(projectRoot, ...pathComponents),
    {}
  );

  const writtenManifest = pwaManifest.sync({
    // Convert the Expo config into a PWA manifest
    ...createPWAManifestFromExpoConfig(expoConfig),
    // Allow for overrides
    // ...manifest,
  });

  // Write manifest
  pwaManifest.writeSync(options.dest, writtenManifest);

  return [generateMeta.manifest({ href: 'manifest.json' })];
}
