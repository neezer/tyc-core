import test from "./index.mjs";
import { makeTestReport } from "./test-report.mjs";
import { makeTestCollection } from "./test-collection.mjs";

test("returns an empty object", t => {
  const report = makeTestReport();

  t.assert(JSON.stringify(report) === "{}", "report is an object");
});
