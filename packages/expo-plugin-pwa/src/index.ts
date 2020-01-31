#!/usr/bin/env node
import chalk from 'chalk';
import { Command } from 'commander';
import fs from 'fs-extra';
import { resolve } from 'path';

import { generateAppIconsAsync } from './generateAppIconsAsync';
import { generateFaviconsAsync } from './generateFaviconsAsync';
import { generateSplashScreensAsync } from './generateSplashScreensAsync';
import shouldUpdate from './update';

let projectDirectory: string = '';

const packageJson = () => require('../package.json');

const program = new Command(packageJson().name)
  .version(packageJson().version)
  .arguments('<project-directory>')
  .usage(`${chalk.green('<project-directory>')} [options]`)
  .description('Compress the assets in your Expo project')
  // TODO: (verbose option): log the include, exclude options
  .option('--favicon', 'Generate favicons')
  .option('--icon', 'PWA icons')
  .option('--splash', 'PWA splash screens')
  .option('--src <image>', 'Source image')
  .option('-o, --output <folder>', 'Output directory')
  .action((inputProjectDirectory: string) => (projectDirectory = inputProjectDirectory))
  .allowUnknownOption()
  .parse(process.argv);

async function run() {
  // Space out first line
  // console.log(program.src, program.asset);

  if (typeof projectDirectory === 'string') {
    projectDirectory = projectDirectory.trim();
  }

  const sourcePath = resolve(program.src);
  const outputPath = resolve(program.output || 'favicons/');

  fs.removeSync(outputPath);
  fs.ensureDirSync(outputPath);
  console.log('generate: ', sourcePath, outputPath);
  // console.log('output: ', outputPath);

  let meta: string[] = [];
  if (program.favicon) {
    const faviconsMeta = await generateFaviconsAsync(sourcePath, outputPath);
    meta.push(...faviconsMeta);
  }
  if (program.icon) {
    const info = await generateAppIconsAsync(sourcePath, outputPath);
    meta.push(...info.meta);
  }
  if (program.splash) {
    meta.push(...(await generateSplashScreensAsync(outputPath, sourcePath, 'apple')));
  }
  console.log('META: ');
  console.log(meta);

  // generateIcon(sourcePath, outputPath);
}

run()
  .then(shouldUpdate)
  .catch(async reason => {
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
  });
