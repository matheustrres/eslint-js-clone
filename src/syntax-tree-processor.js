export class SyntaxTreeProcessor {
  #filePath;
  #errors = new Map();
  #messages = {
    singleQuote: () => 'use single quotes instead of double quotes',
  }

  static #validate(filePath) {
    if (!filePath || typeof filePath !== 'string') {
      throw new TypeError('Argument {filePath} is required and must be a string.')
    }
  }

  constructor({ filePath }) {
    SyntaxTreeProcessor.#validate(filePath);

    this.#filePath = filePath;
  }

  #storeError(message, { line, column }) {
    const errorLocation = `${this.#filePath}:${line}:${column + 1}`;

    this.#errors.set(errorLocation, { message, errorLocation });
  }

  #handleLiteral(nodeDeclaration) {
    if (!(nodeDeclaration.raw && typeof nodeDeclaration.value === 'string')) return;

    if (!nodeDeclaration.raw.includes(`"`)) return;

    nodeDeclaration.raw = nodeDeclaration.raw.replace(/"/g, "'");

    const { line, column } = nodeDeclaration.loc.start;

    this.#storeError(this.#messages.singleQuote(), { line, column });
  }

  #traverse(nodeDeclaration) {
    let hooks = {
      Literal: (node) => this.#handleLiteral(node),
    }

    hooks[nodeDeclaration?.type]?.(nodeDeclaration)

    for (let key in nodeDeclaration) {
      if (typeof nodeDeclaration[key] !== 'object') continue;

      this.#traverse(nodeDeclaration[key]);
    }
  }

  process({ ast }) {
    this.#traverse(ast);

    return [...this.#errors.values()];
  }
}