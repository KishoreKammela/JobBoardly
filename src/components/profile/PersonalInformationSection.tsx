'use client';
import React from 'react';
import type { UserProfile } from '@/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import {
  User,
  AtSign,
  Phone,
  Cake,
  Users as GenderIcon,
  Home,
  CalendarDays,
} from 'lucide-react';
import { format, parse, isValid } from 'date-fns';

interface PersonalInformationSectionProps {
  userFormData: Partial<UserProfile>;
  onUserChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  onDateChange: (date: Date | undefined) => void;
  onSelectChange: (name: keyof UserProfile, value: string) => void;
  isJobSeeker: boolean;
  isDisabled: boolean;
  isJobSeekerSuspended: boolean;
  email: string;
}

export function PersonalInformationSection({
  userFormData,
  onUserChange,
  onDateChange,
  onSelectChange,
  isJobSeeker,
  isDisabled,
  isJobSeekerSuspended,
  email,
}: PersonalInformationSectionProps) {
  const dobDate =
    userFormData.dateOfBirth &&
    isValid(parse(userFormData.dateOfBirth, 'yyyy-MM-dd', new Date()))
      ? parse(userFormData.dateOfBirth, 'yyyy-MM-dd', new Date())
      : undefined;

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-headline flex items-center gap-2">
          <User /> Personal Information
        </CardTitle>
        <CardDescription>Manage your personal details.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="userName">Full Name</Label>
              <Input
                id="userName"
                name="name"
                value={userFormData.name || ''}
                onChange={onUserChange}
                required
                placeholder="e.g., John Doe"
                disabled={isDisabled}
              />
            </div>
            <div>
              <Label htmlFor="userEmail" className="flex items-center gap-1">
                <AtSign className="h-4 w-4 text-muted-foreground" /> Email
                Address
              </Label>
              <Input
                id="userEmail"
                name="email"
                type="email"
                value={email}
                readOnly
                disabled
                className="bg-muted/50"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label
                htmlFor="userAvatarUrl"
                className="flex items-center gap-1"
              >
                <User className="h-4 w-4 text-muted-foreground" /> Avatar URL
              </Label>
              <Input
                id="userAvatarUrl"
                name="avatarUrl"
                placeholder="https://example.com/your-avatar.png"
                value={userFormData.avatarUrl || ''}
                onChange={onUserChange}
                data-ai-hint="avatar photo"
                disabled={isDisabled}
              />
            </div>
            {isJobSeeker && (
              <div>
                <Label
                  htmlFor="mobileNumber"
                  className="flex items-center gap-1"
                >
                  <Phone className="h-4 w-4 text-muted-foreground" /> Mobile
                  Number
                </Label>
                <Input
                  id="mobileNumber"
                  name="mobileNumber"
                  type="tel"
                  placeholder="e.g., +919876543210"
                  value={userFormData.mobileNumber || ''}
                  onChange={onUserChange}
                  disabled={isJobSeekerSuspended}
                />
              </div>
            )}
          </div>

          {isJobSeeker && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                <div>
                  <Label
                    htmlFor="dateOfBirth"
                    className="flex items-center gap-1"
                  >
                    <Cake className="h-4 w-4 text-muted-foreground" /> Date of
                    Birth
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        disabled={isJobSeekerSuspended}
                        className={`w-full justify-start text-left font-normal ${!userFormData.dateOfBirth && 'text-muted-foreground'}`}
                        aria-label="Pick date of birth"
                      >
                        <CalendarDays className="mr-2 h-4 w-4" />
                        {dobDate ? (
                          format(dobDate, 'PPP')
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={dobDate}
                        onSelect={onDateChange}
                        captionLayout="dropdown"
                        fromYear={1950}
                        toYear={new Date().getFullYear() - 10}
                        defaultMonth={dobDate}
                        initialFocus
                        disabled={isJobSeekerSuspended}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <Label htmlFor="gender" className="flex items-center gap-1">
                    <GenderIcon className="h-4 w-4 text-muted-foreground" />{' '}
                    Gender
                  </Label>
                  <Select
                    value={userFormData.gender || 'Prefer not to say'}
                    onValueChange={(value) => onSelectChange('gender', value)}
                    disabled={isJobSeekerSuspended}
                  >
                    <SelectTrigger
                      id="gender"
                      aria-label="Select gender"
                      disabled={isJobSeekerSuspended}
                    >
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                      <SelectItem value="Prefer not to say">
                        Prefer not to say
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="homeCity" className="flex items-center gap-1">
                    <Home className="h-4 w-4 text-muted-foreground" /> Home City
                  </Label>
                  <Input
                    id="homeCity"
                    name="homeCity"
                    value={userFormData.homeCity || ''}
                    onChange={onUserChange}
                    placeholder="e.g., Mumbai"
                    disabled={isJobSeekerSuspended}
                  />
                </div>
                <div>
                  <Label
                    htmlFor="homeState"
                    className="flex items-center gap-1"
                  >
                    <Home className="h-4 w-4 text-muted-foreground" /> Home
                    State
                  </Label>
                  <Input
                    id="homeState"
                    name="homeState"
                    value={userFormData.homeState || ''}
                    onChange={onUserChange}
                    placeholder="e.g., Maharashtra"
                    disabled={isJobSeekerSuspended}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
