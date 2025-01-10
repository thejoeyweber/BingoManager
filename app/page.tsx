"use server"

import { auth } from "@clerk/nextjs"
import { redirect } from "next/navigation"

export default async function RootHomePage() {
  const { userId } = await auth()

  if (!userId) {
    return (
      <div style={{ padding: "2rem" }}>
        <h1>Welcome to Bingo Manager</h1>
        <p>
          <a href="/login" style={{ marginRight: "1rem" }}>
            Log In
          </a>
          <a href="/signup">Sign Up</a>
        </p>
      </div>
    )
  }

  // If user is logged in, redirect to /bingo
  redirect("/bingo")
}
