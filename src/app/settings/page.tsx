import { SettingsForm } from '@/components/SettingsForm';
import { Separator } from '@/components/ui/separator';

export default function SettingsPage() {
  return (
    <div className="space-y-8 max-w-2xl mx-auto">
       <div>
        <h1 className="text-3xl font-bold mb-2 font-headline">Settings</h1>
        <p className="text-muted-foreground">Manage your account preferences and notification settings.</p>
      </div>
      <Separator />
      <SettingsForm />
    </div>
  );
}
