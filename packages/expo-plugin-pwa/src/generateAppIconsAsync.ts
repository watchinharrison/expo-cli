import path from 'path';

import { resizeIconAsync } from './fav/resize';
import generateMeta from './generate-html';

export async function generateAppIconsAsync(
  src: string,
  dest: string
): Promise<{ meta: string[]; manifest: { [key: string]: any } }> {
  const androidIcons = [
    { name: 'android-chrome-192x192', size: 192 },
    { name: 'android-chrome-512x512', size: 512 },
  ];
  const sizes = [
    { name: 'apple-touch-icon', size: 180 },
    ...androidIcons,
    { name: 'mstile-150x150', size: 270, padding: 72 },
  ];

  await Promise.all(
    sizes.map(async ({ name, size, padding }: any) => {
      return {
        name,
        size,
        padding,
        src: (await resizeIconAsync(src, size, path.join(dest, name + '.png'), padding)) as string,
      };
    })
  );
  return {
    meta: [
      generateMeta.appleTouchIcon({ size: sizes[0].size, href: sizes[0].name + '.png' }),
      generateMeta.manifest({ href: 'manifest.json' }),
    ],
    manifest: {
      icons: androidIcons.map(icon => ({
        type: 'image/png',
        sizes: `${icon.size}x${icon.size}`,
        src: `/${icon.name}.png`,
      })),
    },
  };
}
