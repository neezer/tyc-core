export { ensure, hrtimeToMs, sumHRTimes, noop, identity, pluralize };

const sumHRTimes = hrtimes => {
  const reducer = (m, c) => [m[0] + c.duration[0], m[1] + c.duration[1]];

  return hrtimes.reduce(reducer, [0, 0]);
};

const hrtimeToMs = ([seconds, nanoseconds]) =>
  seconds * 1000 + nanoseconds / 1000000;

const noop = () => {};

const identity = v => v;

const pluralize = (word, count) => (count === 1 ? word : word + "s");

const ensure = ensured => async fn => {
  try {
    await fn();
  } catch (error) {
    throw error;
  } finally {
    ensured();
  }
};
