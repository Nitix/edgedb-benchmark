import { populateDatabase } from "./populateDatabase.mjs";
import type { Stats, Suite } from "benchmark";
import Benchmark from "benchmark";
import { PrismaClient } from "@prisma/client";
import { createClient } from "edgedb";
import edgedb from "../dbschema/edgeql-js/index.mjs";

async function run() {
  const prisma = new PrismaClient();
  const client = createClient();

  await populateDatabase(prisma, edgedb, client);

  const suite = new Benchmark.Suite("select");

  suite
    .add("prisma", {
      defer: true,
      fn: (deferred: typeof Promise<any>) => {
        prisma.user.findMany().then(() => deferred.resolve());
      },
    })
    .add("edgedb", {
      defer: true,
      fn: (deferred: typeof Promise<any>) => {
        const query = edgedb.select(edgedb.User);
        query.run(client).then(() => deferred.resolve());
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
