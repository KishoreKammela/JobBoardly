'use client';
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea'; // Check if needed for text type, input might be enough
import type { ScreeningQuestion, ApplicationAnswer } from '@/types';
import { Loader2 } from 'lucide-react';

interface ScreeningQuestionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  questions: ScreeningQuestion[];
  onSubmit: (answers: ApplicationAnswer[]) => Promise<void>;
  jobTitle: string;
}

export function ScreeningQuestionsModal({
  isOpen,
  onClose,
  questions,
  onSubmit,
  jobTitle,
}: ScreeningQuestionsModalProps) {
  const [answers, setAnswers] = useState<
    Record<string, string | boolean | string[]>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Initialize answers state when questions change or modal opens
    if (isOpen) {
      const initialAnswers: Record<string, string | boolean | string[]> = {};
      questions.forEach((q) => {
        if (q.type === 'yesNo') {
          initialAnswers[q.id] = ''; // Unanswered
        } else if (q.type === 'checkboxGroup' || q.type === 'multipleChoice') {
          initialAnswers[q.id] = [];
        } else {
          initialAnswers[q.id] = '';
        }
      });
      setAnswers(initialAnswers);
      setErrors({});
    }
  }, [isOpen, questions]);

  const handleAnswerChange = (
    questionId: string,
    value: string | boolean | string[]
  ) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    if (errors[questionId]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[questionId];
        return newErrors;
      });
    }
  };

  const validateAnswers = (): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;
    questions.forEach((q) => {
      if (q.isRequired) {
        const answer = answers[q.id];
        if (
          q.type === 'text' &&
          (typeof answer !== 'string' || !answer.trim())
        ) {
          newErrors[q.id] = 'This field is required.';
          isValid = false;
        } else if (
          q.type === 'yesNo' &&
          typeof answer !== 'boolean' &&
          answer === ''
        ) {
          // Check for initial empty string too
          newErrors[q.id] = 'Please select Yes or No.';
          isValid = false;
        }
        // TODO: Add validation for multipleChoice and checkboxGroup when implemented
      }
    });
    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateAnswers()) {
      return;
    }
    setIsSubmitting(true);
    const formattedAnswers: ApplicationAnswer[] = questions.map((q) => ({
      questionId: q.id,
      questionText: q.questionText,
      answer:
        answers[q.id] ??
        (q.type === 'yesNo'
          ? false
          : q.type === 'checkboxGroup' || q.type === 'multipleChoice'
            ? []
            : ''), // Ensure a default if somehow missing
    }));
    await onSubmit(formattedAnswers);
    setIsSubmitting(false);
    // onClose will be called by the parent component after successful submission in handleApply
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Screening Questions for {jobTitle}</DialogTitle>
          <DialogDescription>
            Please answer the following questions to complete your application.
            Required questions are marked with an asterisk (*).
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4 overflow-y-auto flex-grow pr-2">
          {questions.map((question) => (
            <div key={question.id} className="space-y-2">
              <Label htmlFor={question.id} className="text-md">
                {question.questionText}
                {question.isRequired && (
                  <span className="text-destructive ml-1">*</span>
                )}
              </Label>
              {question.type === 'text' && (
                <Textarea
                  id={question.id}
                  value={(answers[question.id] as string) || ''}
                  onChange={(e) =>
                    handleAnswerChange(question.id, e.target.value)
                  }
                  placeholder="Your answer..."
                  rows={3}
                />
              )}
              {question.type === 'yesNo' && (
                <RadioGroup
                  onValueChange={(value) =>
                    handleAnswerChange(question.id, value === 'true')
                  }
                  value={
                    answers[question.id] === ''
                      ? ''
                      : String(answers[question.id])
                  }
                  className="flex space-x-4 pt-1"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="true" id={`${question.id}-yes`} />
                    <Label htmlFor={`${question.id}-yes`}>Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="false" id={`${question.id}-no`} />
                    <Label htmlFor={`${question.id}-no`}>No</Label>
                  </div>
                </RadioGroup>
              )}
              {/* TODO: Implement UI for multipleChoice and checkboxGroup types */}
              {(question.type === 'multipleChoice' ||
                question.type === 'checkboxGroup') && (
                <div className="text-sm text-muted-foreground p-2 border rounded-md">
                  <p>
                    UI for &quot;{question.type}&quot; questions is not yet
                    implemented.
                  </p>
                  <p>Options: {(question.options || []).join(', ')}</p>
                </div>
              )}
              {errors[question.id] && (
                <p className="text-sm text-destructive">
                  {errors[question.id]}
                </p>
              )}
            </div>
          ))}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline" disabled={isSubmitting}>
              Cancel
            </Button>
          </DialogClose>
          <Button type="button" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit Answers & Apply
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
