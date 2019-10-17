import test from "./index.mjs";
import { makeMiddleware } from "./middleware.mjs";

test("middleware nesting", async t => {
  const effects = [];
  const pipeline = makeMiddleware();

  async function outermost(ctx, next) {
    ctx.push("start-outer");
    await next();
    ctx.push("end-outer");
  }

  async function inner(ctx, next) {
    ctx.push("start-inner");
    await next();
    ctx.push("end-inner");
  }

  async function innermost(ctx) {
    ctx.push("helm-of-inner-most-light");
  }

  pipeline.use(outermost);
  pipeline.use(inner);
  pipeline.use(innermost);

  await pipeline.exec(effects);

  t.assert(effects[0] === "start-outer", "start-outer");
  t.assert(effects[1] === "start-inner", "start-inner");

  t.assert(
    effects[2] === "helm-of-inner-most-light",
    "helm-of-inner-most-light"
  );

  t.assert(effects[3] === "end-inner", "end-inner");
  t.assert(effects[4] === "end-outer", "end-outer");
});
