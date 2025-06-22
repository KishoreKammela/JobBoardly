import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Briefcase,
  Building,
  CheckCircle2,
  XCircle,
  Users,
  FileText,
  ClipboardList,
  BarChart3,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';
import type { Job, Company } from '@/types';

interface PlatformStats {
  totalJobSeekers: number;
  totalCompanies: number;
  totalJobs: number;
  approvedJobs: number;
  totalApplications: number;
}

interface AdminDashboardOverviewProps {
  platformStats: PlatformStats | null;
  isStatsLoading: boolean;
  pendingJobs: Job[];
  isPendingJobsLoading: boolean;
  pendingCompanies: Company[];
  isPendingCompaniesLoading: boolean;
  canModerateContent: boolean;
  specificActionLoading: string | null;
  handleJobStatusUpdate: (
    jobId: string,
    newStatus: 'approved' | 'rejected' | 'suspended',
    reason?: string
  ) => Promise<void>;
  handleCompanyStatusUpdate: (
    companyId: string,
    newStatus: 'approved' | 'rejected' | 'suspended' | 'active' | 'deleted',
    reason?: string
  ) => Promise<void>;
  showConfirmationModal: (
    title: string,
    description: React.ReactNode,
    action: () => Promise<void>,
    confirmText?: string,
    confirmVariant?: 'default' | 'destructive'
  ) => void;
  showQuickModeration: boolean;
  canViewAnalytics: boolean;
}

const AdminDashboardOverview: React.FC<AdminDashboardOverviewProps> = ({
  platformStats,
  isStatsLoading,
  pendingJobs,
  isPendingJobsLoading,
  pendingCompanies,
  isPendingCompaniesLoading,
  canModerateContent,
  specificActionLoading,
  handleJobStatusUpdate,
  handleCompanyStatusUpdate,
  showConfirmationModal,
  showQuickModeration,
  canViewAnalytics,
}) => {
  return (
    <>
      {canViewAnalytics && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 /> Platform Analytics
            </CardTitle>
            <CardDescription>
              Key metrics for JobBoardly at a glance.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isStatsLoading ? (
              <div className="flex items-center py-6">
                <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
                Loading platform statistics...
              </div>
            ) : platformStats ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 text-center">
                <div className="p-4 border rounded-lg shadow-sm bg-muted/30">
                  <Users className="h-8 w-8 mx-auto text-primary mb-2" />
                  <p className="text-2xl font-bold">
                    {platformStats.totalJobSeekers}
                  </p>
                  <p className="text-xs text-muted-foreground">Job Seekers</p>
                </div>
                <div className="p-4 border rounded-lg shadow-sm bg-muted/30">
                  <Building className="h-8 w-8 mx-auto text-primary mb-2" />
                  <p className="text-2xl font-bold">
                    {platformStats.totalCompanies}
                  </p>
                  <p className="text-xs text-muted-foreground">Companies</p>
                </div>
                <div className="p-4 border rounded-lg shadow-sm bg-muted/30">
                  <FileText className="h-8 w-8 mx-auto text-primary mb-2" />
                  <p className="text-2xl font-bold">
                    {platformStats.totalJobs}
                  </p>
                  <p className="text-xs text-muted-foreground">Total Jobs</p>
                </div>
                <div className="p-4 border rounded-lg shadow-sm bg-muted/30">
                  <CheckCircle2 className="h-8 w-8 mx-auto text-green-600 mb-2" />
                  <p className="text-2xl font-bold">
                    {platformStats.approvedJobs}
                  </p>
                  <p className="text-xs text-muted-foreground">Approved Jobs</p>
                </div>
                <div className="p-4 border rounded-lg shadow-sm bg-muted/30">
                  <ClipboardList className="h-8 w-8 mx-auto text-primary mb-2" />
                  <p className="text-2xl font-bold">
                    {platformStats.totalApplications}
                  </p>
                  <p className="text-xs text-muted-foreground">Applications</p>
                </div>
              </div>
            ) : (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Statistics Unavailable</AlertTitle>
                <AlertDescription>
                  Could not load platform statistics at this time.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
      {showQuickModeration && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase /> Pending Job Approvals ({pendingJobs.length})
              </CardTitle>
              <CardDescription>
                Review and approve or reject newly posted jobs.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isPendingJobsLoading ? (
                <div className="flex items-center py-6">
                  <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />{' '}
                  Loading...
                </div>
              ) : pendingJobs.length === 0 ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>No Pending Jobs</AlertTitle>
                  <AlertDescription>
                    No job postings awaiting approval.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                  {pendingJobs.map((job) => (
                    <div
                      key={job.id}
                      className="flex items-center justify-between p-3 border rounded-md hover:bg-muted/50 transition-colors"
                    >
                      <div>
                        <Link
                          href={`/jobs/${job.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold hover:underline"
                          title={job.title}
                        >
                          {job.title}
                        </Link>
                        <p className="text-xs text-muted-foreground">
                          {job.company} - Posted:{' '}
                          {new Date(
                            job.createdAt as string
                          ).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            showConfirmationModal(
                              `Reject Job "${job.title}"?`,
                              'Are you sure you want to reject this job posting? It will not be visible to job seekers.',
                              async () =>
                                handleJobStatusUpdate(job.id, 'rejected'),
                              'Reject Job',
                              'destructive'
                            )
                          }
                          disabled={
                            specificActionLoading === `job-${job.id}` ||
                            !canModerateContent
                          }
                          aria-label={`Reject job ${job.title}`}
                          className="text-destructive"
                        >
                          <XCircle className="h-5 w-5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            showConfirmationModal(
                              `Approve Job "${job.title}"?`,
                              'Are you sure you want to approve this job posting? It will become publicly visible.',
                              async () =>
                                handleJobStatusUpdate(job.id, 'approved'),
                              'Approve Job'
                            )
                          }
                          disabled={
                            specificActionLoading === `job-${job.id}` ||
                            !canModerateContent
                          }
                          aria-label={`Approve job ${job.title}`}
                          className="text-green-600"
                        >
                          <CheckCircle2 className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building /> Pending Company Approvals (
                {pendingCompanies.length})
              </CardTitle>
              <CardDescription>
                Review and approve or reject new company profiles.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isPendingCompaniesLoading ? (
                <div className="flex items-center py-6">
                  <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />{' '}
                  Loading...
                </div>
              ) : pendingCompanies.length === 0 ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>No Pending Companies</AlertTitle>
                  <AlertDescription>
                    No new company profiles awaiting approval.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                  {pendingCompanies.map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center justify-between p-3 border rounded-md hover:bg-muted/50 transition-colors"
                    >
                      <div>
                        <Link
                          href={`/companies/${c.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold hover:underline"
                          title={c.name}
                        >
                          {c.name}
                        </Link>
                        <p className="text-xs text-muted-foreground">
                          Registered:{' '}
                          {new Date(c.createdAt as string).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            showConfirmationModal(
                              `Reject Company "${c.name}"?`,
                              'Are you sure you want to reject this company profile? It will not be publicly visible.',
                              async () =>
                                handleCompanyStatusUpdate(c.id, 'rejected'),
                              'Reject Company',
                              'destructive'
                            )
                          }
                          disabled={
                            specificActionLoading === `company-${c.id}` ||
                            !canModerateContent
                          }
                          aria-label={`Reject company ${c.name}`}
                          className="text-destructive"
                        >
                          <XCircle className="h-5 w-5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            showConfirmationModal(
                              `Approve Company "${c.name}"?`,
                              'Are you sure you want to approve this company profile? It will become publicly visible and operational.',
                              async () =>
                                handleCompanyStatusUpdate(c.id, 'approved'),
                              'Approve Company'
                            )
                          }
                          disabled={
                            specificActionLoading === `company-${c.id}` ||
                            !canModerateContent
                          }
                          aria-label={`Approve company ${c.name}`}
                          className="text-green-600"
                        >
                          <CheckCircle2 className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};

export default AdminDashboardOverview;
