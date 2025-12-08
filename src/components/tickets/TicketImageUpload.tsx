import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ImagePlus, X, Loader2, Image as ImageIcon } from "lucide-react";

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
      uploadFiles(filesToAdd);
    } else {
      const newPending = [...pendingFiles, ...filesToAdd];
      setPendingFiles(newPending);
      onImagesChange?.(newPending);
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const uploadFiles = async (files: File[]) => {
    if (!ticketId) return;
    setUploading(true);

    for (const file of files) {
      const fileExt = file.name.split(".").pop();
      const fileName = `${ticketId}/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("ticket-images")
        .upload(fileName, file);

      if (uploadError) {
        toast({ title: "Erreur", description: `Échec de l'upload: ${file.name}`, variant: "destructive" });
        continue;
      }

      const { error: dbError } = await supabase.from("ticket_images").insert({
        ticket_id: ticketId,
        storage_path: fileName,
        file_name: file.name,
      });

      if (dbError) {
        console.error("DB Error:", dbError);
      }
    }

    await fetchImages();
    setUploading(false);
    toast({ title: "Images uploadées avec succès" });
  };

  const fetchImages = async () => {
    if (!ticketId) return;
    const { data } = await supabase
      .from("ticket_images")
      .select("*")
      .eq("ticket_id", ticketId)
      .order("created_at", { ascending: true });
    setImages(data || []);
  };

  const removePendingFile = (index: number) => {
    const newPending = pendingFiles.filter((_, i) => i !== index);
    setPendingFiles(newPending);
    onImagesChange?.(newPending);
  };

  const removeUploadedImage = async (imageId: string, storagePath: string) => {
    await supabase.storage.from("ticket-images").remove([storagePath]);
    await supabase.from("ticket_images").delete().eq("id", imageId);
    setImages(images.filter((img) => img.id !== imageId));
    toast({ title: "Image supprimée" });
  };

  const getImageUrl = (storagePath: string) => {
    const { data } = supabase.storage.from("ticket-images").getPublicUrl(storagePath);
    return data.publicUrl;
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
            Ajouter
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
        {/* Images uploadées */}
        {images.map((img) => (
          <div key={img.id} className="relative group aspect-square rounded-lg overflow-hidden border bg-muted">
            <img
              src={getImageUrl(img.storage_path)}
              alt={img.file_name}
              className="w-full h-full object-cover"
            />
            {!readOnly && (
              <button
                type="button"
                onClick={() => removeUploadedImage(img.id, img.storage_path)}
                className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        ))}

        {/* Fichiers en attente (mode création) */}
        {pendingFiles.map((file, index) => (
          <div key={index} className="relative group aspect-square rounded-lg overflow-hidden border bg-muted">
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
        {!readOnly && canAddMore && totalImages === 0 && (
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