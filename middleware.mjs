import { noop } from "./utils.mjs";

export { makeMiddleware };

const makeMiddleware = () => ({
  stack: [],
  async exec(ctx, stack = null) {
    stack = Array.isArray(stack) ? stack : this.stack;

    const [head, ...tail] = stack;
    const isTerminal = tail.length === 0;
    const next = isTerminal ? noop : this.exec.bind(this, ctx, tail);

    return head(ctx, next);
  },
  use(fn) {
    this.stack.push(fn);
  }
});
