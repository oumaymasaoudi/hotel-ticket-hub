import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ArrowRight, ArrowLeft, X } from "lucide-react"

interface TourStep {
  id: string
  title: string
  description: string
  target?: string // Selector CSS de l'element a mettre en evidence
}

interface OnboardingTourProps {
  steps: TourStep[]
  storageKey?: string
  onComplete?: () => void
}

export function OnboardingTour({ steps, storageKey = "onboarding-completed", onComplete }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const completed = localStorage.getItem(storageKey)
    if (!completed && steps.length > 0) {
      setOpen(true)
    }
  }, [storageKey, steps.length])

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = () => {
    localStorage.setItem(storageKey, "true")
    setOpen(false)
    if (onComplete) {
      onComplete()
    }
  }

  const handleSkip = () => {
    handleComplete()
  }

  const currentStepData = steps[currentStep]
  const progress = ((currentStep + 1) / steps.length) * 100

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Bienvenue !</DialogTitle>
            <Button variant="ghost" size="icon" onClick={handleSkip}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <DialogDescription>
            Decouvrez les fonctionnalites principales ({currentStep + 1}/{steps.length})
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Progress value={progress} className="h-2" />
          <div>
            <h3 className="font-semibold mb-2">{currentStepData?.title}</h3>
            <p className="text-sm text-muted-foreground">{currentStepData?.description}</p>
          </div>
        </div>
        <DialogFooter className="flex items-center justify-between">
          <Button variant="outline" onClick={handleSkip}>
            Passer
          </Button>
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
                "Terminer"
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

