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
import { getProfileByUserIdAction } from "./profiles-actions"

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
    const games = await db
      .select()
      .from(bingoGamesTable)
      .where(eq(bingoGamesTable.userId, userId))
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

// CREATE items for a Bingo game (with free plan limit of 75)
export async function createBingoItemsAction(
  gameId: string,
  items: {
    label: string
    imageUrl?: string
    isMandatory?: boolean
  }[]
): Promise<ActionState<SelectBingoItem[]>> {
  try {
    // Check existing item count for limit enforcement:
    const existingItems = await db.query.bingoItemsTable.findMany({
      where: eq(bingoItemsTable.gameId, gameId),
      columns: {
        id: true
      }
    })
    if (existingItems.length + items.length > 75) {
      return {
        isSuccess: false,
        message: "Item limit reached (75 items max on free plan)"
      }
    }

    const insertData = items.map(item => ({
      gameId,
      label: item.label,
      imageUrl: item.imageUrl,
      isMandatory: item.isMandatory ?? false
    }))

    const createdItems = await db
      .insert(bingoItemsTable)
      .values(insertData)
      .returning()
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

// READ items for a Bingo game
export async function getBingoItemsAction(
  gameId: string
): Promise<ActionState<SelectBingoItem[]>> {
  try {
    const items = await db.query.bingoItemsTable.findMany({
      where: eq(bingoItemsTable.gameId, gameId)
    })
    return {
      isSuccess: true,
      message: "Bingo items retrieved successfully",
      data: items
    }
  } catch (error) {
    console.error("Error retrieving Bingo items:", error)
    return { isSuccess: false, message: "Failed to retrieve Bingo items" }
  }
}

// DELETE a single Bingo item
export async function deleteBingoItemAction(
  itemId: string
): Promise<ActionState<void>> {
  try {
    await db.delete(bingoItemsTable).where(eq(bingoItemsTable.id, itemId))
    return {
      isSuccess: true,
      message: "Bingo item deleted successfully",
      data: undefined
    }
  } catch (error) {
    console.error("Error deleting Bingo item:", error)
    return { isSuccess: false, message: "Failed to delete Bingo item" }
  }
}

/**
 * GENERATE Bingo cards
 * - Checks user membership to limit total cards to 50 on free plan.
 * - Fetches mandatory items + optional items.
 * - Randomly shuffles optional items for each card.
 * - Places mandatory items in the grid (for a 5x5 standard, we fill first).
 * - Saves final item layout in bingo_cards.card_data as JSON.
 */
export async function generateBingoCardsAction(
  gameId: string,
  quantity: number,
  config?: {
    includeFreeSpace?: boolean
  }
): Promise<ActionState<SelectBingoCard[]>> {
  try {
    // 1) Check membership status
    // We want to find the userId from the game
    const game = await db.query.bingoGamesTable.findFirst({
      where: eq(bingoGamesTable.id, gameId)
    })
    if (!game) {
      return { isSuccess: false, message: "Game not found" }
    }

    // Get user profile
    const userProfile = await getProfileByUserIdAction(game.userId)
    if (!userProfile.isSuccess || !userProfile.data) {
      return { isSuccess: false, message: "Could not load user profile" }
    }

    const isFree = userProfile.data.membership === "free"

    // 2) Check how many cards already exist
    const existingCardsCount = await db.query.bingoCardsTable.findMany({
      where: eq(bingoCardsTable.gameId, gameId),
      columns: {
        id: true
      }
    })

    const totalExisting = existingCardsCount.length
    const newTotal = totalExisting + quantity
    // For free plan, limit 50 total
    if (isFree && newTotal > 50) {
      return {
        isSuccess: false,
        message: "Free plan allows max 50 cards total. Limit exceeded."
      }
    }

    // 3) Fetch mandatory and optional items
    const allItems = await db.query.bingoItemsTable.findMany({
      where: eq(bingoItemsTable.gameId, gameId)
    })
    if (!allItems || allItems.length === 0) {
      return {
        isSuccess: false,
        message: "No items found. Add items before generating cards."
      }
    }

    const mandatory = allItems.filter(i => i.isMandatory)
    const optional = allItems.filter(i => !i.isMandatory)

    // Shuffle helper
    function shuffle<T>(arr: T[]): T[] {
      const result = [...arr]
      for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[result[i], result[j]] = [result[j], result[i]]
      }
      return result
    }

    // We'll assume a 5x5 if the variant is "5x5 Standard"
    // You can adjust or detect other variants as needed
    const size = game.variant.includes("5x5") ? 25 : 25
    // If config?.includeFreeSpace, we can handle that logic here
    // For simplicity, we'll just place mandatory items first and then fill the rest.

    const newCards: InsertBingoCard[] = []

    for (let i = 0; i < quantity; i++) {
      let finalItems = [...mandatory] // place mandatory items first
      // We only shuffle optional for each card
      const shuffledOptional = shuffle(optional)

      // Fill up to `size` total items
      const needed = size - finalItems.length
      if (needed > 0) {
        finalItems = finalItems.concat(shuffledOptional.slice(0, needed))
      }

      // If we want to do a random arrangement within the grid
      finalItems = shuffle(finalItems)

      // If config?.includeFreeSpace and 5x5, replace center with a special "FREE SPACE"
      if (config?.includeFreeSpace && size === 25) {
        finalItems[12] = {
          ...finalItems[12],
          label: "FREE SPACE",
          isMandatory: false,
          id: "free-space"
        }
      }

      const cardData = {
        items: finalItems.map(item => ({
          id: item.id,
          label: item.label,
          imageUrl: item.imageUrl,
          isMandatory: item.isMandatory
        }))
      }

      newCards.push({
        gameId,
        cardData: JSON.stringify(cardData)
      })
    }

    // 4) Insert new cards
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

// READ bingo cards for a Bingo game
export async function getBingoCardsAction(
  gameId: string
): Promise<ActionState<SelectBingoCard[]>> {
  try {
    const cards = await db.query.bingoCardsTable.findMany({
      where: eq(bingoCardsTable.gameId, gameId)
    })
    return {
      isSuccess: true,
      message: "Bingo cards retrieved successfully",
      data: cards
    }
  } catch (error) {
    console.error("Error retrieving Bingo cards:", error)
    return { isSuccess: false, message: "Failed to retrieve Bingo cards" }
  }
}