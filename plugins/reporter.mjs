import { sumHRTimes, pluralize } from "../utils.mjs";
import util from "util";

export { reporter };

const summary = (tests, format) => {
  const runtime = sumHRTimes([...tests.values()], tests.isGrouped);

  process.stdout.write("\n");
  process.stdout.write("----\n");
  process.stdout.write(`ran: ${tests.size} ${pluralize("test", tests.size)}\n`);
  process.stdout.write(`took: ${format(runtime)}\n`);
};

const failure = (name, report, format) => error => {
  process.stdout.write(`✘ ${name} (${format(report.duration)})\n`);
  process.stdout.write(`├── from ${report.filename}\n`);
  process.stdout.write(`│ \n`);
  process.stdout.write(`${formatError(error)}\n`);
};

const success = (name, report, format) => () => {
  process.stdout.write(
    `✔ ${name} (${format(report.duration)}) -- ${report.filename}\n`
  );
};

const noAssertions = (name, report) => () => {
  process.stdout.write(`∅ ${name} -- ${report.filename}\n`);
};

const uncaughtException = error => {
  process.stderr.write("\n‼ unhandled promise rejection\n\n");

  const lines = error.stack.split("\n");

  const runActualIndex = lines.findIndex(
    v => v.includes("at runActual") && v.includes("tyc/test")
  );

  process.stderr.write(
    lines
      .slice(0, runActualIndex)
      .map(l => `    ${l}`)
      .join("\n")
  );

  process.stderr.write("\n");
};

const formatError = error => {
  const raw = util.inspect(error);
  const lines = raw.split("\n").concat(["", ""]);
  const prefix = last => (last ? "└" : "│");

  return lines
    .map((l, i) => `${prefix(i === lines.length - 1)}   ${l}`)
    .join("\n");
};

const reporter = { success, failure, summary, noAssertions, uncaughtException };
