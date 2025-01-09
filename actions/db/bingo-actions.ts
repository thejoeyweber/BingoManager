"use server"

import { db } from "@/db/db"
import { eq } from "drizzle-orm"
import {
  bingoGamesTable,
  bingoItemsTable,
  bingoCardsTable,
  InsertBingoGame,
  SelectBingoGame,
  InsertBingoItem,
  SelectBingoItem,
  InsertBingoCard,
  SelectBingoCard
} from "@/db/schema/bingo-schema"
import { ActionState } from "@/types"

// CREATE a new Bingo game
export async function createBingoGameAction(
  userId: string,
  data: {
    title: string
    variant: string
  }
): Promise<ActionState<SelectBingoGame>> {
  try {
    // Example free plan check (placeholder):
    // TODO: Actually check if user already has a game if membership is free, etc.

    const [newGame] = await db
      .insert(bingoGamesTable)
      .values({
        userId,
        title: data.title,
        variant: data.variant
      })
      .returning()
    return {
      isSuccess: true,
      message: "Bingo game created successfully",
      data: newGame
    }
  } catch (error) {
    console.error("Error creating Bingo game:", error)
    return { isSuccess: false, message: "Failed to create Bingo game" }
  }
}

// READ all Bingo games for a user
export async function getBingoGamesAction(
  userId: string
): Promise<ActionState<SelectBingoGame[]>> {
  try {
    const games = await db.select().from(bingoGamesTable).where(eq(bingoGamesTable.userId, userId))
    return {
      isSuccess: true,
      message: "Bingo games retrieved successfully",
      data: games
    }
  } catch (error) {
    console.error("Error retrieving Bingo games:", error)
    return { isSuccess: false, message: "Failed to retrieve Bingo games" }
  }
}

// CREATE items for a Bingo game
export async function createBingoItemsAction(
  gameId: string,
  items: {
    label: string
    imageUrl?: string
    isMandatory?: boolean
  }[]
): Promise<ActionState<SelectBingoItem[]>> {
  try {
    // Example free plan check (placeholder):
    // TODO: limit items if user is free membership.

    const insertData = items.map(item => ({
      gameId,
      label: item.label,
      imageUrl: item.imageUrl,
      isMandatory: item.isMandatory ?? false
    }))

    const createdItems = await db.insert(bingoItemsTable).values(insertData).returning()
    return {
      isSuccess: true,
      message: "Bingo items created successfully",
      data: createdItems
    }
  } catch (error) {
    console.error("Error creating Bingo items:", error)
    return { isSuccess: false, message: "Failed to create Bingo items" }
  }
}

// GENERATE Bingo cards (skeleton)
export async function generateBingoCardsAction(
  gameId: string,
  quantity: number,
  config?: any
): Promise<ActionState<SelectBingoCard[]>> {
  try {
    // Example free plan check (placeholder)
    // TODO: limit cards if user is free membership, randomize, etc.

    // This is just a skeleton to illustrate:
    const newCards: InsertBingoCard[] = []
    for (let i = 0; i < quantity; i++) {
      newCards.push({
        gameId,
        cardData: JSON.stringify({ items: [] }) // placeholder
      })
    }

    const inserted = await db.insert(bingoCardsTable).values(newCards).returning()

    return {
      isSuccess: true,
      message: `Created ${inserted.length} bingo cards`,
      data: inserted
    }
  } catch (error) {
    console.error("Error generating Bingo cards:", error)
    return { isSuccess: false, message: "Failed to generate Bingo cards" }
  }
}

// DELETE a Bingo game and cascade items/cards
export async function deleteBingoGameAction(
  gameId: string
): Promise<ActionState<void>> {
  try {
    // On cascade, deleting from the parent table should remove child rows.
    await db.delete(bingoGamesTable).where(eq(bingoGamesTable.id, gameId))
    return {
      isSuccess: true,
      message: "Bingo game deleted successfully",
      data: undefined
    }
  } catch (error) {
    console.error("Error deleting Bingo game:", error)
    return { isSuccess: false, message: "Failed to delete Bingo game" }
  }
}