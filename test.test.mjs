import assert from "assert";
import test from "./index.mjs";
import { makeTest } from "./test.mjs";
import { reporter } from "./test-helpers/noop-reporter.mjs";
import { identity } from "./utils.mjs";

const defaultOpts = {
  assert,
  reporter,
  durationFormatter: identity
};

const has = prop => obj => obj.hasOwnProperty(prop);
const hasDuration = has("duration");
const hasAssertions = has("assertions");
const hasFilename = has("filename");

test("adds a test to the given collection", async t => {
  const tests = new Map([]);
  const subject = makeTest(tests, defaultOpts);

  await subject("thingy", tt => {
    tt.assert(true);
  });

  t.assert(tests.size === 1, "tests.size should be 1");
});

test("adds duration of test to test report", async t => {
  const tests = new Map([]);
  const subject = makeTest(tests, defaultOpts);

  await subject("thingy", tt => {
    tt.assert(true, "is true");
  });

  const report = tests.get("thingy");

  t.assert(hasDuration(report), "has a duration key");
  t.assert(report.duration.length === 2, "is an hrtime");
  t.assert(typeof report.duration[0] === "number", "seconds is a number");
  t.assert(typeof report.duration[1] === "number", "nanoseconds is a number");
});

test("tracks assertions", async t => {
  const tests = new Map([]);
  const subject = makeTest(tests, defaultOpts);

  await subject("thingy", tt => {
    tt.assert(true, "is true");
  });

  const report = tests.get("thingy");

  t.assert(hasAssertions(report), "has an assertions key");
  t.assert(report.assertions.length === 1, "has one assertion");
  t.assert(report.assertions[0] === "is true", "assertion message is correct");
});

test("generates report for failures", async t => {
  const tests = new Map([]);
  const subject = makeTest(tests, defaultOpts);

  await subject("failing", tt => {
    tt.assert(false, "is false");
  });

  const report = tests.get("failing");

  t.assert(hasDuration(report), "has duration");
  t.assert(hasAssertions(report), "has assertions");
});

test("report records the filename", async t => {
  const tests = new Map([]);
  const subject = makeTest(tests, defaultOpts);
  const expected = "./test.test.mjs";

  await subject("thingy", tt => {
    tt.assert(true, "is true");
  });

  const report = tests.get("thingy");

  t.assert(hasFilename(report), "has a filename key");

  t.assert(
    report.filename === expected,
    `filename is correct: ${report.filename} === ${expected}`
  );
});

test("adds tests in groups when group() called", async t => {
  const collection = new Map([]);
  const subject = makeTest(collection, defaultOpts);

  subject.group();

  await subject("thingy", tt => {
    tt.assert(true, "is true");
  });

  const tests = collection.get("./test.test.mjs");

  t.assert(tests !== undefined, "has test collection");
  t.assert(typeof tests.get === "function", "has a get method");

  const report = tests.get("thingy");

  t.assert(report !== undefined, "has a test report for thingy");
  t.assert(hasDuration(report), "has duration");
  t.assert(hasAssertions(report), "has assertions");
  t.assert(hasFilename(report), "has a filename key");
});

test("beforeEach", async t => {
  const collection = new Map([]);
  const subject = makeTest(collection, defaultOpts);

  let calls = [];

  await subject.beforeEach(() => {
    calls.push("beforeEach");
  });

  await subject("test 2", () => {
    calls.push("test 1");
  });

  await subject("test 1", () => {
    calls.push("test 2");
  });

  t.assert(calls.length === 4, "called before each");
});
