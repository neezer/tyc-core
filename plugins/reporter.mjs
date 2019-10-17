import { sumHRTimes, pluralize } from "../utils.mjs";

export { reporter };

const summary = (tests, format) => {
  const runtime = sumHRTimes([...tests.values()]);

  process.stdout.write("\n");
  process.stdout.write("----\n");
  process.stdout.write(`ran: ${tests.size} ${pluralize("test", tests.size)}\n`);
  process.stdout.write(`took: ${format(runtime)}\n`);
};

const failure = (name, report, format) => error => {
  process.stdout.write(`✘ ${name} (${format(report.duration)})\n`);
  console.error(error);
};

const success = (name, report, format) => () => {
  process.stdout.write(`✔ ${name} (${format(report.duration)})\n`);
};

const noAssertions = name => () => {
  process.stdout.write(`∅ ${name}\n`);
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

const reporter = { success, failure, summary, noAssertions, uncaughtException };
