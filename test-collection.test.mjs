import test from "./index.mjs";
import { makeTestCollection } from "./test-collection.mjs";

test("returns a Map", t => {
  const tests = makeTestCollection();

  t.assert(tests.toString() === "[object Map]", "returns a map");
});

test("returns an empty Map", t => {
  const tests = makeTestCollection();

  t.assert(tests.size === 0, "map is empty");
});
