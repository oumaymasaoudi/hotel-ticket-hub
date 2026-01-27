import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, ArrowRight, Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface WorkflowStep {
  id: string
  title: string
  description: string
  component: React.ReactNode
  validate?: () => boolean
  optional?: boolean
}

interface WorkflowWizardProps {
  steps: WorkflowStep[]
  onComplete: (data: Record<string, any>) => void
  onCancel?: () => void
  title?: string
  description?: string
}

export function WorkflowWizard({
  steps,
  onComplete,
  onCancel,
  title = "Assistant",
  description = "Suivez les etapes pour completer l'action",
}: WorkflowWizardProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())

  const currentStepData = steps[currentStep]
  const progress = ((currentStep + 1) / steps.length) * 100

  const handleNext = () => {
    if (currentStepData.validate && !currentStepData.validate()) {
      return
    }

    setCompletedSteps(new Set([...completedSteps, currentStep]))

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      onComplete(formData)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSkip = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const updateFormData = (key: string, value: any) => {
    setFormData({ ...formData, [key]: value })
  }

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">
              Etape {currentStep + 1} sur {steps.length}
            </span>
            <span className="text-sm font-medium">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Indicateur des etapes */}
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors",
                      index < currentStep
                        ? "bg-primary text-primary-foreground border-primary"
                        : index === currentStep
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background text-muted-foreground border-muted"
                    )}
                  >
                    {index < currentStep ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </div>
                  <div className="mt-2 text-xs text-center max-w-[100px]">
                    <div
                      className={cn(
                        index <= currentStep ? "font-medium" : "text-muted-foreground"
                      )}
                    >
                      {step.title}
                    </div>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      "flex-1 h-0.5 mx-2",
                      index < currentStep ? "bg-primary" : "bg-muted"
                    )}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Contenu de l'etape actuelle */}
          <div className="min-h-[300px]">
            <div className="mb-4">
              <h3 className="text-lg font-semibold">{currentStepData.title}</h3>
              <p className="text-sm text-muted-foreground">{currentStepData.description}</p>
            </div>
            <div>
              {typeof currentStepData.component === "function"
                ? currentStepData.component({ formData, updateFormData })
                : currentStepData.component}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div>
              {onCancel && (
                <Button variant="outline" onClick={onCancel}>
                  Annuler
                </Button>
              )}
              {currentStepData.optional && (
                <Button variant="ghost" onClick={handleSkip} className="ml-2">
                  Passer cette etape
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              {currentStep > 0 && (
                <Button variant="outline" onClick={handlePrevious}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Precedent
                </Button>
              )}
              <Button onClick={handleNext}>
                {currentStep < steps.length - 1 ? (
                  <>
                    Suivant
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Terminer
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

