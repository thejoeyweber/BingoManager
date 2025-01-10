"use client"

import { useState } from "react"
import { generateBingoCardsAction } from "@/actions/db/bingo-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"

interface GenerateClientProps {
  gameId: string
}

export default function GenerateClient({ gameId }: GenerateClientProps) {
  const [quantity, setQuantity] = useState<number>(1)
  const [includeFreeSpace, setIncludeFreeSpace] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleGenerate = async () => {
    setLoading(true)
    try {
      const result = await generateBingoCardsAction(gameId, quantity, {
        includeFreeSpace
      })
      if (!result.isSuccess) {
        toast({
          title: "Error Generating Cards",
          description: result.message,
          variant: "destructive"
        })
      } else {
        toast({
          title: "Cards Generated",
          description: `${result.message}`
        })
      }
    } catch (error: any) {
      console.error("Error generating cards", error)
      toast({
        title: "Error Generating Cards",
        description: String(error),
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium">How many cards?</label>
        <Input
          type="number"
          min={1}
          max={100}
          value={quantity}
          onChange={e => setQuantity(Number(e.target.value))}
          className="mt-1 w-32"
        />
      </div>

      <div className="flex items-center gap-2">
        <Switch
          checked={includeFreeSpace}
          onCheckedChange={setIncludeFreeSpace}
        />
        <label>Include Free Space (center)</label>
      </div>

      <Button onClick={handleGenerate} disabled={loading}>
        {loading ? "Generating..." : "Generate Bingo Cards"}
      </Button>
    </div>
  )
}
