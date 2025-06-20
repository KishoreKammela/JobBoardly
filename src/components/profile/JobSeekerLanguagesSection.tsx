'use client';
import React from 'react';
import type { LanguageEntry } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Languages as LanguagesIcon, PlusCircle, Trash2 } from 'lucide-react';

interface JobSeekerLanguagesSectionProps {
  languages: LanguageEntry[];
  onFieldChange: (
    index: number,
    field: keyof LanguageEntry,
    value: string | boolean | undefined | HTMLInputElement,
    inputType?: string
  ) => void;
  onAddItem: () => void;
  onRemoveItem: (id: string) => void;
  isDisabled: boolean;
}

export function JobSeekerLanguagesSection({
  languages,
  onFieldChange,
  onAddItem,
  onRemoveItem,
  isDisabled,
}: JobSeekerLanguagesSectionProps) {
  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-headline flex items-center gap-2">
          <LanguagesIcon /> Languages
        </CardTitle>
        <CardDescription>
          Languages you know and your proficiency.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {languages.map((lang, index) => (
            <Card key={lang.id} className="p-4 bg-muted/30">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                <div>
                  <Label htmlFor={`lang-name-${lang.id}`}>Language Name</Label>
                  <Input
                    id={`lang-name-${lang.id}`}
                    value={lang.languageName || ''}
                    onChange={(e) =>
                      onFieldChange(index, 'languageName', e.target.value)
                    }
                    placeholder="e.g., English, Hindi"
                    disabled={isDisabled}
                  />
                </div>
                <div>
                  <Label htmlFor={`lang-proficiency-${lang.id}`}>
                    Proficiency
                  </Label>
                  <Select
                    value={lang.proficiency || 'Beginner'}
                    onValueChange={(value) =>
                      onFieldChange(index, 'proficiency', value)
                    }
                    disabled={isDisabled}
                  >
                    <SelectTrigger
                      id={`lang-proficiency-${lang.id}`}
                      disabled={isDisabled}
                    >
                      <SelectValue placeholder="Select proficiency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Beginner">Beginner</SelectItem>
                      <SelectItem value="Intermediate">Intermediate</SelectItem>
                      <SelectItem value="Advanced">Advanced</SelectItem>
                      <SelectItem value="Native">Native</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center space-x-4 mb-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`lang-read-${lang.id}`}
                    checked={Boolean(lang.canRead)}
                    onCheckedChange={(checked) =>
                      onFieldChange(
                        index,
                        'canRead',
                        Boolean(checked),
                        'checkbox'
                      )
                    }
                    disabled={isDisabled}
                  />
                  <Label htmlFor={`lang-read-${lang.id}`}>Read</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`lang-write-${lang.id}`}
                    checked={Boolean(lang.canWrite)}
                    onCheckedChange={(checked) =>
                      onFieldChange(
                        index,
                        'canWrite',
                        Boolean(checked),
                        'checkbox'
                      )
                    }
                    disabled={isDisabled}
                  />
                  <Label htmlFor={`lang-write-${lang.id}`}>Write</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`lang-speak-${lang.id}`}
                    checked={Boolean(lang.canSpeak)}
                    onCheckedChange={(checked) =>
                      onFieldChange(
                        index,
                        'canSpeak',
                        Boolean(checked),
                        'checkbox'
                      )
                    }
                    disabled={isDisabled}
                  />
                  <Label htmlFor={`lang-speak-${lang.id}`}>Speak</Label>
                </div>
              </div>
              {languages.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveItem(lang.id)}
                  className="mt-2 text-destructive hover:text-destructive flex items-center gap-1 text-xs"
                  disabled={isDisabled}
                >
                  <Trash2 className="h-3 w-3" /> Remove Language
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
            <PlusCircle className="h-4 w-4" /> Add Another Language
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
