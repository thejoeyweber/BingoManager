"use server"

import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { getBingoGamesAction } from "@/actions/db/bingo-actions"

export default async function BingoDashboardPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect("/login")
  }

  const gamesRes = await getBingoGamesAction(userId!)
  if (!gamesRes.isSuccess) {
    return <div>Error fetching games: {gamesRes.message}</div>
  }

  const games = gamesRes.data
  if (games.length === 0) {
    return (
      <div style={{ padding: "2rem" }}>
        <h1>Your Bingo Games</h1>
        <p>No games yet!</p>
        <p>
          <a href="/bingo/new">Create a New Game</a>
        </p>
      </div>
    )
  }

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Your Bingo Games</h1>
      <ul style={{ marginTop: "1rem" }}>
        {games.map(game => (
          <li key={game.id}>
            <a href={`/bingo/${game.id}`}>
              {game.title} ({game.variant})
            </a>
          </li>
        ))}
      </ul>
      <p style={{ marginTop: "1rem" }}>
        <a href="/bingo/new">Create a New Game</a>
      </p>
    </div>
  )
}
