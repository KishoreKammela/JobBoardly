import { UserProfileForm } from '@/components/UserProfileForm';
import { ResumeUploadForm } from '@/components/ResumeUploadForm';
import { Separator } from '@/components/ui/separator';

export default function ProfilePage() {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold mb-2 font-headline">My Profile</h1>
        <p className="text-muted-foreground">View and manage your account details and professional information.</p>
      </div>
      <Separator />
      <UserProfileForm />
      <Separator />
      <ResumeUploadForm />
    </div>
  );
}
