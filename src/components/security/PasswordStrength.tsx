import { useState, useEffect } from "react"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface PasswordStrengthProps {
  password: string
  className?: string
  showSuggestions?: boolean
}

interface StrengthLevel {
  level: "weak" | "fair" | "good" | "strong" | "very-strong"
  score: number
  color: string
  label: string
}

export function PasswordStrength({ password, className, showSuggestions = true }: PasswordStrengthProps) {
  const [strength, setStrength] = useState<StrengthLevel>({
    level: "weak",
    score: 0,
    color: "bg-red-500",
    label: "Faible",
  })

  useEffect(() => {
    const result = calculateStrength(password)
    setStrength(result)
  }, [password])

  const calculateStrength = (pwd: string): StrengthLevel => {
    if (!pwd) {
      return { level: "weak", score: 0, color: "bg-gray-300", label: "Aucun" }
    }

    let score = 0
    const checks = {
      length: pwd.length >= 8,
      uppercase: /[A-Z]/.test(pwd),
      lowercase: /[a-z]/.test(pwd),
      numbers: /[0-9]/.test(pwd),
      special: /[^A-Za-z0-9]/.test(pwd),
      long: pwd.length >= 12,
    }

    if (checks.length) score += 1
    if (checks.uppercase) score += 1
    if (checks.lowercase) score += 1
    if (checks.numbers) score += 1
    if (checks.special) score += 1
    if (checks.long) score += 1

    const percentage = (score / 6) * 100

    if (percentage < 30) {
      return { level: "weak", score: percentage, color: "bg-red-500", label: "Faible" }
    } else if (percentage < 50) {
      return { level: "fair", score: percentage, color: "bg-orange-500", label: "Moyen" }
    } else if (percentage < 70) {
      return { level: "good", score: percentage, color: "bg-yellow-500", label: "Bon" }
    } else if (percentage < 90) {
      return { level: "strong", score: percentage, color: "bg-green-500", label: "Fort" }
    } else {
      return { level: "very-strong", score: percentage, color: "bg-emerald-600", label: "Tres fort" }
    }
  }

  const getSuggestions = () => {
    const suggestions: string[] = []
    if (password.length < 8) {
      suggestions.push("Au moins 8 caracteres")
    }
    if (!/[A-Z]/.test(password)) {
      suggestions.push("Ajouter une majuscule")
    }
    if (!/[a-z]/.test(password)) {
      suggestions.push("Ajouter une minuscule")
    }
    if (!/[0-9]/.test(password)) {
      suggestions.push("Ajouter un chiffre")
    }
    if (!/[^A-Za-z0-9]/.test(password)) {
      suggestions.push("Ajouter un caractere special (!@#$%^&*)")
    }
    if (password.length < 12) {
      suggestions.push("12+ caracteres pour plus de securite")
    }
    return suggestions
  }

  const requirements = [
    { label: "8 caracteres minimum", met: password.length >= 8 },
    { label: "Une majuscule", met: /[A-Z]/.test(password) },
    { label: "Une minuscule", met: /[a-z]/.test(password) },
    { label: "Un chiffre", met: /[0-9]/.test(password) },
    { label: "Un caractere special", met: /[^A-Za-z0-9]/.test(password) },
  ]

  if (!password) return null

  return (
    <div className={cn("space-y-2", className)}>
      <div className="space-y-1">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Force du mot de passe</span>
          <span className={cn("font-medium", `text-${strength.color.replace("bg-", "")}`)}>
            {strength.label}
          </span>
        </div>
        <Progress value={strength.score} className="h-2" />
      </div>

      {showSuggestions && (
        <>
          <div className="space-y-1 text-sm">
            {requirements.map((req, index) => (
              <div key={index} className="flex items-center gap-2">
                {req.met ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-muted-foreground" />
                )}
                <span className={cn(req.met ? "text-green-600" : "text-muted-foreground")}>
                  {req.label}
                </span>
              </div>
            ))}
          </div>

          {getSuggestions().length > 0 && (
            <div className="rounded-md bg-yellow-50 dark:bg-yellow-900/20 p-3 text-sm">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                    Suggestions :
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-yellow-700 dark:text-yellow-300">
                    {getSuggestions().map((suggestion, index) => (
                      <li key={index}>{suggestion}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

