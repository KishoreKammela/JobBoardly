
"use client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, ShieldCheck, Loader2, CheckCircle, XCircle, Users, Briefcase, Building, BarChart3, Flag, ListChecks } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, updateDoc, Timestamp, orderBy, serverTimestamp } from 'firebase/firestore';
import type { Job, UserProfile, Company } from '@/types';
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default function AdminPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [pendingJobs, setPendingJobs] = useState<Job[]>([]);
  const [pendingCompanies, setPendingCompanies] = useState<Company[]>([]);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);

  const [isJobsLoading, setIsJobsLoading] = useState(true);
  const [isCompaniesLoading, setIsCompaniesLoading] = useState(true);
  const [isUsersLoading, setIsUsersLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null); 

  const fetchPendingJobs = async () => {
    setIsJobsLoading(true);
    try {
      const jobsRef = collection(db, "jobs");
      const q = query(jobsRef, where("status", "==", "pending"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const jobs = snapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data(),
          postedDate: doc.data().postedDate instanceof Timestamp ? doc.data().postedDate.toDate().toISOString().split('T')[0] : doc.data().postedDate,
        }) as Job);
      setPendingJobs(jobs);
    } catch (error) {
      console.error("Error fetching pending jobs:", error);
    } finally {
      setIsJobsLoading(false);
    }
  };

  const fetchPendingCompanies = async () => {
    setIsCompaniesLoading(true);
    try {
      const companiesRef = collection(db, "companies");
      const q = query(companiesRef, where("status", "==", "pending"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const companies = snapshot.docs.map(d => ({ 
          id: d.id, 
          ...d.data(),
          createdAt: d.data().createdAt instanceof Timestamp ? d.data().createdAt.toDate().toISOString() : d.data().createdAt,
        }) as Company);
      setPendingCompanies(companies);
    } catch (error) {
      console.error("Error fetching pending companies:", error);
    } finally {
      setIsCompaniesLoading(false);
    }
  };

  const fetchAllUsers = async () => {
    setIsUsersLoading(true);
    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const usersList = snapshot.docs.map(doc => ({ 
          uid: doc.id, ...doc.data(),
          createdAt: doc.data().createdAt instanceof Timestamp ? doc.data().createdAt.toDate().toISOString() : doc.data().createdAt,
        } as UserProfile));
      setAllUsers(usersList);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setIsUsersLoading(false);
    }
  };


  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace(`/auth/login?redirect=${encodeURIComponent(pathname)}`);
    } else if (user.role !== 'admin') {
      if (user.role === 'jobSeeker') router.replace('/jobs');
      else if (user.role === 'employer') router.replace('/employer/posted-jobs');
      else router.replace('/');
    } else {
      fetchPendingJobs();
      fetchPendingCompanies();
      fetchAllUsers();
    }
  }, [user, loading, router, pathname]);

  const handleJobStatusUpdate = async (jobId: string, newStatus: 'approved' | 'rejected', reason?: string) => {
    setActionLoading(`job-${jobId}`);
    try {
      const jobRef = doc(db, "jobs", jobId);
      await updateDoc(jobRef, { 
        status: newStatus,
        moderationReason: newStatus === 'rejected' ? (reason || "Rejected by admin") : null,
        updatedAt: serverTimestamp()
      });
      setPendingJobs(prevJobs => prevJobs.filter(job => job.id !== jobId));
    } catch (error) {
      console.error(`Error updating job ${jobId} to ${newStatus}:`, error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCompanyStatusUpdate = async (companyId: string, newStatus: 'approved' | 'rejected', reason?: string) => {
    setActionLoading(`company-${companyId}`);
    try {
      const companyRef = doc(db, "companies", companyId);
      await updateDoc(companyRef, { 
        status: newStatus,
        moderationReason: newStatus === 'rejected' ? (reason || "Rejected by admin") : null,
        updatedAt: serverTimestamp()
      });
      setPendingCompanies(prevCompanies => prevCompanies.filter(c => c.id !== companyId));
    } catch (error) {
      console.error(`Error updating company ${companyId} to ${newStatus}:`, error);
    } finally {
      setActionLoading(null);
    }
  };


  if (loading || (!user && !loading)) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }
  
  if (user && user.role !== 'admin') {
     return (
      <div className="container mx-auto py-10">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            You do not have permission to view this page. Redirecting...
          </AlertDescription>
        </Alert>
      </div>
    );
  }


  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex items-center gap-3">
        <ShieldCheck className="h-10 w-10 text-primary" />
        <div>
            <h1 className="text-3xl font-bold font-headline">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage users, job postings, company profiles, and platform settings.</p>
        </div>
      </div>
      <Separator />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Briefcase /> Pending Job Approvals ({pendingJobs.length})</CardTitle>
            <CardDescription>Review and approve or reject newly posted jobs.</CardDescription>
          </CardHeader>
          <CardContent>
            {isJobsLoading ? (
              <div className="flex justify-center items-center py-6"><Loader2 className="h-8 w-8 animate-spin text-primary" /> <span className="ml-2">Loading pending jobs...</span></div>
            ) : pendingJobs.length === 0 ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>No Pending Jobs</AlertTitle>
                <AlertDescription>There are currently no job postings awaiting approval.</AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                {pendingJobs.map(job => (
                  <Card key={job.id} className="shadow-sm">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                          <div>
                              <CardTitle className="text-lg font-semibold hover:text-primary">
                                <Link href={`/jobs/${job.id}`} target="_blank" rel="noopener noreferrer" title="View job posting in new tab">
                                  {job.title}
                                </Link>
                              </CardTitle>
                              <CardDescription className="text-xs">
                                  Company: {job.company} | Location: {job.location} | Posted: {typeof job.postedDate === 'string' ? job.postedDate : (job.postedDate as Timestamp)?.toDate().toLocaleDateString()}
                              </CardDescription>
                          </div>
                          <Badge variant="secondary">{job.type}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground line-clamp-2 pb-3">
                      {job.description}
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2">
                      <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleJobStatusUpdate(job.id, 'rejected')}
                          disabled={actionLoading === `job-${job.id}`}
                      >
                        {actionLoading === `job-${job.id}` ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <XCircle className="mr-2 h-4 w-4 text-destructive"/>} Reject
                      </Button>
                      <Button 
                          size="sm" 
                          onClick={() => handleJobStatusUpdate(job.id, 'approved')}
                          disabled={actionLoading === `job-${job.id}`}
                      >
                        {actionLoading === `job-${job.id}` ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <CheckCircle className="mr-2 h-4 w-4"/>} Approve
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Building /> Pending Company Approvals ({pendingCompanies.length})</CardTitle>
            <CardDescription>Review and approve or reject new company profiles.</CardDescription>
          </CardHeader>
          <CardContent>
            {isCompaniesLoading ? (
              <div className="flex justify-center items-center py-6"><Loader2 className="h-8 w-8 animate-spin text-primary" /> <span className="ml-2">Loading pending companies...</span></div>
            ) : pendingCompanies.length === 0 ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>No Pending Companies</AlertTitle>
                <AlertDescription>There are currently no new company profiles awaiting approval.</AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                {pendingCompanies.map(company => (
                  <Card key={company.id} className="shadow-sm">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg font-semibold hover:text-primary">
                            <Link href={`/companies/${company.id}`} target="_blank" rel="noopener noreferrer" title="View company profile in new tab (if accessible)">
                            {company.name}
                            </Link>
                        </CardTitle>
                        <CardDescription className="text-xs">
                            Registered: {company.createdAt ? (typeof company.createdAt === 'string' ? new Date(company.createdAt).toLocaleDateString() : (company.createdAt as Timestamp)?.toDate().toLocaleDateString()) : 'N/A'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground line-clamp-2 pb-3">
                      {company.description || "No description provided."}
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2">
                      <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleCompanyStatusUpdate(company.id, 'rejected')}
                          disabled={actionLoading === `company-${company.id}`}
                      >
                        {actionLoading === `company-${company.id}` ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <XCircle className="mr-2 h-4 w-4 text-destructive"/>} Reject
                      </Button>
                      <Button 
                          size="sm" 
                          onClick={() => handleCompanyStatusUpdate(company.id, 'approved')}
                          disabled={actionLoading === `company-${company.id}`}
                      >
                        {actionLoading === `company-${company.id}` ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <CheckCircle className="mr-2 h-4 w-4"/>} Approve
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Users /> User Management ({allUsers.length})</CardTitle>
          <CardDescription>View and manage registered users on the platform.</CardDescription>
        </CardHeader>
        <CardContent>
          {isUsersLoading ? (
             <div className="flex justify-center items-center py-6"><Loader2 className="h-8 w-8 animate-spin text-primary" /> <span className="ml-2">Loading users...</span></div>
          ) : allUsers.length === 0 ? (
            <p className="text-muted-foreground">No users found.</p>
          ) : (
            <div className="max-h-[500px] overflow-y-auto">
              <Table>
                <TableCaption>A list of all registered users.</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allUsers.map((u) => (
                    <TableRow key={u.uid}>
                      <TableCell className="font-medium">{u.name}</TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell><Badge variant={u.role === 'admin' ? 'default' : (u.role === 'employer' ? 'secondary' : 'outline') }>{u.role.toUpperCase()}</Badge></TableCell>
                      <TableCell>{u.createdAt ? (typeof u.createdAt === 'string' ? new Date(u.createdAt).toLocaleDateString() : (u.createdAt as Timestamp)?.toDate().toLocaleDateString()) : 'N/A'}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" disabled>Manage</Button> 
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Advanced Moderation & Analytics (Placeholders)</CardTitle>
          <CardDescription>Future sections for more detailed platform management tools.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="bg-muted/30">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2"><ListChecks /> Content Flagging System</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">Review flagged jobs, company profiles, and user-generated content. (Coming Soon)</p>
                </CardContent>
            </Card>
             <Card className="bg-muted/30">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2"><BarChart3 /> Platform Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">View moderation queue trends, violation statistics, and overall platform health. (Coming Soon)</p>
                </CardContent>
            </Card>
            <Card className="bg-muted/30">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2"><Flag /> Policy & Appeals</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">Manage platform policies, issue warnings, and handle user/company appeals. (Coming Soon)</p>
                </CardContent>
            </Card>
             <Card className="col-span-1 md:col-span-2 lg:col-span-3 bg-muted/30">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2"><ShieldCheck /> General Admin Notes</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">To make a user an admin, you currently need to manually update their 'role' field to 'admin' in the Firestore 'users' collection.</p>
                </CardContent>
            </Card>
        </CardContent>
      </Card>
    </div>
  );
}
