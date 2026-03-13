"use client"

import { CheckCircle2 } from "lucide-react"

interface StepIndicatorProps {
  currentStep: number
}

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  const steps = [
    { number: 1, title: "Verification" },
    { number: 2, title: "Personal Information" },
    { number: 3, title: "Employment Information" },
    { number: 4, title: "Document Upload" },
    { number: 5, title: "Review & Submit" },
  ]

  return (
    <div className="w-full py-4">
      <div className="flex justify-between items-center">
        {steps.map((step) => {
          const isActive = currentStep === step.number
          const isComplete = currentStep > step.number
          const stepClasses = isActive || isComplete
            ? "border-green-700 bg-green-700 text-white shadow-md"
            : "border-gray-300 bg-white text-gray-400"

          return (
            <div key={step.number} className="flex flex-col items-center relative">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-200 ${stepClasses}`}>
                {isComplete ? (
                  <CheckCircle2 className="h-5 w-5 text-white" />
                ) : (
                  <span className={`font-semibold ${isActive ? "text-white" : "text-gray-400"}`}>
                    {step.number}
                  </span>
                )}
              </div>
              <span
                className={`text-xs mt-2 text-center hidden sm:block transition-colors duration-200 ${
                  isActive || isComplete
                    ? "text-green-700 font-medium"
                    : "text-gray-500"
                }`}
              >
                {step.title}
              </span>
            </div>
          )
        })}
      </div>
      <div className="relative flex justify-between items-center mt-5">
        {steps.map((step, index) => {
          if (index === steps.length - 1) return null

          return (
            <div
              key={`line-${step.number}`}
              className={`absolute h-0.5 transition-colors duration-300 ${currentStep > index + 1 ? "bg-green-700" : "bg-gray-300"}`}
              style={{
                left: `${(index / (steps.length - 1)) * 100}%`,
                right: `${100 - ((index + 1) / (steps.length - 1)) * 100}%`,
              }}
            />
          )
        })}
      </div>
    </div>
  )
}
