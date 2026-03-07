import { useEffect, useRef, useState } from "react"
import { useToast } from "@/hooks/use-toast"

interface DraftSaverProps {
  formData: Record<string, unknown>
  storageKey: string
  saveInterval?: number // en millisecondes
  onRestore?: (data: Record<string, unknown>) => void
}

export function DraftSaver({
  formData,
  storageKey,
  saveInterval = 30000, // 30 secondes par défaut
  onRestore,
}: DraftSaverProps) {
  const { toast } = useToast()
  const lastSaveRef = useRef<number>(0)
  const saveTimeoutRef = useRef<NodeJS.Timeout>()

  // Restaurer le brouillon au chargement
  useEffect(() => {
    const saved = localStorage.getItem(storageKey)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (onRestore) {
          onRestore(parsed)
          toast({
            title: "Brouillon restauré",
            description: "Vos modifications précédentes ont été restaurées.",
          })
        }
      } catch (error) {
        console.error("Error restoring draft:", error)
      }
    }
  }, [storageKey, onRestore, toast])

  // Auto-sauvegarder périodiquement
  useEffect(() => {
    const now = Date.now()
    const timeSinceLastSave = now - lastSaveRef.current

    if (timeSinceLastSave >= saveInterval) {
      saveDraft()
    } else {
      // Programmer la prochaine sauvegarde
      saveTimeoutRef.current = setTimeout(() => {
        saveDraft()
      }, saveInterval - timeSinceLastSave)
    }

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [formData, storageKey, saveInterval])

  // Sauvegarder avant de quitter la page
  useEffect(() => {
    const handleBeforeUnload = () => {
      saveDraft()
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
    }
  }, [formData, storageKey])

  const saveDraft = () => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(formData))
      lastSaveRef.current = Date.now()
    } catch (error) {
      console.error("Error saving draft:", error)
    }
  }

  return null // Ce composant ne rend rien visuellement
}

// Hook pour utiliser facilement la sauvegarde de brouillon
export function useDraftSaver<T extends Record<string, any>>(
  storageKey: string,
  initialData: T,
  saveInterval = 30000
) {
  const [formData, setFormData] = useState<T>(initialData)

  useEffect(() => {
    const saved = localStorage.getItem(storageKey)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setFormData(parsed)
      } catch (error) {
        console.error("Error restoring draft:", error)
      }
    }
  }, [storageKey])

  useEffect(() => {
    const timeout = setTimeout(() => {
      localStorage.setItem(storageKey, JSON.stringify(formData))
    }, saveInterval)

    return () => clearTimeout(timeout)
  }, [formData, storageKey, saveInterval])

  const clearDraft = () => {
    localStorage.removeItem(storageKey)
    setFormData(initialData)
  }

  return { formData, setFormData, clearDraft }
}
