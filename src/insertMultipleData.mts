import type { Stats, Suite } from "benchmark";
import Benchmark from "benchmark";
import { PrismaClient } from "@prisma/client";
import { createClient } from "edgedb";
import edgedb from "../dbschema/edgeql-js/index.mjs";

async function run() {
  const prisma = new PrismaClient();
  const client = createClient();

  await prisma.profile.deleteMany();
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();

  let i = 0;

  const suite = new Benchmark.Suite("insertBulk");

  suite

    .add("prisma", {
      defer: true,
      fn: (deferred: typeof Promise<any>) => {
        let data = [];
        for (let j = 0; j < 100; j++) {
          data.push({
            email: `${i++}@b.c`,
          });
        }

        prisma.user
          .createMany({
            data,
          })
          .then(() => deferred.resolve());
      },
    })
    .add("edgedb", {
      defer: true,
      fn: (deferred: typeof Promise<any>) => {
        const query = edgedb.params({ items: edgedb.json }, (params) => {
          return edgedb.for(edgedb.json_array_unpack(params.items), (item) => {
            return edgedb.insert(edgedb.User, {
              email: edgedb.cast(edgedb.str, item.email),
            });
          });
        });
        let items = [];
        for (let j = 0; j < 100; j++) {
          items.push({
            email: `${i++}@b.c`,
          });
        }
        query
          .run(client, {
            items,
          })
          .then((res) => {
            deferred.resolve();
          });
      },
    })
    .on("complete", async function (this: Suite) {
      const fastest = this.filter("fastest");
      const fastestStats = fastest.map("stats")[0] as Stats;
      console.log(
        `Fastest is ${fastest.map("name")} by ${fastest.map("hz")} ops/sec ±${
          fastestStats.moe * 100
        }% mean ${fastestStats.mean * 1000}ms, relative mean error ±${
          fastestStats.rme
        }%, stddev ${fastestStats.deviation * 1000}ms`
      );

      const slowest = this.filter("slowest");
      const slowestStats = slowest.map("stats")[0] as Stats;
      console.log(
        `Slowest is ${slowest.map("name")} by ${slowest.map("hz")} ops/sec ±${
          slowestStats.moe * 100
        }% mean ${slowestStats.mean * 1000}ms, relative mean error ±${
          slowestStats.rme
        }%, stddev ${slowestStats.deviation * 1000}ms`
      );
    })
    .run({
      async: true,
      minSamples: 10000,
    });
}
run();
