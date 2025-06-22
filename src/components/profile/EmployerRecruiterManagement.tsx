// src/components/profile/EmployerRecruiterManagement.tsx
'use client';
import React, { useState } from 'react';
import type { Company, UserProfile } from '@/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import {
  UserPlus,
  Mail,
  Users,
  Shield,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { inviteRecruiterToCompany } from '@/services/company.services';
import { useCompany } from '@/contexts/Company/CompanyContext';

interface EmployerRecruiterManagementProps {
  company: Company | null;
  isDisabled: boolean;
}

const MAX_RECRUITERS = 3;

export function EmployerRecruiterManagement({
  company,
  isDisabled,
}: EmployerRecruiterManagementProps) {
  const { toast } = useToast();
  const { recruiters, loading: companyLoading } = useCompany();
  const [newRecruiterName, setNewRecruiterName] = useState('');
  const [newRecruiterEmail, setNewRecruiterEmail] = useState('');
  const [isInviting, setIsInviting] = useState(false);

  if (!company) {
    return null;
  }

  const handleInviteRecruiter = async () => {
    if (isInviting || isDisabled) return;

    if (!newRecruiterName.trim() || !newRecruiterEmail.trim()) {
      toast({
        title: 'Missing Information',
        description:
          'Please provide both a name and an email to send an invite.',
        variant: 'destructive',
      });
      return;
    }

    if ((company.recruiterUids?.length || 0) >= MAX_RECRUITERS) {
      toast({
        title: 'Recruiter Limit Reached',
        description: `You can have a maximum of ${MAX_RECRUITERS} recruiters.`,
        variant: 'destructive',
      });
      return;
    }

    if (
      (company.invitations || []).some(
        (inv) => inv.email === newRecruiterEmail && inv.status === 'pending'
      )
    ) {
      toast({
        title: 'Already Invited',
        description:
          'An invitation has already been sent to this email address.',
        variant: 'destructive',
      });
      return;
    }

    setIsInviting(true);
    try {
      await inviteRecruiterToCompany(
        company.id,
        newRecruiterName,
        newRecruiterEmail
      );
      toast({
        title: 'Invitation Sent!',
        description: `${newRecruiterName} has been invited to join your company. They will need to register with the email ${newRecruiterEmail}.`,
      });
      setNewRecruiterName('');
      setNewRecruiterEmail('');
    } catch (error) {
      console.error('Error inviting recruiter:', error);
      toast({
        title: 'Invitation Failed',
        description: 'Could not send the invitation. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsInviting(false);
    }
  };

  const getAvatarFallback = (name: string) => name?.[0]?.toUpperCase() || 'R';

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-headline flex items-center gap-2">
          <Users /> Manage Recruiters
        </CardTitle>
        <CardDescription>
          Invite and manage recruiters for your company. You can have up to{' '}
          {MAX_RECRUITERS} recruiters in total.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <section>
            <h3 className="text-lg font-semibold mb-3">Current Recruiters</h3>
            {companyLoading ? (
              <Loader2 className="animate-spin" />
            ) : recruiters.length > 0 ? (
              <div className="space-y-3">
                {recruiters.map((recruiter: UserProfile) => (
                  <div
                    key={recruiter.uid}
                    className="flex items-center gap-3 p-2 border rounded-md bg-muted/20"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={
                          recruiter.avatarUrl ||
                          `https://placehold.co/40x40.png`
                        }
                        alt={recruiter.name || 'Recruiter'}
                        data-ai-hint="recruiter avatar"
                      />
                      <AvatarFallback>
                        {getAvatarFallback(recruiter.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium flex items-center gap-1.5">
                        {recruiter.name || 'N/A'}
                        {company.adminUids.includes(recruiter.uid) && (
                          <Shield
                            className="h-4 w-4 text-primary"
                            title="Company Admin"
                          />
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {recruiter.email}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No recruiters found.
              </p>
            )}
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-3">Pending Invitations</h3>
            {(company.invitations || []).filter((i) => i.status === 'pending')
              .length > 0 ? (
              <div className="space-y-2">
                {(company.invitations || [])
                  .filter((i) => i.status === 'pending')
                  .map((inv) => (
                    <div
                      key={inv.email}
                      className="flex items-center gap-3 p-2 border border-dashed rounded-md bg-muted/30"
                    >
                      <Mail className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{inv.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {inv.email}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No pending invitations.
              </p>
            )}
          </section>

          {(company.recruiterUids?.length || 0) < MAX_RECRUITERS ? (
            <section>
              <h3 className="text-lg font-semibold mb-3">
                Invite New Recruiter
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="newRecruiterName">
                      Recruiter&apos;s Full Name
                    </Label>
                    <Input
                      id="newRecruiterName"
                      value={newRecruiterName}
                      onChange={(e) => setNewRecruiterName(e.target.value)}
                      placeholder="e.g., Jane Doe"
                      disabled={isInviting || isDisabled}
                    />
                  </div>
                  <div>
                    <Label htmlFor="newRecruiterEmail">
                      Recruiter&apos;s Email
                    </Label>
                    <Input
                      id="newRecruiterEmail"
                      type="email"
                      value={newRecruiterEmail}
                      onChange={(e) => setNewRecruiterEmail(e.target.value)}
                      placeholder="e.g., jane.doe@yourcompany.com"
                      disabled={isInviting || isDisabled}
                    />
                  </div>
                </div>
                <Button
                  type="button"
                  onClick={handleInviteRecruiter}
                  disabled={isInviting || isDisabled}
                >
                  {isInviting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <UserPlus className="mr-2 h-4 w-4" />
                  )}
                  Send Invitation
                </Button>
                <p className="text-xs text-muted-foreground">
                  The new recruiter will need to sign up using this exact email
                  address to join your company.
                </p>
              </div>
            </section>
          ) : (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Recruiter Limit Reached</AlertTitle>
              <AlertDescription>
                You have reached the maximum of {MAX_RECRUITERS} recruiters for
                your company.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
