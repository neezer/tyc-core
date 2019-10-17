import { noop } from "../utils.mjs";

export { reporter };

const reporter = {
  success: () => noop,
  failure: () => noop,
  noAssertions: () => noop,
  summary: () => noop
};
