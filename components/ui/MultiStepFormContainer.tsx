"use client";

import React, { ReactElement, FormEvent } from "react";
import useMultiStepForm from "@/hooks/useMultiStepForm";

interface MultiStepFormContainerProps {
  steps: ReactElement[];
  onSubmit: () => void;
  stepLabels?: string[];
  isSubmitting?: boolean;
}

export default function MultiStepFormContainer({
  steps,
  onSubmit,
  isSubmitting = false,
  stepLabels,
}: MultiStepFormContainerProps) {
  const { currentStepIndex, step, isFirstStep, isLastStep, next, back } =
    useMultiStepForm(steps);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (isLastStep) {
      onSubmit();
    } else {
      next();
    }
  }

  return (
    // steps ui
    <form onSubmit={handleSubmit} className="space-y-4">
      {stepLabels && (
        <ul className="steps w-full steps-horizontal mb-6">
          {stepLabels.map((label, index) => (
            <li
              key={index}
              className={`step ${
                index === currentStepIndex || index < currentStepIndex
                  ? "step-primary"
                  : ""
              }`}
            >
              {label}
            </li>
          ))}
        </ul>
      )}

      <div>{step}</div>

      <div className="flex justify-between mt-4">
        <button
          type="button"
          onClick={back}
          disabled={isFirstStep}
          className="btn btn-secondary"
        >
          Back
        </button>

        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting ? "Processing..." : isLastStep ? "Create User" : "Next"}
        </button>
      </div>
    </form>
  );
}
