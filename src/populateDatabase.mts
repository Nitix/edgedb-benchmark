import { Client } from "edgedb";
import { PrismaClient } from "@prisma/client";
import type Edgedb from "../dbschema/edgeql-js/index.mjs";

export const populateDatabase = async (
  prisma: PrismaClient,
  edgedb: typeof Edgedb,
  client: Client
) => {
  await prisma.profile.deleteMany();
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();
  await edgedb.delete(edgedb.Profile).run(client);
  await edgedb.delete(edgedb.Post).run(client);
  await edgedb.delete(edgedb.User).run(client);

  for (let i = 0; i < 1000; i++) {
    await prisma.user.create({
      data: {
        name: `user ${i}`,
        email: `user-${i}@user.com`,
        posts: {
          create: {
            title: `post ${i}`,
            content: `content ${i}`,
          },
        },
        profile: {
          create: {
            bio: `bio ${i}`,
          },
        },
      },
    });
    const queryUser = edgedb.insert(edgedb.User, {
      name: `user ${i}`,
      email: `user-${i}@user.com`,
    });
    const user = await queryUser.run(client);
    const queryPost = edgedb.insert(edgedb.Post, {
      title: `post ${i}`,
      content: `content ${i}`,
      author: edgedb.select(edgedb.User, (userDb) => ({
        filter: edgedb.op(userDb.id, "=", edgedb.uuid(user.id)),
      })),
    });
    await queryPost.run(client);
    const queryProfile = edgedb.insert(edgedb.Profile, {
      bio: `bio ${i}`,
      user: edgedb.select(edgedb.User, (userDb) => ({
        filter: edgedb.op(userDb.id, "=", edgedb.uuid(user.id)),
      })),
    });
    await queryProfile.run(client);
  }
};
