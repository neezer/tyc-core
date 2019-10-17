import { assert } from "./plugins/assert.mjs";
import { reporter } from "./plugins/reporter.mjs";
import { format } from "./plugins/duration-formatter.mjs";
import { makeTest } from "./test.mjs";

const tests = new Map([]);

const test = makeTest(tests, {
  assert,
  reporter,
  durationFormatter: format
});

export default test;

process.on("exit", () => {
  reporter.summary(tests, format);
});

process.on("unhandledRejection", reporter.uncaughtException);
