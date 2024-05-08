export class SyntaxTreeProcessor {
  #filePath;
  #errors = new Map();

  static #validate(filePath) {
    if (!filePath || typeof filePath !== 'string') {
      throw new TypeError('Argument {filePath} is required and must be a string.')
    }
  }

  constructor({ filePath }) {
    SyntaxTreeProcessor.#validate(filePath);

    this.#filePath = filePath;
  }

  #handleLiteral(nodeDeclaration) {
    if (!(nodeDeclaration.raw && typeof nodeDeclaration.value === 'string')) return;

    if (!nodeDeclaration.raw.includes(`"`)) return;

    nodeDeclaration.raw = nodeDeclaration.raw.replace(/"/g, "'")
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