
"use client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, ShieldCheck } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function AdminPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="container mx-auto py-10">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            You do not have permission to view this page. This area is for administrators only.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Placeholder for admin content
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <ShieldCheck className="h-10 w-10 text-primary" />
        <div>
            <h1 className="text-3xl font-bold font-headline">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage users, jobs, and platform analytics.</p>
        </div>
      </div>
      <Separator />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Users Management</CardTitle>
            <CardDescription>View and manage registered users.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">(Feature coming soon)</p>
            {/* Placeholder: Link to user management section */}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Job Postings</CardTitle>
            <CardDescription>Moderate and view all job postings.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">(Feature coming soon)</p>
            {/* Placeholder: Link to job moderation section */}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Platform Analytics</CardTitle>
            <CardDescription>View key metrics and insights.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">(Feature coming soon)</p>
            {/* Placeholder: Link to analytics section */}
          </CardContent>
        </Card>
      </div>
      <p className="text-sm text-center text-muted-foreground mt-8">
        More admin features will be added in future updates. To make a user an admin, 
        you currently need to manually update their 'role' field to 'admin' in the Firestore 'users' collection.
      </p>
    </div>
  );
}
