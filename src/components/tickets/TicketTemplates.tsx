import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { FileText, Plus, Trash2, Edit } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

export interface TicketTemplate {
  id: string
  name: string
  description: string
  categoryId: string
  isUrgent: boolean
  defaultTechnicianId?: string
}

interface TicketTemplatesProps {
  templates: TicketTemplate[]
  onUseTemplate: (template: TicketTemplate) => void
  onSaveTemplate?: (template: Omit<TicketTemplate, "id">) => void
  onDeleteTemplate?: (templateId: string) => void
  onEditTemplate?: (template: TicketTemplate) => void
  categories: Array<{ id: string; name: string }>
}

export function TicketTemplates({
  templates,
  onUseTemplate,
  onSaveTemplate,
  onDeleteTemplate,
  onEditTemplate,
  categories,
}: TicketTemplatesProps) {
  const [open, setOpen] = useState(false)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [newTemplate, setNewTemplate] = useState<Omit<TicketTemplate, "id">>({
    name: "",
    description: "",
    categoryId: "",
    isUrgent: false,
  })

  const handleUseTemplate = (template: TicketTemplate) => {
    onUseTemplate(template)
    setOpen(false)
  }

  const handleSaveTemplate = () => {
    if (newTemplate.name && newTemplate.description && newTemplate.categoryId && onSaveTemplate) {
      onSaveTemplate(newTemplate)
      setNewTemplate({
        name: "",
        description: "",
        categoryId: "",
        isUrgent: false,
      })
      setCreateDialogOpen(false)
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <FileText className="h-4 w-4 mr-2" />
            Templates
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Templates de tickets</DialogTitle>
            <DialogDescription>
              Utilisez un template pour creer rapidement un ticket recurrent
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[400px]">
            <div className="space-y-2">
              {templates.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Aucun template disponible
                </div>
              ) : (
                templates.map((template) => {
                  const category = categories.find((c) => c.id === template.categoryId)
                  return (
                    <div
                      key={template.id}
                      className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium">{template.name}</h4>
                          {template.isUrgent && (
                            <Badge variant="destructive" className="text-xs">
                              Urgent
                            </Badge>
                          )}
                          {category && (
                            <Badge variant="outline" className="text-xs">
                              {category.name}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {template.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        {onEditTemplate && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              onEditTemplate(template)
                              setOpen(false)
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        {onDeleteTemplate && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDeleteTemplate(template.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                        <Button size="sm" onClick={() => handleUseTemplate(template)}>
                          Utiliser
                        </Button>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </ScrollArea>
          <DialogFooter>
            {onSaveTemplate && (
              <Button variant="outline" onClick={() => setCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Creer un template
              </Button>
            )}
            <Button variant="outline" onClick={() => setOpen(false)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de creation de template */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Creer un template</DialogTitle>
            <DialogDescription>
              Enregistrez un template pour reutiliser rapidement
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nom du template</Label>
              <Input
                value={newTemplate.name}
                onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                placeholder="Ex: Probleme de plomberie"
                className="mt-2"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={newTemplate.description}
                onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
                placeholder="Description par defaut du ticket"
                className="mt-2"
                rows={4}
              />
            </div>
            <div>
              <Label>Categorie</Label>
              <select
                value={newTemplate.categoryId}
                onChange={(e) => setNewTemplate({ ...newTemplate, categoryId: e.target.value })}
                className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2"
              >
                <option value="">Selectionner une categorie</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="urgent-template"
                checked={newTemplate.isUrgent}
                onChange={(e) => setNewTemplate({ ...newTemplate, isUrgent: e.target.checked })}
                className="rounded border-gray-300"
              />
              <Label htmlFor="urgent-template" className="cursor-pointer">
                Marquer comme urgent par defaut
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleSaveTemplate}
              disabled={!newTemplate.name || !newTemplate.description || !newTemplate.categoryId}
            >
              Creer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

