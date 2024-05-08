import { parseArgs } from 'node:util';

import chalk from 'chalk';

export function getFilePathFromCLI() {
  try {
    const { values: { file } } = parseArgs({
      options: {
        file: {
          type: 'string',
          alias: 'f',
        },
      },
    });

    if (!file) {
      throw new Error('Flag --file requires a file path to be specified.');
    }

    return file;
  } catch (error) {
    console.error(chalk.red('Error: Please provide a valid file path as an argument using -f or --file'));
    process.exit(1);
  }
}