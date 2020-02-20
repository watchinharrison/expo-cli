#!/usr/bin/env node
import chalk from 'chalk';
import { Command } from 'commander';
import fs from 'fs-extra';
import { relative, resolve } from 'path';

import {
  generateAndroidAppIconsAsync,
  generateIosAppIconsAsync,
  generateWindowsAppIconsAsync,
} from './generateAppIconsAsync';
import { generateFaviconsAsync } from './generateFaviconsAsync';
import { generateSplashScreensAsync } from './generateSplashScreensAsync';
import shouldUpdate from './update';

let projectDirectory: string = '';

async function commandDidThrowAsync(reason: any) {
  console.log();
  console.log('Aborting run');
  if (reason.command) {
    console.log(`  ${chalk.magenta(reason.command)} has failed.`);
  } else {
    console.log(chalk.red`An unexpected error was encountered. Please report it as a bug:`);
    console.log(reason);
  }
  console.log();

  await shouldUpdate();

  process.exit(1);
}

const packageJson = () => require('../package.json');

const program = new Command(packageJson().name).version(packageJson().version);

program
  .command('init <project-directory>')
  .usage(`${chalk.green('init <project-directory>')} [options]`)
  .description('Compress the assets in your Expo project')
  .option('--favicon', 'Generate favicons')
  .option('--icon', 'PWA icons')
  .option('--splash', 'PWA splash screens')
  .option('--src <image>', 'Source image')
  .option('-o, --output <folder>', 'Output directory')
  .action((inputProjectDirectory: string) => {
    projectDirectory = inputProjectDirectory.trim();
    init()
      .then(shouldUpdate)
      .catch(commandDidThrowAsync);
  });

program
  .command('icon <src>')
  .description('Generate the homescreen icons for a PWA')
  .option('-o, --output <folder>', 'Output directory', 'public')
  .option('-p, --public <folder>', 'Public folder. Default: <output>')
  .option('--platform <platform>', 'Platform to generate for: ios, android, ms')
  .option('--resize <mode>', 'Resize mode to use', 'contain')
  .option('--color <color>', 'Background color for images (must be opaque)')
  .action((src: string, options) => {
    if (!src) throw new Error('pass image path with --src <path.png>');
    icon({
      src,
      output: options.output,
      publicPath: options.public || options.output,
      platform: options.platform,
      resizeMode: options.resize,
      color: options.color,
    })
      .then(shouldUpdate)
      .catch(commandDidThrowAsync);
  });

program
  .command('favicon <src>')
  .description('Generate the favicons for a website')
  .option('-o, --output <folder>', 'Output directory', 'public')
  .option('-p, --public <folder>', 'Public folder. Default: <output>')
  .action((src: string, options) => {
    if (!src) throw new Error('pass image path with --src <path.png>');
    favicon({ src, output: options.output, publicPath: options.public || options.output })
      .then(shouldUpdate)
      .catch(commandDidThrowAsync);
  });

program
  .command('splash <src>')
  .description('Generate the iOS splash screens for a PWA')
  .option('-o, --output <folder>', 'Output directory', 'public')
  .option('-p, --public <folder>', 'Public folder. Default: <output>')
  .option('--resize <mode>', 'Resize mode to use', 'contain')
  .option('--color <color>', 'Background color of the image', 'white')
  .action((src: string, options) => {
    if (!src) throw new Error('pass image path with --src <path.png>');
    splash({
      src,
      output: options.output,
      publicPath: options.public || options.output,
      resizeMode: options.resize,
      color: options.color,
    })
      .then(shouldUpdate)
      .catch(commandDidThrowAsync);
  });

program.parse(process.argv);

async function splash({
  src,
  output,
  publicPath,
  color,
  resizeMode,
}: {
  src: string;
  output: string;
  publicPath: string;
  color: string;
  resizeMode: string;
}) {
  const sourcePath = resolve(src);
  const outputPath = resolve(output);
  const _publicPath = resolve(publicPath);
  fs.removeSync(outputPath);
  fs.ensureDirSync(outputPath);

  console.log('ff', relative(_publicPath, outputPath));
  let meta: string[] = await generateSplashScreensAsync(
    sourcePath,
    outputPath,
    relative(_publicPath, outputPath),
    color,
    resizeMode
  );
  console.log('meta: ', meta);
}
async function favicon({
  src,
  output,
  publicPath,
}: {
  src: string;
  output: string;
  publicPath: string;
}) {
  const sourcePath = resolve(src);
  const outputPath = resolve(output);
  const _publicPath = resolve(publicPath);
  fs.removeSync(outputPath);
  fs.ensureDirSync(outputPath);

  console.log('ff', relative(_publicPath, outputPath));
  let meta: string[] = await generateFaviconsAsync(
    sourcePath,
    outputPath,
    relative(_publicPath, outputPath)
  );
  console.log('meta: ', meta);
}
async function icon({
  src,
  output,
  publicPath,
  platform,
  color,
  resizeMode,
}: {
  src: string;
  output: string;
  publicPath: string;
  platform: string;
  color: string;
  resizeMode: string;
}) {
  const sourcePath = resolve(src);
  const outputPath = resolve(output);
  const _publicPath = resolve(publicPath);
  fs.removeSync(outputPath);
  fs.ensureDirSync(outputPath);

  // @ts-ignore
  const genAsync = {
    android: generateAndroidAppIconsAsync,
    ios: generateIosAppIconsAsync,
    ms: generateWindowsAppIconsAsync,
  }[platform] as any;

  let meta: string[] = await genAsync(
    sourcePath,
    outputPath,
    relative(_publicPath, outputPath),
    color,
    resizeMode
  );
  console.log('meta: ', meta);
}

async function init() {
  // Space out first line
  // console.log(program.src, program.asset);

  if (typeof projectDirectory === 'string') {
    projectDirectory = projectDirectory.trim();
  }

  if (!program.src) {
    throw new Error('pass image path with --src <path.png>');
  }

  const sourcePath = resolve(program.src);
  const outputPath = resolve(program.output || 'favicons/');

  fs.removeSync(outputPath);
  fs.ensureDirSync(outputPath);
  console.log('generate: ', sourcePath, outputPath);
  // console.log('output: ', outputPath);

  let meta: string[] = [];
  // if (program.favicon) {
  //   const faviconsMeta = await generateFaviconsAsync(sourcePath, outputPath);
  //   meta.push(...faviconsMeta);
  // }
  // if (program.icon) {
  //   const info = await generateAppIconsAsync(sourcePath, outputPath);
  //   meta.push(...info.meta);
  // }
  // if (program.splash) {
  //   meta.push(...(await generateSplashScreensAsync(outputPath, sourcePath, 'apple')));
  // }
  console.log('META: ');
  console.log(meta);

  // generateIcon(sourcePath, outputPath);
}
