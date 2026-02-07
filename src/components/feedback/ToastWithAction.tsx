import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Undo2 } from "lucide-react"

interface ToastWithActionOptions {
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  undo?: {
    label?: string
    onUndo: () => void
  }
  duration?: number
}

export function useToastWithAction() {
  const { toast } = useToast()

  const showToast = ({ title, description, action, undo, duration = 5000 }: ToastWithActionOptions) => {
    const toastId = toast({
      title,
      description: (
        <div className="space-y-2">
          {description && <p>{description}</p>}
          <div className="flex items-center gap-2">
            {action && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  action.onClick()
                  toast.dismiss(toastId.id)
                }}
              >
                {action.label}
              </Button>
            )}
            {undo && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  undo.onUndo()
                  toast.dismiss(toastId.id)
                }}
              >
                <Undo2 className="h-3 w-3 mr-1" />
                {undo.label || "Annuler"}
              </Button>
            )}
          </div>
        </div>
      ),
      duration,
    })
  }

  return { showToast }
}

