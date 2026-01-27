import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, X, HelpCircle } from "lucide-react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface SearchOperator {
  key: string
  description: string
  example: string
}

const operators: SearchOperator[] = [
  { key: "status:", description: "Filtrer par statut", example: "status:open" },
  { key: "category:", description: "Filtrer par categorie", example: 'category:"Plomberie"' },
  { key: "assigned:", description: "Filtrer par technicien", example: "assigned:john" },
  { key: "created:", description: "Filtrer par date", example: "created:2024-01-01" },
  { key: "urgent:", description: "Filtrer les urgents", example: "urgent:true" },
  { key: "email:", description: "Filtrer par email client", example: "email:client@example.com" },
]

interface AdvancedSearchProps {
  value: string
  onChange: (value: string) => void
  onSearch: (query: string) => void
  placeholder?: string
  className?: string
}

export function AdvancedSearch({ value, onChange, onSearch, placeholder = "Rechercher...", className }: AdvancedSearchProps) {
  const [showHelp, setShowHelp] = useState(false)

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onSearch(value)
    }
  }

  const parseQuery = (query: string) => {
    const parts: Record<string, string> = {}
    const textParts: string[] = []

    // Parser les operateurs
    operators.forEach((op) => {
      const regex = new RegExp(`${op.key}([^\\s]+)`, "g")
      const matches = query.matchAll(regex)
      for (const match of matches) {
        parts[op.key] = match[1].replace(/"/g, "")
        query = query.replace(match[0], "")
      }
    })

    // Le reste est du texte libre
    const remaining = query.trim()
    if (remaining) {
      textParts.push(remaining)
    }

    return { parts, text: textParts.join(" ") }
  }

  return (
    <div className={className}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="pl-10 pr-20"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {value && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => {
                onChange("")
                onSearch("")
              }}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
          <Popover open={showHelp} onOpenChange={setShowHelp}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <HelpCircle className="h-3 w-3" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="space-y-2">
                <h4 className="font-semibold text-sm mb-3">Operateurs de recherche</h4>
                {operators.map((op) => (
                  <div key={op.key} className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="font-mono text-xs">
                        {op.key}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{op.description}</span>
                    </div>
                    <p className="text-xs text-muted-foreground ml-2 italic">{op.example}</p>
                  </div>
                ))}
                <div className="pt-2 border-t mt-2">
                  <p className="text-xs text-muted-foreground">
                    Combinez plusieurs operateurs :{" "}
                    <code className="bg-muted px-1 rounded">status:open urgent:true</code>
                  </p>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  )
}

