import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Filter, X, Save, Trash2 } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"

export interface FilterState {
  status?: string[]
  category?: string[]
  technician?: string[]
  dateRange?: {
    start?: string
    end?: string
  }
  urgent?: boolean
  search?: string
}

interface AdvancedFiltersProps {
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  onSaveFilter?: (name: string, filters: FilterState) => void
  savedFilters?: Array<{ name: string; filters: FilterState }>
  onLoadFilter?: (filters: FilterState) => void
  onDeleteFilter?: (name: string) => void
  availableStatuses?: string[]
  availableCategories?: string[]
  availableTechnicians?: Array<{ id: string; name: string }>
}

export function AdvancedFilters({
  filters,
  onFiltersChange,
  onSaveFilter,
  savedFilters = [],
  onLoadFilter,
  onDeleteFilter,
  availableStatuses = [],
  availableCategories = [],
  availableTechnicians = [],
}: AdvancedFiltersProps) {
  const [open, setOpen] = useState(false)
  const [saveDialogOpen, setSaveDialogOpen] = useState(false)
  const [filterName, setFilterName] = useState("")
  const [localFilters, setLocalFilters] = useState<FilterState>(filters)

  const activeFiltersCount = Object.values(filters).filter((v) => {
    if (Array.isArray(v)) return v.length > 0
    if (typeof v === "object" && v !== null) return Object.keys(v).length > 0
    return Boolean(v)
  }).length

  const handleApply = () => {
    onFiltersChange(localFilters)
    setOpen(false)
  }

  const handleReset = () => {
    const emptyFilters: FilterState = {}
    setLocalFilters(emptyFilters)
    onFiltersChange(emptyFilters)
  }

  const handleSaveFilter = () => {
    if (filterName && onSaveFilter) {
      onSaveFilter(filterName, localFilters)
      setFilterName("")
      setSaveDialogOpen(false)
    }
  }

  const handleLoadFilter = (savedFilter: FilterState) => {
    setLocalFilters(savedFilter)
    if (onLoadFilter) {
      onLoadFilter(savedFilter)
    }
    setOpen(false)
  }

  const toggleStatus = (status: string) => {
    setLocalFilters((prev) => ({
      ...prev,
      status: prev.status?.includes(status)
        ? prev.status.filter((s) => s !== status)
        : [...(prev.status || []), status],
    }))
  }

  const toggleCategory = (category: string) => {
    setLocalFilters((prev) => ({
      ...prev,
      category: prev.category?.includes(category)
        ? prev.category.filter((c) => c !== category)
        : [...(prev.category || []), category],
    }))
  }

  const toggleTechnician = (technicianId: string) => {
    setLocalFilters((prev) => ({
      ...prev,
      technician: prev.technician?.includes(technicianId)
        ? prev.technician.filter((t) => t !== technicianId)
        : [...(prev.technician || []), technicianId],
    }))
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="relative">
            <Filter className="h-4 w-4 mr-2" />
            Filtres avances
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 flex items-center justify-center">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Filtres avances</DialogTitle>
            <DialogDescription>
              Configurez des filtres complexes pour trouver rapidement les tickets
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-6">
              {/* Filtres sauvegardes */}
              {savedFilters.length > 0 && (
                <div>
                  <Label className="mb-2 block">Filtres sauvegardes</Label>
                  <div className="flex flex-wrap gap-2">
                    {savedFilters.map((saved, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                        onClick={() => handleLoadFilter(saved.filters)}
                      >
                        {saved.name}
                        {onDeleteFilter && (
                          <X
                            className="h-3 w-3 ml-1"
                            onClick={(e) => {
                              e.stopPropagation()
                              onDeleteFilter(saved.name)
                            }}
                          />
                        )}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Statut */}
              {availableStatuses.length > 0 && (
                <div>
                  <Label>Statut</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {availableStatuses.map((status) => (
                      <div key={status} className="flex items-center space-x-2">
                        <Checkbox
                          id={`status-${status}`}
                          checked={localFilters.status?.includes(status) || false}
                          onCheckedChange={() => toggleStatus(status)}
                        />
                        <Label
                          htmlFor={`status-${status}`}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {status}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Categories */}
              {availableCategories.length > 0 && (
                <div>
                  <Label>Categories</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {availableCategories.map((category) => (
                      <div key={category} className="flex items-center space-x-2">
                        <Checkbox
                          id={`category-${category}`}
                          checked={localFilters.category?.includes(category) || false}
                          onCheckedChange={() => toggleCategory(category)}
                        />
                        <Label
                          htmlFor={`category-${category}`}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {category}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Techniciens */}
              {availableTechnicians.length > 0 && (
                <div>
                  <Label>Techniciens</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {availableTechnicians.map((tech) => (
                      <div key={tech.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`tech-${tech.id}`}
                          checked={localFilters.technician?.includes(tech.id) || false}
                          onCheckedChange={() => toggleTechnician(tech.id)}
                        />
                        <Label
                          htmlFor={`tech-${tech.id}`}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {tech.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Date range */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Date de debut</Label>
                  <Input
                    type="date"
                    value={localFilters.dateRange?.start || ""}
                    onChange={(e) =>
                      setLocalFilters((prev) => ({
                        ...prev,
                        dateRange: { ...prev.dateRange, start: e.target.value },
                      }))
                    }
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>Date de fin</Label>
                  <Input
                    type="date"
                    value={localFilters.dateRange?.end || ""}
                    onChange={(e) =>
                      setLocalFilters((prev) => ({
                        ...prev,
                        dateRange: { ...prev.dateRange, end: e.target.value },
                      }))
                    }
                    className="mt-2"
                  />
                </div>
              </div>

              {/* Urgent */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="urgent"
                  checked={localFilters.urgent || false}
                  onCheckedChange={(checked) =>
                    setLocalFilters((prev) => ({ ...prev, urgent: checked as boolean }))
                  }
                />
                <Label htmlFor="urgent" className="text-sm font-normal cursor-pointer">
                  Tickets urgents uniquement
                </Label>
              </div>

              {/* Recherche textuelle */}
              <div>
                <Label>Recherche textuelle</Label>
                <Input
                  placeholder="Rechercher dans les descriptions..."
                  value={localFilters.search || ""}
                  onChange={(e) =>
                    setLocalFilters((prev) => ({ ...prev, search: e.target.value }))
                  }
                  className="mt-2"
                />
              </div>
            </div>
          </ScrollArea>
          <DialogFooter className="flex items-center justify-between">
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleReset}>
                <Trash2 className="h-4 w-4 mr-2" />
                Reinitialiser
              </Button>
              {onSaveFilter && (
                <Button variant="outline" onClick={() => setSaveDialogOpen(true)}>
                  <Save className="h-4 w-4 mr-2" />
                  Sauvegarder
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleApply}>Appliquer</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog pour sauvegarder un filtre */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sauvegarder le filtre</DialogTitle>
            <DialogDescription>
              Donnez un nom a ce filtre pour le reutiliser plus tard
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nom du filtre</Label>
              <Input
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
                placeholder="Ex: Mes tickets urgents"
                className="mt-2"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSaveFilter} disabled={!filterName}>
              Sauvegarder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

