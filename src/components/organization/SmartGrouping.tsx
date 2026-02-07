import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, ChevronRight, Filter } from "lucide-react"
import { TicketResponse } from "@/services/apiService"
import { cn } from "@/lib/utils"

interface GroupingOption {
  key: string
  label: string
  groupBy: (item: TicketResponse) => string
  sortBy?: (a: TicketResponse, b: TicketResponse) => number
}

interface SmartGroupingProps<T> {
  items: T[]
  groupingOptions: GroupingOption[]
  defaultGrouping?: string
  renderItem: (item: T) => React.ReactNode
  renderGroupHeader?: (groupKey: string, items: T[]) => React.ReactNode
  className?: string
}

export function SmartGrouping<T extends TicketResponse>({
  items,
  groupingOptions,
  defaultGrouping,
  renderItem,
  renderGroupHeader,
  className,
}: SmartGroupingProps<T>) {
  const [selectedGrouping, setSelectedGrouping] = useState<string>(
    defaultGrouping || groupingOptions[0]?.key || ""
  )
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())

  const selectedOption = groupingOptions.find((opt) => opt.key === selectedGrouping)

  const groupedItems = useMemo(() => {
    if (!selectedOption) return {}

    const groups: Record<string, T[]> = {}

    items.forEach((item) => {
      const groupKey = selectedOption.groupBy(item)
      if (!groups[groupKey]) {
        groups[groupKey] = []
      }
      groups[groupKey].push(item)
    })

    // Trier les items dans chaque groupe si un sortBy est defini
    if (selectedOption.sortBy) {
      Object.keys(groups).forEach((key) => {
        groups[key].sort(selectedOption.sortBy!)
      })
    }

    return groups
  }, [items, selectedOption])

  const toggleGroup = (groupKey: string) => {
    setExpandedGroups((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(groupKey)) {
        newSet.delete(groupKey)
      } else {
        newSet.add(groupKey)
      }
      return newSet
    })
  }

  const expandAll = () => {
    setExpandedGroups(new Set(Object.keys(groupedItems)))
  }

  const collapseAll = () => {
    setExpandedGroups(new Set())
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Tickets groupes</CardTitle>
          <div className="flex items-center gap-2">
            <select
              value={selectedGrouping}
              onChange={(e) => setSelectedGrouping(e.target.value)}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {groupingOptions.map((option) => (
                <option key={option.key} value={option.key}>
                  {option.label}
                </option>
              ))}
            </select>
            <Button variant="outline" size="sm" onClick={expandAll}>
              Tout developper
            </Button>
            <Button variant="outline" size="sm" onClick={collapseAll}>
              Tout reduire
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {Object.entries(groupedItems).map(([groupKey, groupItems]) => {
            const isExpanded = expandedGroups.has(groupKey)

            return (
              <Collapsible key={groupKey} open={isExpanded} onOpenChange={() => toggleGroup(groupKey)}>
                <CollapsibleTrigger className="w-full">
                  <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-2">
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                      {renderGroupHeader ? (
                        renderGroupHeader(groupKey, groupItems)
                      ) : (
                        <div>
                          <div className="font-medium">{groupKey}</div>
                          <div className="text-sm text-muted-foreground">
                            {groupItems.length} ticket(s)
                          </div>
                        </div>
                      )}
                    </div>
                    <Badge variant="secondary">{groupItems.length}</Badge>
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="ml-6 mt-2 space-y-2">
                    {groupItems.map((item) => (
                      <div key={item.id}>{renderItem(item)}</div>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

