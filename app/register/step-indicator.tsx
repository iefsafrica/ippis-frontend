"use client"

import { CheckCircle2 } from "lucide-react"

interface StepIndicatorProps {
  currentStep: number
  maxVisitedStep: number
  onStepSelect?: (step: number) => void
}

export function StepIndicator({
  currentStep,
  maxVisitedStep,
  onStepSelect,
}: StepIndicatorProps) {
  const steps = [
    { number: 1, title: "Verification", shortTitle: "Verify" },
    { number: 2, title: "Personal Information", shortTitle: "Personal" },
    { number: 3, title: "Employment Information", shortTitle: "Employment" },
    { number: 4, title: "Document Upload", shortTitle: "Documents" },
    { number: 5, title: "Review & Submit", shortTitle: "Review" },
  ]

  const handleStepClick = (stepNumber: number) => {
    if (!onStepSelect) return
    onStepSelect(stepNumber)
  }

  return (
    <div className="w-full py-2 sm:py-4">
      <div className="flex justify-between items-start gap-1 sm:gap-2">
        {steps.map((step) => {
          const isActive = currentStep === step.number
          const isComplete = currentStep > step.number
          const isClickable =
            step.number <= Math.max(currentStep, maxVisitedStep) &&
            typeof onStepSelect === "function"

          const circleClasses = isActive || isComplete
            ? "bg-emerald-600 shadow-[0_6px_16px_rgba(16,185,129,0.35)] border border-emerald-700 text-white"
            : "border border-gray-300 bg-white text-gray-400"

          return (
            <button
              type="button"
              key={step.number}
              className={`flex flex-1 flex-col items-center gap-1 transition-all duration-200 focus:outline-none min-w-0 ${
                isClickable ? "cursor-pointer hover:opacity-90" : "cursor-default opacity-80"
              }`}
              onClick={() => isClickable && handleStepClick(step.number)}
              aria-current={isActive ? "step" : undefined}
              disabled={!isClickable}
            >
              <span
                className={`flex h-8 w-8 sm:h-11 sm:w-11 md:h-12 md:w-12 items-center justify-center rounded-full text-xs sm:text-base font-bold shrink-0 transition-transform ${
                  isActive ? "scale-105 ring-2 ring-emerald-500 ring-offset-2" : ""
                } ${circleClasses}`}
              >
                {isComplete ? (
                  <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5" />
                ) : (
                  step.number
                )}
              </span>
              <span
                className={`text-[10px] sm:text-xs text-center transition-colors duration-200 line-clamp-2 leading-tight px-0.5 ${
                  isActive
                    ? "text-emerald-700 font-bold"
                    : isComplete
                    ? "text-emerald-600 font-medium"
                    : "text-gray-400"
                }`}
              >
                <span className="sm:hidden">{step.shortTitle}</span>
                <span className="hidden sm:inline">{step.title}</span>
              </span>
            </button>
          )
        })}
      </div>
      <div className="relative mt-2.5 sm:mt-4 h-1 sm:h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
        <div
          className="absolute left-0 top-0 h-full bg-emerald-600 rounded-full transition-all duration-300 ease-out"
          style={{
            width: `${((Math.min(currentStep, steps.length) - 1) / (steps.length - 1)) * 100}%`,
          }}
        />
      </div>
    </div>
  )
}
