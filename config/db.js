// // 2️⃣. Create connection using drizzle to mysql
// import { drizzle } from "drizzle-orm/mysql2";
// export const db = drizzle(process.env.DATABASE_URL);

// db.js
import mysql from 'mysql2/promise';
import { drizzle } from 'drizzle-orm/mysql2';
import * as dotenv from 'dotenv';

dotenv.config(); // Load .env variables

// 1. Create a connection pool using mysql2/promise
const pool = await mysql.createPool({
  uri: process.env.DATABASE_URL, // ✅ uses the URL string
});

// 2. Pass the pool to drizzle
export const db = drizzle(pool);
