import { makeMiddleware } from "./middleware.mjs";
import { makeTestReport } from "./test-report.mjs";
import { ensure } from "./utils.mjs";

export { makeTest };

const makeT = assert => ({ assert });
const stripCWD = v => v.replace(process.cwd(), ".");
const stripStackPrefix = v => v.replace(/^\s+.+file:\/\//, "");
const stripStackSuffix = v => v.replace(/\:\d+\:\d+$/, "");
const ensureKeyIsACollection = c => k => c.get(k) || new Map([]);

const flagDefs = [
  { name: "grouped", activateWith: "group", defaultValue: false }
];

const report = (name, print, format) => async (report, next) => {
  try {
    await next();

    if (report.assertions.length === 0) {
      print.noAssertions(name, report, format)();
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

const exec = async (name, filename, fn, opts) => {
  const t = makeT(opts.assert);
  const testReport = makeTestReport(name, filename);
  const m = makeMiddleware();

  m.use(report(name, opts.reporter, opts.durationFormatter));
  m.use(instrument());
  m.use(collectAssertions(t));
  m.use(run(fn, t));

  await m.exec(testReport);

  return testReport;
};

const getTestFile = error =>
  error.stack
    .split("\n")
    .map(stripStackPrefix)
    .map(stripStackSuffix)
    .map(stripCWD)[2];

const saveReport = (report, collection, flags) => {
  if (flags.grouped) {
    const tests = ensureKeyIsACollection(collection)(report.filename);

    tests.set(report.name, report);
    collection.set(report.filename, tests);

    Object.defineProperty(collection, "isGrouped", { value: true });
  } else {
    collection.set(report.name, report);
    Object.defineProperty(collection, "isGrouped", { value: false });
  }
};

const makeFlagManager = () => {
  const flags = flagDefs.reduce(
    (memo, { name, defaultValue }) => {
      memo[name] = defaultValue;

      return memo;
    },
    {}
  );

  const manageFlagsFor = o => {
    const activators = flagDefs.reduce(
      (memo, { name, activateWith, defaultValue }) => {
        memo[activateWith] = {
          value: () => {
            flags[name] = !defaultValue;
          }
        }

        return memo;
      },
      {}
    );

    Object.defineProperties(o, activators);

    return o;
  };

  return { flags, manageFlagsFor };
};

const makeTest = (collection, opts) => {
  const { flags, manageFlagsFor } = makeFlagManager();

  const test = async (name, fn) => {
    const filename = getTestFile(new Error());
    const testReport = await exec(name, filename, fn, opts);

    saveReport(testReport, collection, flags);
  };

  return manageFlagsFor(test);
};
