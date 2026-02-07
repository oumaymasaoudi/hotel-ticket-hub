import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Edit } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface TicketTemplate {
  id: string;
  name: string;
  categoryId: string;
  categoryName: string;
  description: string;
  isUrgent: boolean;
}

const DEFAULT_TEMPLATES: TicketTemplate[] = [
  {
    id: "1",
    name: "Problème de plomberie",
    categoryId: "",
    categoryName: "Plomberie",
    description: "Problème de plomberie détecté. Veuillez vérifier et réparer.",
    isUrgent: false,
  },
  {
    id: "2",
    name: "Panne électrique",
    categoryId: "",
    categoryName: "Électricité",
    description: "Panne électrique signalée. Intervention nécessaire.",
    isUrgent: true,
  },
  {
    id: "3",
    name: "Problème WiFi",
    categoryId: "",
    categoryName: "WiFi/Internet",
    description: "Connexion WiFi défaillante. Vérification requise.",
    isUrgent: false,
  },
];

interface TicketTemplatesProps {
  readonly onSelectTemplate: (template: TicketTemplate) => void;
  readonly categories?: Array<{ id: string; name: string }>;
}

export function TicketTemplates({ onSelectTemplate, categories = [] }: TicketTemplatesProps) {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<TicketTemplate[]>(DEFAULT_TEMPLATES);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<TicketTemplate | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    categoryId: "",
    description: "",
    isUrgent: false,
  });

  const handleSelect = (template: TicketTemplate) => {
    onSelectTemplate(template);
    toast({
      title: "Template sélectionné",
      description: `Le template "${template.name}" a été appliqué`,
    });
  };

  const handleSave = () => {
    if (!formData.name || !formData.description) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }

    const selectedCategory = categories.find(c => c.id === formData.categoryId);

    if (editingTemplate) {
      setTemplates(prev =>
        prev.map(t =>
          t.id === editingTemplate.id
            ? {
              ...t,
              name: formData.name,
              categoryId: formData.categoryId,
              categoryName: selectedCategory?.name || "",
              description: formData.description,
              isUrgent: formData.isUrgent,
            }
            : t
        )
      );
      toast({
        title: "Succès",
        description: "Template modifié avec succès",
      });
    } else {
      const newTemplate: TicketTemplate = {
        id: Date.now().toString(),
        name: formData.name,
        categoryId: formData.categoryId,
        categoryName: selectedCategory?.name || "",
        description: formData.description,
        isUrgent: formData.isUrgent,
      };
      setTemplates(prev => [...prev, newTemplate]);
      toast({
        title: "Succès",
        description: "Template créé avec succès",
      });
    }

    setDialogOpen(false);
    setEditingTemplate(null);
    setFormData({ name: "", categoryId: "", description: "", isUrgent: false });
  };

  const handleDelete = (id: string) => {
    setTemplates(prev => prev.filter(t => t.id !== id));
    toast({
      title: "Succès",
      description: "Template supprimé",
    });
  };

  const handleEdit = (template: TicketTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      categoryId: template.categoryId,
      description: template.description,
      isUrgent: template.isUrgent,
    });
    setDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Templates de tickets</h3>
        <Button onClick={() => setDialogOpen(true)} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Nouveau template
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {templates.map((template) => (
          <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-base">{template.name}</CardTitle>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(template);
                    }}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(template.id);
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent
              onClick={() => handleSelect(template)}
              className="space-y-2"
            >
              <div className="flex items-center gap-2">
                <Badge variant="outline">{template.categoryName}</Badge>
                {template.isUrgent && (
                  <Badge variant="destructive">Urgent</Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {template.description}
              </p>
              <Button variant="outline" size="sm" className="w-full">
                Utiliser ce template
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? "Modifier le template" : "Nouveau template"}
            </DialogTitle>
            <DialogDescription>
              Créez un template pour accélérer la création de tickets récurrents
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="template-name">Nom du template *</Label>
              <Input
                id="template-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Problème de plomberie"
              />
            </div>
            {categories.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="template-category">Catégorie</Label>
                <select
                  id="template-category"
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Sélectionner une catégorie</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="template-description">Description *</Label>
              <Textarea
                id="template-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Description du problème..."
                rows={4}
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="template-urgent"
                checked={formData.isUrgent}
                onChange={(e) => setFormData({ ...formData, isUrgent: e.target.checked })}
                className="h-4 w-4"
              />
              <Label htmlFor="template-urgent" className="cursor-pointer">
                Marquer comme urgent
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setDialogOpen(false);
              setEditingTemplate(null);
              setFormData({ name: "", categoryId: "", description: "", isUrgent: false });
            }}>
              Annuler
            </Button>
            <Button onClick={handleSave}>
              {editingTemplate ? "Modifier" : "Créer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

