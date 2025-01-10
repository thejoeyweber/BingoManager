"use server"

import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { getBingoItemsAction } from "@/actions/db/bingo-actions"
import { getProfileByUserIdAction } from "@/actions/db/profiles-actions"
import SettingsClient from "./_components/settings-client"

interface BingoSettingsPageProps {
  params: {
    gameId: string
  }
}

export default async function BingoSettingsPage({
  params
}: BingoSettingsPageProps) {
  const { userId } = auth()

  if (!userId) {
    redirect("/login")
  }

  // Verify user profile or membership if needed
  const profileRes = await getProfileByUserIdAction(userId!)
  if (!profileRes.isSuccess) {
    return <div>Profile not found. Please sign up.</div>
  }

  // Fetch Bingo items for this game
  const itemsRes = await getBingoItemsAction(params.gameId)
  if (!itemsRes.isSuccess) {
    return <div>Error retrieving items: {itemsRes.message}</div>
  }

  // Render client component
  return (
    <SettingsClient gameId={params.gameId} initialItems={itemsRes.data || []} />
  )
}
