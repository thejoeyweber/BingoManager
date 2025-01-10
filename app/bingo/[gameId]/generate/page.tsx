"use server"

import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { getProfileByUserIdAction } from "@/actions/db/profiles-actions"
import { getBingoGamesAction } from "@/actions/db/bingo-actions"
import GenerateClient from "./_components/generate-client"

interface BingoGeneratePageProps {
  params: {
    gameId: string
  }
}

export default async function BingoGeneratePage({
  params
}: BingoGeneratePageProps) {
  const { userId } = auth()
  if (!userId) {
    redirect("/login")
  }

  // Confirm user has a profile
  const profileRes = await getProfileByUserIdAction(userId)
  if (!profileRes.isSuccess) {
    return <div>Profile not found. Please sign up.</div>
  }

  // Validate that the game belongs to this user
  const gamesRes = await getBingoGamesAction(userId)
  if (!gamesRes.isSuccess) {
    return <div>Error loading user games</div>
  }

  const gameExists = gamesRes.data.some(g => g.id === params.gameId)
  if (!gameExists) {
    return <div>Game not found or does not belong to you.</div>
  }

  // Render client component
  return (
    <div className="p-4">
      <h1 className="mb-4 text-xl font-bold">Generate Cards</h1>
      <GenerateClient gameId={params.gameId} />
    </div>
  )
}
