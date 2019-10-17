import { makeMiddleware } from "./middleware.mjs";
import { makeTestReport } from "./test-report.mjs";
import { ensure } from "./utils.mjs";

export { makeTest };

const report = (name, print, format) => async (report, next) => {
  try {
    await next();

    if (report.assertions.length === 0) {
      print.noAssertions(name)();
    } else {
      print.success(name, report, format)();
    }
  } catch (error) {
    print.failure(name, report, format)(error);
  }
};

const collectAssertions = t => async (report, next) => {
  const assertions = [];
  const unwrappedAssert = t.assert;

  t.assert = (assertion, message) => {
    assertions.push(message || "(no message provided)");
    unwrappedAssert(assertion, message);
  };

  const add = () => {
    report.assertions = assertions;
  };

  return ensure(add)(next);
};

const run = (fn, t) =>
  async function runActual() {
    return fn(t);
  };

const instrument = () => async (report, next) => {
  const start = process.hrtime();

  const record = () => {
    report.duration = process.hrtime(start);
  };

  return ensure(record)(next);
};

const makeT = assert => ({ assert });

const exec = async (name, fn, opts) => {
  const t = makeT(opts.assert);
  const testReport = makeTestReport();
  const m = makeMiddleware();

  m.use(report(name, opts.reporter, opts.durationFormatter));
  m.use(instrument());
  m.use(collectAssertions(t));
  m.use(run(fn, t));

  await m.exec(testReport);

  return testReport;
};

const makeTest = (tests, opts) => async (name, fn) => {
  const testReport = await exec(name, fn, opts);

  tests.set(name, testReport);
};
