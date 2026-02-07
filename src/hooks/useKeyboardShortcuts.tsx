import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/useAuth"

interface Shortcut {
  key: string
  ctrl?: boolean
  shift?: boolean
  alt?: boolean
  action: () => void
  description: string
}

export function useKeyboardShortcuts() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { role } = useAuth()

  useEffect(() => {
    const shortcuts: Shortcut[] = [
      {
        key: "k",
        ctrl: true,
        action: () => {
          // Command Palette - deja gere par CommandPalette
          const event = new KeyboardEvent("keydown", {
            key: "k",
            ctrlKey: true,
            bubbles: true,
          })
          document.dispatchEvent(event)
        },
        description: "Ouvrir la recherche globale",
      },
      {
        key: "n",
        ctrl: true,
        action: () => {
          if (role === "admin" || role === "client") {
            navigate("/create-ticket")
            toast({
              title: "Nouveau ticket",
              description: "Formulaire de creation ouvert",
            })
          }
        },
        description: "Creer un nouveau ticket",
      },
      {
        key: "f",
        ctrl: true,
        action: () => {
          const searchInput = document.querySelector('input[type="search"], input[placeholder*="recherche" i]') as HTMLInputElement
          if (searchInput) {
            searchInput.focus()
            searchInput.select()
          }
        },
        description: "Rechercher dans la page",
      },
      {
        key: "/",
        action: () => {
          toast({
            title: "Raccourcis clavier",
            description: "Appuyez sur ? pour voir tous les raccourcis",
          })
        },
        description: "Aide",
      },
      {
        key: "?",
        action: () => {
          // Afficher la modal des raccourcis
          const shortcutsModal = document.getElementById("shortcuts-modal")
          if (shortcutsModal) {
            shortcutsModal.style.display = "block"
          }
        },
        description: "Afficher tous les raccourcis",
      },
      {
        key: "Escape",
        action: () => {
          // Fermer les modals ouverts
          const modals = document.querySelectorAll('[role="dialog"]')
          modals.forEach((modal) => {
            const closeButton = modal.querySelector('button[aria-label*="close" i], button[aria-label*="fermer" i]')
            if (closeButton) {
              ;(closeButton as HTMLButtonElement).click()
            }
          })
        },
        description: "Fermer les modals",
      },
    ]

    // Raccourcis de navigation (mode vim-like)
    const navigationShortcuts: Shortcut[] = [
      {
        key: "g",
        action: () => {
          // Premier appui sur 'g', attendre le second
          let gPressed = false
          const handler = (e: KeyboardEvent) => {
            if (e.key === "g" && !e.ctrlKey && !e.shiftKey && !e.altKey) {
              if (gPressed) {
                // 'gg' - Aller en haut
                window.scrollTo({ top: 0, behavior: "smooth" })
                gPressed = false
              } else {
                gPressed = true
                setTimeout(() => {
                  gPressed = false
                }, 1000)
              }
            } else if (gPressed) {
              // 'g' + autre touche
              switch (e.key.toLowerCase()) {
                case "d":
                  navigate(`/dashboard/${role}`)
                  break
                case "t":
                  navigate(`/dashboard/${role}?view=tickets`)
                  break
                case "h":
                  navigate(`/dashboard/${role}?view=hotels`)
                  break
              }
              gPressed = false
            }
          }
          document.addEventListener("keydown", handler)
          return () => document.removeEventListener("keydown", handler)
        },
        description: "Navigation rapide (g puis d/t/h)",
      },
    ]

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignorer si dans un input/textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement).isContentEditable
      ) {
        // Permettre certains raccourcis meme dans les inputs
        if (e.key === "Escape") {
          ;(e.target as HTMLElement).blur()
        }
        return
      }

      shortcuts.forEach((shortcut) => {
        const ctrlMatch = shortcut.ctrl ? e.ctrlKey || e.metaKey : !e.ctrlKey && !e.metaKey
        const shiftMatch = shortcut.shift === undefined ? true : shortcut.shift === e.shiftKey
        const altMatch = shortcut.alt === undefined ? true : shortcut.alt === e.altKey
        const keyMatch = e.key.toLowerCase() === shortcut.key.toLowerCase()

        if (ctrlMatch && shiftMatch && altMatch && keyMatch) {
          e.preventDefault()
          shortcut.action()
        }
      })
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [navigate, toast, role])
}

