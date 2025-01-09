"use server"

import { auth } from "@clerk/nextjs/server"
import { getBingoCardsAction } from "@/actions/db/bingo-actions"
import { redirect } from "next/navigation"

interface BingoPrintPageProps {
  params: {
    gameId: string
  }
}

export default async function BingoPrintPage({ params }: BingoPrintPageProps) {
  const { userId } = auth()
  if (!userId) {
    redirect("/login")
  }

  // Retrieve existing Bingo cards
  const cardsRes = await getBingoCardsAction(params.gameId)
  if (!cardsRes.isSuccess) {
    return <div>Error retrieving cards: {cardsRes.message}</div>
  }

  const cards = cardsRes.data

  if (cards.length === 0) {
    return <div>No cards found for this game. Please generate some first.</div>
  }

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Print Bingo Cards</h1>
      <div className="flex flex-col gap-8">
        {cards.map((card, index) => {
          const cardData = JSON.parse(card.cardData) as {
            items: {
              id: string
              label: string
              imageUrl?: string
              isMandatory: boolean
            }[]
          }

          return (
            <div key={card.id} className="border p-4 rounded-md break-inside-avoid">
              <h2 className="font-semibold mb-2">Card {index + 1}</h2>
              <div className="grid grid-cols-5 gap-2">
                {cardData.items.map((item, iIdx) => (
                  <div
                    key={iIdx}
                    className="flex h-24 items-center justify-center border text-center text-sm"
                  >
                    {item.label}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}