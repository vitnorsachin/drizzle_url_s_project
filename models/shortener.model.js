// When i use mongoose then no need of this file
// When use mysql then use this file
// models handle all database work and data logics

// import { dbClient } from "../config/db-client.js";
// import { env } from "../config/env.js";

// const db = dbClient.db(env.MONGODB_DATABASE_NAME);
// const shortenerCollection = db.collection("shorteners");

// import { db } from "../config/db-client.js";




// export const loadLinks = async () => {
//   // return shortenerCollection.find().toArray();
//   const [rows] = await db.execute("select * from short_links");
//   return rows;
// };

// export const insertShortLink = async ({ url, shortCode }) => {
//   // return shortenerCollection.insertOne(link);
//   const [result] = await db.execute(
//     `INSERT INTO short_links(short_code, url) VALUES(?, ?)`,
//     [shortCode, url]
//   );
//   return result;
// };

// export const getLinkByShortCode = async (shortCode) => {
//   // return await shortenerCollection.findOne({ shortCode: shortcode });
//   const [row] = await db.execute(
//     `SELECT * FROM short_links WHERE short_code=?`,
//     [shortCode]
//   );

//   if (row.length > 0) {
//     return row[0];
//   } else {
//     return null;
//   }
// };




// //import { readFile, writeFile } from "fs/promises";
// import path from "path";
// const DATA_FILE = path.join("data", "links.json");
// // Load links file data
// const loadLinks = async () => {
//   try {
//     const data = await readFile(DATA_FILE, "utf-8");
//     return JSON.parse(data);
//   } catch (error) {
//     if (error.code === "ENOENT") {
//       await writeFile(DATA_FILE, JSON.stringify({}));
//       return {};
//     }
//     throw error;
//   }
// };
// // Save data to links file
// const insertShortLink = async (links) => {
//   await writeFile(DATA_FILE, JSON.stringify(links));
// };
// export { loadLinks, insertShortLink };