"use server"

import { auth } from "@clerk/nextjs/server"
import { getProfileByUserIdAction } from "@/actions/db/profiles-actions"
import { getBingoItemsAction } from "@/actions/db/bingo-actions"
import { redirect } from "next/navigation"
import CallerClient from "./_components/caller-client"

interface BingoCallerPageProps {
  params: {
    gameId: string
  }
}

export default async function BingoCallerPage({
  params
}: BingoCallerPageProps) {
  const { userId } = auth()
  if (!userId) {
    redirect("/login")
  }

  // Verify user profile
  const profileRes = await getProfileByUserIdAction(userId)
  if (!profileRes.isSuccess) {
    return <div>Profile not found. Please sign up.</div>
  }

  // Fetch Bingo items for this game
  const itemsRes = await getBingoItemsAction(params.gameId)
  if (!itemsRes.isSuccess) {
    return <div>Error retrieving items: {itemsRes.message}</div>
  }

  // Render client component for the caller screen
  return (
    <div className="p-4">
      <h1 className="mb-4 text-xl font-bold">Caller Screen</h1>
      <CallerClient items={itemsRes.data || []} />
    </div>
  )
}
