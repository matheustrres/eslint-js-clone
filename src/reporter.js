import { writeFileSync } from 'node:fs';
import { basename } from 'node:path';

import { generate } from 'astring'
import chalk from 'chalk';

export class Reporter {
  static #validate({ errors, ast, outputFilePath }) {
    if (errors && !Array.isArray(errors)) {
      throw new TypeError('Argument {errors} must be an non-empty array.')
    }

    if (!ast) {
      throw new TypeError('Argument {ast} is required.')
    }

    if (!outputFilePath || typeof outputFilePath !== 'string') {
      throw new TypeError('Argument {outputFilePath} is required and must be a string.')
    }
  }

  static report({ errors, ast, outputFilePath }) {
    Reporter.#validate({ errors, ast, outputFilePath });

    errors
      .sort((a, b) => {
        const [aLine, aColumn] = a.errorLocation.split(':').slice(1);
        const [bLine, bColumn] = b.errorLocation.split(':').slice(1);

        if (aLine !== bLine) return aLine - bLine;

        return aColumn - bColumn;
      })
      .forEach(({ message, errorLocation }) => {
      const errorMessage = `${chalk.red('Error:')} ${message}`;
      const finalMessage = `${errorMessage}\n${chalk.grey(errorLocation)}`;

      console.error(finalMessage);
    });

    const updatedCode = generate(ast);

    writeFileSync(outputFilePath, updatedCode, 'utf-8');

    if (!errors.length) {
      console.log(chalk.green('Linting completed without errors.'));
    } else {
      console.log(chalk.red(`Linting completed with ${errors.length} errors`));
    }

    console.log(
      chalk.green(`Code fixed and saved at ${
        chalk.yellow(`./${basename(outputFilePath)}`)
      }`),
    );
  }
}