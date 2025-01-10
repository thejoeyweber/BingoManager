"use client"

import { SelectBingoItem } from "@/db/schema/bingo-schema"
import { useEffect, useState } from "react"

interface CallerClientProps {
  items: SelectBingoItem[]
}

export default function CallerClient({ items }: CallerClientProps) {
  const [calledItems, setCalledItems] = useState<SelectBingoItem[]>([])
  const [uncalledItems, setUncalledItems] = useState<SelectBingoItem[]>([])

  useEffect(() => {
    // Attempt to load from local storage
    const storedCalled = localStorage.getItem("bingo-called-items")
    const storedUncalled = localStorage.getItem("bingo-uncalled-items")
    if (storedCalled && storedUncalled) {
      try {
        setCalledItems(JSON.parse(storedCalled))
        setUncalledItems(JSON.parse(storedUncalled))
        return
      } catch (err) {
        console.error("Error parsing stored data:", err)
      }
    }
    // If none found or error, default to all items uncalled
    setCalledItems([])
    setUncalledItems(items)
  }, [items])

  useEffect(() => {
    // Update local storage whenever arrays change
    localStorage.setItem("bingo-called-items", JSON.stringify(calledItems))
    localStorage.setItem("bingo-uncalled-items", JSON.stringify(uncalledItems))
  }, [calledItems, uncalledItems])

  const handleCallNext = () => {
    if (uncalledItems.length === 0) {
      alert("All items have been called!")
      return
    }
    // Pick a random item from uncalled
    const randomIndex = Math.floor(Math.random() * uncalledItems.length)
    const nextItem = uncalledItems[randomIndex]

    // Move it to 'called' list
    setCalledItems(prev => [...prev, nextItem])

    // Remove from 'uncalled'
    setUncalledItems(prev => {
      const updated = [...prev]
      updated.splice(randomIndex, 1)
      return updated
    })
  }

  return (
    <div className="space-y-4">
      <button
        onClick={handleCallNext}
        className="bg-primary text-primary-foreground rounded-md px-4 py-2"
      >
        Call Next
      </button>

      <div>
        <h2 className="mb-2 font-semibold">Called Items</h2>
        {calledItems.length === 0 ? (
          <p>No items called yet.</p>
        ) : (
          <ol className="list-inside list-decimal space-y-1">
            {calledItems.map((item, index) => (
              <li key={index}>{item.label}</li>
            ))}
          </ol>
        )}
      </div>

      <div>
        <h2 className="mb-2 font-semibold">Remaining Items</h2>
        <p>{uncalledItems.length} items remain.</p>
      </div>
    </div>
  )
}
