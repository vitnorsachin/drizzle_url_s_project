// 6️⃣. Services of shortLinks
import { eq } from "drizzle-orm";
import { db } from "../config/db.js";
import { shortLinksTable } from "../drizzle/schema.js";


export const getAllShortLinks = async (userId) => {
  return await db
    .select()
    .from(shortLinksTable)
    .where(eq(shortLinksTable.userId, userId)); // 🟢 Drizzle, video 85. add "where"
};


export const getShortLinkByShortCode = async (shortCode) => {
  const [result] = await db // 🟢 Drizzle
    .select()
    .from(shortLinksTable)
    .where(eq(shortLinksTable.shortCode, shortCode));
  return result;
};


export const insertShortLink = async ({ url, finalShortCode, userId }) => {
  await db.insert(shortLinksTable).values({ url, shortCode: finalShortCode, userId }); // 🟢 Drizzle
};


export const findShortLinkById = async(id) => {  // video 87.
  const [result] = await db
    .select()
    .from(shortLinksTable)
    .where(eq(shortLinksTable.id, id));
  return result;
}


export const updateShortCode = async ({id, url, shortCode}) => { // video 87. part 2
  return await db
    .update(shortLinksTable)
    .set({url, shortCode})
    .where(eq(shortLinksTable.id, id));
}


export const deleteShortCodeById = async (id) => {
  return await db.delete(shortLinksTable).where(eq(shortLinksTable.id, id));
}










// 7️⃣. Update the "package.json" file
// "scripts": {
//   "dev": "node --env-file=.env --watch app.js",
//   "start": "node --env-file=.env app.js",
//   "db:generate": "drizzle-kit generate",
//   "db:migrate": "drizzle-kit migrate",
//   "db:studio": "drizzle-kit studio"
// },