// 3️⃣. Drizzle config
import { defineConfig } from "drizzle-kit"; // 🟢 Drizzle

export default defineConfig({
  out: "./drizzle/migration", // Changes here
  schema: "./drizzle/schema.js", // Changes here
  dialect: "mysql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});