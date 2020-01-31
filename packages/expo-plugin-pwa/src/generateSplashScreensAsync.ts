import fs from 'fs-extra';
import path from 'path';

import resizeAsync from './fav/resize';
import { fromStartupImage } from './splash';

export async function generateSplashScreensAsync(
  projectRoot: string,
  src: string,
  dest: string = 'apple'
): Promise<string[]> {
  const destination = path.join(projectRoot, dest);
  await fs.ensureDir(destination);

  const images = fromStartupImage({ src, resizeMode: 'contain', destination, color: 'blue' });
  const meta = await Promise.all(
    images.map(async img => {
      return {
        name: img.name,
        rel: 'apple-touch-startup-image',
        media: img.media,
        href: path.join(dest, img.name),
        //   size,
        //   padding,
        src: (await resizeAsync(
          src,
          'image/png',
          img.size.width,
          img.size.height,
          img.resizeMode,
          img.color || 'white',
          0,
          img.destination
        )) as string,
      };
    })
  );
  return meta.map(meta => {
    return `<link rel="${meta.rel}" href="${meta.href}" media="${meta.media}"></link>`;
  });
}
