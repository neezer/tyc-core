- No fsevents; use an external watching service, like Watchman
- No wrapping native assert; should be compatible with libraries like
  power-assert
- No requirement on a runner; test files can run with plain Node.JS
- NO COMPILATION
  - Support ES Modules without compilation; standards compliant
  - compatible with compilation (tsc), require hooks; works with both test and
    implementation files
- No planned assertions
  - don't code like that
- zero-dependency
- support async/await natively
- support observables natively

- Each file runs in its own process (parallel)
  - auto-scale with cores
- Tests within a file are run concurrently, with a random seed (concurrent)

Shuffle with seed, seed generation, etc.:

```js
// xmur3 and sfc32 taken from https://stackoverflow.com/a/47593316/32154

const xmur3 = str => {
  for (let i = 0; h = 1779033703 ^ str.length; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = h << 13 | h >>> 19;

    return () => {
      h = Math.imul(h ^ h >>> 16, 2246822507);
      h = Math.imul(h ^ h >>> 13, 3266489909);

      return(h ^= h >>> 16) >>> 0;
    }
  }
}

/**
 * Example:
 *
 *   const seed = xmur("seed string");
 *
 *   sfc32(seed(), seed(), seed(), seed());
 */
const sfc32 = (a, b, c, d) => {
  return () => {
    a >>>= 0;
    b >>>= 0;
    c >>>= 0;
    d >>>= 0;

    let t = (a + b) | 0;

    a = b ^ b >>> 9;
    b = c + (c << 3) | 0;
    c = (c << 21 | c >>> 11);
    d = d + 1 | 0;
    t = t + d | 0;
    c = c + t | 0;

    return (t >>> 0) / 4294967296;
  }
}

// shuffle borrowed from https://stackoverflow.com/a/53758827/32154
const suffle = (array, seedStr) => {
  const m = array.length;
  const seed = xmur3(seedStr);

  let t;
  let i;

  while (m) {
    i = Math.floor(sfc32(seed(), seed(), seed(), seed()) * m--);
    t = array[m];
    array[m] = array[i];
    ++seed;
  }

  return array;
};
```

Copy in https://github.com/angularsen/yawg implementation for `seedStr` generation

- 6 words
- space-delimited
