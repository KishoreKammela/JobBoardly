'use client';
import React from 'react';
import type { ExperienceEntry } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Briefcase, PlusCircle, Trash2, CalendarDays } from 'lucide-react';
import { format, parse, isValid } from 'date-fns';
import { formatCurrencyINR } from '@/lib/utils';

interface JobSeekerExperienceSectionProps {
  experiences: ExperienceEntry[];
  onFieldChange: (
    index: number,
    field: keyof ExperienceEntry,
    value: string | boolean | number | undefined | HTMLInputElement | Date,
    inputType?: string
  ) => void;
  onAddItem: () => void;
  onRemoveItem: (id: string) => void;
  isDisabled: boolean;
  onDateChange: (
    index: number,
    fieldName: 'startDate' | 'endDate',
    date: Date | undefined
  ) => void;
}

export function JobSeekerExperienceSection({
  experiences,
  onFieldChange,
  onAddItem,
  onRemoveItem,
  isDisabled,
  onDateChange,
}: JobSeekerExperienceSectionProps) {
  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-headline flex items-center gap-2">
          <Briefcase /> Work Experience
        </CardTitle>
        <CardDescription>Detail your professional background.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {experiences.map((exp, index) => {
            const expStartDateObj =
              exp.startDate &&
              isValid(parse(exp.startDate, 'yyyy-MM-dd', new Date()))
                ? parse(exp.startDate, 'yyyy-MM-dd', new Date())
                : undefined;
            const expEndDateObj =
              exp.endDate &&
              isValid(parse(exp.endDate, 'yyyy-MM-dd', new Date()))
                ? parse(exp.endDate, 'yyyy-MM-dd', new Date())
                : undefined;
            return (
              <Card key={exp.id} className="p-4 bg-muted/30">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                  <div>
                    <Label htmlFor={`exp-role-${exp.id}`}>Job Role</Label>
                    <Input
                      id={`exp-role-${exp.id}`}
                      value={exp.jobRole || ''}
                      onChange={(e) =>
                        onFieldChange(index, 'jobRole', e.target.value)
                      }
                      placeholder="e.g., Software Engineer"
                      disabled={isDisabled}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`exp-company-${exp.id}`}>
                      Company Name
                    </Label>
                    <Input
                      id={`exp-company-${exp.id}`}
                      value={exp.companyName || ''}
                      onChange={(e) =>
                        onFieldChange(index, 'companyName', e.target.value)
                      }
                      placeholder="e.g., Tech Solutions Inc."
                      disabled={isDisabled}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                  <div>
                    <Label htmlFor={`exp-start-${exp.id}`}>Start Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          disabled={isDisabled}
                          className={`w-full justify-start text-left font-normal ${!exp.startDate && 'text-muted-foreground'}`}
                        >
                          <CalendarDays className="mr-2 h-4 w-4" />
                          {expStartDateObj ? (
                            format(expStartDateObj, 'PPP')
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={expStartDateObj}
                          onSelect={(date) =>
                            onDateChange(index, 'startDate', date)
                          }
                          captionLayout="dropdown"
                          fromYear={1980}
                          toYear={new Date().getFullYear()}
                          defaultMonth={expStartDateObj}
                          initialFocus
                          disabled={isDisabled}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div>
                    <Label htmlFor={`exp-end-${exp.id}`}>End Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          disabled={exp.currentlyWorking || isDisabled}
                          className={`w-full justify-start text-left font-normal ${!exp.endDate && !exp.currentlyWorking && 'text-muted-foreground'}`}
                        >
                          <CalendarDays className="mr-2 h-4 w-4" />
                          {exp.currentlyWorking ? (
                            'Present'
                          ) : expEndDateObj ? (
                            format(expEndDateObj, 'PPP')
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={expEndDateObj}
                          disabled={exp.currentlyWorking || isDisabled}
                          onSelect={(date) =>
                            onDateChange(index, 'endDate', date)
                          }
                          captionLayout="dropdown"
                          fromYear={1980}
                          toYear={new Date().getFullYear() + 10}
                          defaultMonth={expEndDateObj}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                <div className="mb-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`exp-current-${exp.id}`}
                      checked={exp.currentlyWorking || false}
                      onCheckedChange={(checked) =>
                        onFieldChange(
                          index,
                          'currentlyWorking',
                          Boolean(checked),
                          'checkbox'
                        )
                      }
                      disabled={isDisabled}
                    />
                    <Label htmlFor={`exp-current-${exp.id}`}>
                      I currently work here
                    </Label>
                  </div>
                </div>
                <div className="mb-3">
                  <Label htmlFor={`exp-ctc-${exp.id}`}>
                    Annual CTC (INR, Optional)
                  </Label>
                  <Input
                    id={`exp-ctc-${exp.id}`}
                    type="number"
                    value={exp.annualCTC === undefined ? '' : exp.annualCTC}
                    onChange={(e) =>
                      onFieldChange(
                        index,
                        'annualCTC',
                        e.target.value,
                        'number'
                      )
                    }
                    placeholder="e.g., 1200000"
                    disabled={isDisabled}
                  />
                  {exp.annualCTC !== undefined && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Formatted: {formatCurrencyINR(exp.annualCTC)}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor={`exp-desc-${exp.id}`}>
                    Description / Responsibilities
                  </Label>
                  <Textarea
                    id={`exp-desc-${exp.id}`}
                    value={exp.description || ''}
                    onChange={(e) =>
                      onFieldChange(index, 'description', e.target.value)
                    }
                    rows={3}
                    placeholder="Describe your role and achievements..."
                    disabled={isDisabled}
                  />
                </div>
                {experiences.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveItem(exp.id)}
                    className="mt-3 text-destructive hover:text-destructive flex items-center gap-1"
                    disabled={isDisabled}
                  >
                    <Trash2 className="h-4 w-4" /> Remove Experience
                  </Button>
                )}
              </Card>
            );
          })}
          <Button
            type="button"
            variant="outline"
            onClick={onAddItem}
            className="flex items-center gap-1"
            disabled={isDisabled}
          >
            <PlusCircle className="h-4 w-4" /> Add Another Experience
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
