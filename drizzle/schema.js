// 4️⃣. Create schema (create table, collection) for urls and shortcodes
// import { relations } from "drizzle-orm";
import { relations, sql } from "drizzle-orm";
import { boolean, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

export const shortLinksTable = mysqlTable("short_link", {
  id        : int().autoincrement().primaryKey(),
  url       : varchar({ length: 255 }).notNull(),
  shortCode : varchar("short_code", { length: 20 }).notNull().unique(),
  createdAt : timestamp("created_at").defaultNow().notNull(),
  updatedAt : timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  userId    : int("user_id").notNull().references(()=>usersTable.id),       //video 85. foring key
});


// video 90. Create session table for hybrid authentication..
export const sessionsTable = mysqlTable("sessions",{
  id        : int().autoincrement().primaryKey(),
  userId    : int("user_id").notNull().references(() => usersTable.id, {onDelete: "cascade"}),
  valid     : boolean().default(true).notNull(),
  userAgent : text("user_agent"),
  ip        : varchar({length: 255}),  
  createdAt : timestamp("created_at").defaultNow().notNull(),
  updatedAt : timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
})


// // video 98
export const verifyEmailTokensTable = mysqlTable("is_email_valid", {
  id        : int().autoincrement().primaryKey(),
  userId    : int("user_id").notNull().references(() => usersTable.id, {onDelete: "cascade"}),
  token     : varchar({ length: 8}).notNull(),
  expiresAt : timestamp("expires_at").default(sql`(CURRENT_TIMESTAMP + INTERVAL 1 DAY)`).notNull(),
  createdAt : timestamp("created_at").defaultNow().notNull(),
})



// // video 117. for reset password
export const passwordResetTokensTable = mysqlTable("password_reset_tokens", {
  id        : int("id").autoincrement().primaryKey(),
  userId    : int("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }).unique(),
  tokenHash : text("token_hash").notNull(),
  expiresAt : timestamp("expires_at").default(sql`(CURRENT_TIMESTAMP + INTERVAL 1 HOUR)`).notNull(),
  createdAt : timestamp("created_at").defaultNow().notNull(),
});


// video 124. Complete login with google (OauthAccountTable)
export const oauthAccountsTable = mysqlTable("oauth_accounts", {
  id                : int("id").autoincrement().primaryKey(),
  userId            : int("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  provider          : mysqlEnum("provider", ["google", "github"]).notNull(),
  providerAccountId : varchar("provider_account_id", { length: 255 }).notNull().unique(),
  createdAt         : timestamp("created_at").defaultNow().notNull(),
});


// Create schema for name and password for registerpage page
export const usersTable = mysqlTable("users", {
  id           : int().autoincrement().primaryKey(),
  name         : varchar({ length: 255 }).notNull(),
  email        : varchar({ length: 255 }).notNull().unique(),
  password     : varchar({ length: 255}),                            // v 124
  avatarUrl    : text("avatar_url"),                                 // v 127
  isEmailValid : boolean("is_email_valid").default(false).notNull(),
  createdAt    : timestamp("created_at").defaultNow().notNull(),
  updatedAt    : timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});


export const usersRelation = relations(usersTable, ({many})=> ({
  shortLink : many(shortLinksTable),
  session   : many(sessionsTable)             // video 90
}))


export const shortLinksRelation = relations(shortLinksTable, ({one}) => ({
  user: one(usersTable, {
    fields     : [shortLinksTable.userId],
    references : [usersTable.id]
  })
}))


export const sessionsRelation = relations(sessionsTable, ({one}) => ({  // video 90
  user: one(usersTable, {
    fields     : [sessionsTable.userId],
    references : [usersTable.id],
  })
}))