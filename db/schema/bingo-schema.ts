import { pgTable, uuid, text, timestamp, boolean } from "drizzle-orm/pg-core"
import { profilesTable } from "@/db/schema/profiles-schema"
import { references } from "drizzle-orm"

// bingo_games table
export const bingoGamesTable = pgTable("bingo_games", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .notNull(),
  title: text("title").notNull(),
  variant: text("variant").notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date())
})

// bingo_items table
export const bingoItemsTable = pgTable("bingo_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  gameId: uuid("game_id")
    .references(() => bingoGamesTable.id, { onDelete: "cascade" })
    .notNull(),
  label: text("label").notNull(),
  imageUrl: text("image_url"),
  isMandatory: boolean("is_mandatory").notNull().default(false),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date())
})

// bingo_cards table
export const bingoCardsTable = pgTable("bingo_cards", {
  id: uuid("id").defaultRandom().primaryKey(),
  gameId: uuid("game_id")
    .references(() => bingoGamesTable.id, { onDelete: "cascade" })
    .notNull(),
  cardData: text("card_data").notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date())
})

// Types
export type InsertBingoGame = typeof bingoGamesTable.$inferInsert
export type SelectBingoGame = typeof bingoGamesTable.$inferSelect

export type InsertBingoItem = typeof bingoItemsTable.$inferInsert
export type SelectBingoItem = typeof bingoItemsTable.$inferSelect

export type InsertBingoCard = typeof bingoCardsTable.$inferInsert
export type SelectBingoCard = typeof bingoCardsTable.$inferSelect