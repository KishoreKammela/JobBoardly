'use client';
import React from 'react';
import type { EducationEntry } from '@/types';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { GraduationCap, PlusCircle, Trash2 } from 'lucide-react';

interface JobSeekerEducationSectionProps {
  educations: EducationEntry[];
  onFieldChange: (
    index: number,
    field: keyof EducationEntry,
    value: string | boolean | number | undefined,
    inputType?: string
  ) => void;
  onAddItem: () => void;
  onRemoveItem: (id: string) => void;
  isDisabled: boolean;
}

export function JobSeekerEducationSection({
  educations,
  onFieldChange,
  onAddItem,
  onRemoveItem,
  isDisabled,
}: JobSeekerEducationSectionProps) {
  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-headline flex items-center gap-2">
          <GraduationCap /> Education
        </CardTitle>
        <CardDescription>Your educational qualifications.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {educations.map((edu, index) => (
            <Card key={edu.id} className="p-4 bg-muted/30">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                <div>
                  <Label htmlFor={`edu-level-${edu.id}`}>Level</Label>
                  <Select
                    value={edu.level || 'Graduate'}
                    onValueChange={(value) =>
                      onFieldChange(index, 'level', value)
                    }
                    disabled={isDisabled}
                  >
                    <SelectTrigger
                      id={`edu-level-${edu.id}`}
                      disabled={isDisabled}
                    >
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Post Graduate">
                        Post Graduate
                      </SelectItem>
                      <SelectItem value="Graduate">Graduate</SelectItem>
                      <SelectItem value="Schooling (XII)">
                        Schooling (XII)
                      </SelectItem>
                      <SelectItem value="Schooling (X)">
                        Schooling (X)
                      </SelectItem>
                      <SelectItem value="Certification / Other">
                        Certification / Other
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor={`edu-degree-${edu.id}`}>
                    Degree/Certificate Name
                  </Label>
                  <Input
                    id={`edu-degree-${edu.id}`}
                    value={edu.degreeName || ''}
                    onChange={(e) =>
                      onFieldChange(index, 'degreeName', e.target.value)
                    }
                    placeholder="e.g., B.Tech, MBA"
                    disabled={isDisabled}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                <div>
                  <Label htmlFor={`edu-specialization-${edu.id}`}>
                    Specialization/Major
                  </Label>
                  <Input
                    id={`edu-specialization-${edu.id}`}
                    value={edu.specialization || ''}
                    onChange={(e) =>
                      onFieldChange(index, 'specialization', e.target.value)
                    }
                    placeholder="e.g., Computer Science, Marketing"
                    disabled={isDisabled}
                  />
                </div>
                <div>
                  <Label htmlFor={`edu-institute-${edu.id}`}>
                    Institute Name
                  </Label>
                  <Input
                    id={`edu-institute-${edu.id}`}
                    value={edu.instituteName || ''}
                    onChange={(e) =>
                      onFieldChange(index, 'instituteName', e.target.value)
                    }
                    placeholder="e.g., University of Technology"
                    disabled={isDisabled}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3 items-end">
                <div>
                  <Label htmlFor={`edu-courseType-${edu.id}`}>
                    Course Type
                  </Label>
                  <Select
                    value={edu.courseType || 'Full Time'}
                    onValueChange={(value) =>
                      onFieldChange(index, 'courseType', value)
                    }
                    disabled={isDisabled}
                  >
                    <SelectTrigger
                      id={`edu-courseType-${edu.id}`}
                      disabled={isDisabled}
                    >
                      <SelectValue placeholder="Select course type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Full Time">Full Time</SelectItem>
                      <SelectItem value="Part Time">Part Time</SelectItem>
                      <SelectItem value="Distance Learning">
                        Distance Learning
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor={`edu-startYear-${edu.id}`}>Start Year</Label>
                  <Input
                    id={`edu-startYear-${edu.id}`}
                    type="number"
                    placeholder="YYYY"
                    value={edu.startYear === undefined ? '' : edu.startYear}
                    onChange={(e) =>
                      onFieldChange(
                        index,
                        'startYear',
                        e.target.value,
                        'number'
                      )
                    }
                    disabled={isDisabled}
                  />
                </div>
                <div>
                  <Label htmlFor={`edu-endYear-${edu.id}`}>End Year</Label>
                  <Input
                    id={`edu-endYear-${edu.id}`}
                    type="number"
                    placeholder="YYYY"
                    value={edu.endYear === undefined ? '' : edu.endYear}
                    onChange={(e) =>
                      onFieldChange(index, 'endYear', e.target.value, 'number')
                    }
                    disabled={isDisabled}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2 mb-3">
                <Checkbox
                  id={`edu-relevant-${edu.id}`}
                  checked={Boolean(edu.isMostRelevant)}
                  onCheckedChange={(checked) =>
                    onFieldChange(
                      index,
                      'isMostRelevant',
                      Boolean(checked),
                      'checkbox'
                    )
                  }
                  disabled={isDisabled}
                />
                <Label htmlFor={`edu-relevant-${edu.id}`}>
                  This is my most relevant/important educational qualification
                </Label>
              </div>
              <div>
                <Label htmlFor={`edu-desc-${edu.id}`}>
                  Description (Optional)
                </Label>
                <Textarea
                  id={`edu-desc-${edu.id}`}
                  value={edu.description || ''}
                  onChange={(e) =>
                    onFieldChange(index, 'description', e.target.value)
                  }
                  rows={2}
                  placeholder="Any additional details, achievements, or notes..."
                  disabled={isDisabled}
                />
              </div>
              {educations.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveItem(edu.id)}
                  className="mt-2 text-destructive hover:text-destructive flex items-center gap-1 text-xs"
                  disabled={isDisabled}
                >
                  <Trash2 className="h-3 w-3" /> Remove Education
                </Button>
              )}
            </Card>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={onAddItem}
            className="flex items-center gap-1"
            disabled={isDisabled}
          >
            <PlusCircle className="h-4 w-4" /> Add Another Education
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
