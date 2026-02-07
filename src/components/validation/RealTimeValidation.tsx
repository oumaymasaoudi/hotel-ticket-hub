import { useState, useEffect } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, XCircle, AlertCircle, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface ValidationRule {
  test: (value: string) => boolean | Promise<boolean>
  message: string
  async?: boolean
}

interface RealTimeValidationProps {
  value: string
  rules: ValidationRule[]
  onValidationChange?: (isValid: boolean, errors: string[]) => void
  className?: string
  showSuccess?: boolean
}

export function RealTimeValidation({
  value,
  rules,
  onValidationChange,
  className,
  showSuccess = true,
}: RealTimeValidationProps) {
  const [errors, setErrors] = useState<string[]>([])
  const [validating, setValidating] = useState(false)
  const [validated, setValidated] = useState(false)

  useEffect(() => {
    if (!value) {
      setErrors([])
      setValidated(false)
      if (onValidationChange) {
        onValidationChange(true, [])
      }
      return
    }

    const validate = async () => {
      setValidating(true)
      const newErrors: string[] = []

      for (const rule of rules) {
        try {
          const result = await rule.test(value)
          if (!result) {
            newErrors.push(rule.message)
          }
        } catch (error) {
          newErrors.push(rule.message)
        }
      }

      setErrors(newErrors)
      setValidated(true)
      setValidating(false)

      if (onValidationChange) {
        onValidationChange(newErrors.length === 0, newErrors)
      }
    }

    // Debounce pour eviter trop de validations
    const timeout = setTimeout(validate, 300)
    return () => clearTimeout(timeout)
  }, [value, rules, onValidationChange])

  if (!value || (!validated && !validating)) {
    return null
  }

  return (
    <div className={cn("space-y-2", className)}>
      {validating && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Validation en cours...</span>
        </div>
      )}

      {validated && (
        <>
          {errors.length === 0 && showSuccess && (
            <Alert className="border-green-200 bg-green-50 dark:bg-green-900/20">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800 dark:text-green-200">
                Validation reussie
              </AlertDescription>
            </Alert>
          )}

          {errors.length > 0 && (
            <div className="space-y-1">
              {errors.map((error, index) => (
                <Alert key={index} variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

// Hook pour validation en temps reel
export function useRealTimeValidation(
  value: string,
  rules: ValidationRule[]
): { isValid: boolean; errors: string[]; validating: boolean } {
  const [errors, setErrors] = useState<string[]>([])
  const [validating, setValidating] = useState(false)
  const [isValid, setIsValid] = useState(false)

  useEffect(() => {
    if (!value) {
      setErrors([])
      setIsValid(false)
      setValidating(false)
      return
    }

    const validate = async () => {
      setValidating(true)
      const newErrors: string[] = []

      for (const rule of rules) {
        try {
          const result = await rule.test(value)
          if (!result) {
            newErrors.push(rule.message)
          }
        } catch (error) {
          newErrors.push(rule.message)
        }
      }

      setErrors(newErrors)
      setIsValid(newErrors.length === 0)
      setValidating(false)
    }

    const timeout = setTimeout(validate, 300)
    return () => clearTimeout(timeout)
  }, [value, rules])

  return { isValid, errors, validating }
}

// Regles de validation predefinies
export const validationRules = {
  required: (message = "Ce champ est obligatoire"): ValidationRule => ({
    test: (value) => value.trim().length > 0,
    message,
  }),

  minLength: (min: number, message?: string): ValidationRule => ({
    test: (value) => value.length >= min,
    message: message || `Minimum ${min} caracteres requis`,
  }),

  maxLength: (max: number, message?: string): ValidationRule => ({
    test: (value) => value.length <= max,
    message: message || `Maximum ${max} caracteres autorises`,
  }),

  email: (message = "Email invalide"): ValidationRule => ({
    test: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    message,
  }),

  phone: (message = "Numero de telephone invalide"): ValidationRule => ({
    test: (value) => /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/.test(value),
    message,
  }),

  url: (message = "URL invalide"): ValidationRule => ({
    test: (value) => {
      try {
        new URL(value)
        return true
      } catch {
        return false
      }
    },
    message,
  }),

  pattern: (pattern: RegExp, message: string): ValidationRule => ({
    test: (value) => pattern.test(value),
    message,
  }),

  asyncCheck: (
    checkFn: (value: string) => Promise<boolean>,
    message: string
  ): ValidationRule => ({
    test: checkFn,
    message,
    async: true,
  }),
}

