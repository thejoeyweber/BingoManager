"use client"

import { useState } from "react"
import { createBingoItemsAction, deleteBingoItemAction } from "@/actions/db/bingo-actions"
import { SelectBingoItem } from "@/db/schema/bingo-schema"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"

interface SettingsClientProps {
  gameId: string
  initialItems: SelectBingoItem[]
}

export default function SettingsClient({ gameId, initialItems }: SettingsClientProps) {
  const [items, setItems] = useState<SelectBingoItem[]>(initialItems)
  const [newLabel, setNewLabel] = useState("")
  const [isMandatory, setIsMandatory] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  async function handleAddItem() {
    if (!newLabel.trim()) return

    const result = await createBingoItemsAction(gameId, [
      { label: newLabel.trim(), isMandatory }
    ])
    if (!result.isSuccess) {
      setErrorMessage(result.message)
      return
    }

    setItems([...items, ...result.data])
    setNewLabel("")
    setIsMandatory(false)
    setErrorMessage("")
  }

  async function handleDeleteItem(itemId: string) {
    const result = await deleteBingoItemAction(itemId)
    if (!result.isSuccess) {
      setErrorMessage(result.message)
      return
    }
    setItems(items.filter(item => item.id !== itemId))
  }

  return (
    <div className="space-y-4 p-4">
      <h1 className="text-xl font-semibold">Manage Items</h1>

      {errorMessage && (
        <div className="text-red-500 mb-2">
          {errorMessage}
        </div>
      )}

      <div className="flex items-center gap-2">
        <Input
          value={newLabel}
          onChange={e => setNewLabel(e.target.value)}
          placeholder="Item label..."
        />
        <div className="flex items-center gap-1">
          <label className="text-sm">Mandatory?</label>
          <Switch
            checked={isMandatory}
            onCheckedChange={checked => setIsMandatory(checked)}
          />
        </div>
        <Button onClick={handleAddItem}>
          Add Item
        </Button>
      </div>

      <ul className="space-y-2 pt-4">
        {items.map(item => (
          <li key={item.id} className="flex items-center justify-between rounded-md border p-2">
            <div className="space-x-2">
              <span>{item.label}</span>
              {item.isMandatory && <span className="text-xs text-foreground/70">(Mandatory)</span>}
            </div>
            <Button variant="ghost" size="sm" onClick={() => handleDeleteItem(item.id)}>
              Delete
            </Button>
          </li>
        ))}
      </ul>
    </div>
  )
}