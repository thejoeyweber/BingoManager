"use server"

import { auth } from "@clerk/nextjs/server"
import { createBingoGameAction } from "@/actions/db/bingo-actions"
import { redirect } from "next/navigation"

export default async function BingoNewPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect("/login")
  }

  async function handleCreateGame(formData: FormData) {
    "use server"
    const title = formData.get("title") as string
    const variant = formData.get("variant") as string

    if (!title || !variant) {
      return { error: "Title and variant required" }
    }

    const res = await createBingoGameAction(userId!, { title, variant })
    if (!res.isSuccess) {
      return { error: res.message }
    }

    // Once created, redirect to /bingo
    redirect("/bingo")
  }

  return (
    <form style={{ padding: "2rem" }} action={handleCreateGame}>
      <h1>Create a New Bingo Game</h1>

      <p>
        <label htmlFor="title">Game Title:</label>
        <br />
        <input type="text" name="title" id="title" required />
      </p>

      <p>
        <label htmlFor="variant">Variant (e.g. "5×5 Standard"):</label>
        <br />
        <input type="text" name="variant" id="variant" required />
      </p>

      <p>
        <button type="submit">Create Game</button>
      </p>
    </form>
  )
}
