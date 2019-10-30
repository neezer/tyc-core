import test from "./index.mjs";
import { makeTestReport } from "./test-report.mjs";
import { makeTestCollection } from "./test-collection.mjs";

test("returns an empty object", t => {
  const report = makeTestReport();

  t.assert(JSON.stringify(report) === "{}", "report is an object");
});

test("assigns a name", t => {
  const report = makeTestReport("hello!");

  t.assert(report.name === "hello!", "name is hello!");
});

test("assigns a filename", t => {
  const report = makeTestReport(undefined, "./test-report.test.mjs");

  t.assert(report.filename === "./test-report.test.mjs", "filename is correct");
});
