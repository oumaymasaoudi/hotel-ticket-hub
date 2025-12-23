import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ImagePlus, X, Loader2, Image as ImageIcon } from "lucide-react";
import { apiService } from "@/services/apiService";

interface TicketImageUploadProps {
  ticketId?: string;
  onImagesChange?: (files: File[]) => void;
  existingImages?: { id: string; storage_path: string; file_name: string }[];
  maxImages?: number;
  readOnly?: boolean;
}

export const TicketImageUpload = ({
  ticketId,
  onImagesChange,
  existingImages = [],
  maxImages = 5,
  readOnly = false,
}: TicketImageUploadProps) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState(existingImages);
  const [uploadingFiles, setUploadingFiles] = useState<Set<number>>(new Set());

  useEffect(() => {
    setImages(existingImages);
  }, [existingImages]);

  const totalImages = images.length + pendingFiles.length;
  const canAddMore = totalImages < maxImages;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter((file) => {
      if (!file.type.startsWith("image/")) {
        toast({ title: "Erreur", description: `${file.name} n'est pas une image`, variant: "destructive" });
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast({ title: "Erreur", description: `${file.name} dépasse 5MB`, variant: "destructive" });
        return false;
      }
      return true;
    });

    const remainingSlots = maxImages - totalImages;
    const filesToAdd = validFiles.slice(0, remainingSlots);

    if (ticketId) {
      // Upload immédiat pour ticket existant
      handleUploadToExistingTicket(filesToAdd);
    } else {
      // Mode création : ajouter aux fichiers en attente
      const newPending = [...pendingFiles, ...filesToAdd];
      setPendingFiles(newPending);
      onImagesChange?.(newPending);
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleUploadToExistingTicket = async (files: File[]) => {
    if (!ticketId) return;

    setUploading(true);
    try {
      const response = await apiService.addImagesToTicket(ticketId, files);
      
      // Mettre à jour les images existantes
      if (response.images) {
        setImages(response.images);
      }

      toast({
        title: "Succès",
        description: `${files.length} photo(s) ajoutée(s) avec succès`,
      });

      // Notifier le parent si nécessaire
      if (onImagesChange) {
        onImagesChange([]);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Impossible d'ajouter les photos";
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const removePendingFile = (index: number) => {
    const newPending = pendingFiles.filter((_, i) => i !== index);
    setPendingFiles(newPending);
    onImagesChange?.(newPending);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <ImageIcon className="h-4 w-4" />
          <span>Photos ({totalImages}/{maxImages})</span>
        </div>
        {!readOnly && canAddMore && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4 mr-2" />}
            {ticketId ? "Ajouter des photos" : "Ajouter"}
          </Button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Grille d'images */}
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
        {/* Images existantes */}
        {images.map((image, index) => {
          // Extraire le nom de fichier du chemin de stockage
          const fileName = image.storage_path.split(/[/\\]/).pop() || image.file_name;
          const imageUrl = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'}/tickets/images/${fileName}`;
          
          return (
            <div key={image.id || index} className="relative group aspect-square rounded-lg overflow-hidden border bg-muted">
              <img
                src={imageUrl}
                alt={image.file_name}
                className="w-full h-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => window.open(imageUrl, '_blank')}
                onError={(e) => {
                  // Fallback si l'image n'est pas accessible
                  (e.target as HTMLImageElement).src = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="#ddd"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#999">Image</text></svg>')}`;
                }}
              />
              {!readOnly && (
                <button
                  type="button"
                  onClick={() => {
                    // TODO: Implémenter la suppression d'image
                    toast({
                      title: "Info",
                      description: "La suppression d'images sera disponible prochainement",
                    });
                  }}
                  className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          );
        })}

        {/* Fichiers en attente (mode création) */}
        {pendingFiles.map((file, index) => (
          <div key={`pending-${index}`} className="relative group aspect-square rounded-lg overflow-hidden border bg-muted">
            <img
              src={URL.createObjectURL(file)}
              alt={file.name}
              className="w-full h-full object-cover"
            />
            {!readOnly && (
              <button
                type="button"
                onClick={() => removePendingFile(index)}
                className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        ))}

        {/* Placeholder pour ajouter */}
        {!readOnly && canAddMore && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors"
          >
            <ImagePlus className="h-6 w-6 mb-1" />
            <span className="text-xs">Photo</span>
          </button>
        )}
      </div>

      {totalImages === 0 && readOnly && (
        <p className="text-sm text-muted-foreground italic">Aucune photo</p>
      )}
    </div>
  );
};