// stripped and embedded versions of
// - https://github.com/sindresorhus/parse-ms
// - https://github.com/sindresorhus/pretty-ms

import { hrtimeToMs } from "../utils.mjs";

export { format };

const parseMs = ms => {
  const roundTowardsZero = ms > 0 ? Math.floor : Math.ceil;

  return {
    days: roundTowardsZero(ms / 86400000),
    hours: roundTowardsZero(ms / 3600000) % 24,
    minutes: roundTowardsZero(ms / 60000) % 60,
    seconds: roundTowardsZero(ms / 1000) % 60,
    milliseconds: roundTowardsZero(ms) % 1000,
    microseconds: roundTowardsZero(ms * 1000) % 1000,
    nanoseconds: roundTowardsZero(ms * 1e6) % 1000
  };
};

const add = (result, value, label, valueString) => {
  if (value === 0) {
    return;
  }

  result.push((valueString || value) + label);
};

const format = hrtime => {
  const ms = hrtimeToMs(hrtime);
  const parsed = parseMs(ms);
  const result = [];

  add(result, Math.trunc(parsed.days / 365), "y");
  add(result, parsed.days % 365, "d");
  add(result, parsed.hours, "h");
  add(result, parsed.minutes, "m");

  if (ms < 1000) {
    add(result, parsed.seconds, "s");

    const millisecondsAndBelow =
      parsed.milliseconds +
      parsed.microseconds / 1000 +
      parsed.nanoseconds / 1e6;

    const msString = millisecondsAndBelow.toFixed(0);

    add(result, parseFloat(msString, 10), "ms", msString);
  } else {
    const seconds = (ms / 1000) % 60;
    const secondsString = seconds.toFixed(1).replace(/\.0+$/, "");

    add(result, parseFloat(secondsString, 10), "s", secondsString);
  }

  if (result.length === 0) {
    return "0ms";
  }

  return result.join(" ");
};
