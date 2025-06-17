"use client";
import { useState, useEffect, type FormEvent } from 'react';
import type { UserSettings } from '@/types';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { defaultUserSettings } from '@/lib/mockData';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Trash2 } from 'lucide-react';

// In a real app, these settings would be fetched and saved per user.
// For now, we'll use localStorage for persistence.
const SETTINGS_STORAGE_KEY = 'jobboardly-user-settings';

export function SettingsForm() {
  const [settings, setSettings] = useState<UserSettings>(defaultUserSettings);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const storedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (storedSettings) {
      setSettings(JSON.parse(storedSettings));
    }
  }, []);

  const handleSwitchChange = (name: keyof UserSettings['jobAlerts'], checked: boolean) => {
    setSettings(prev => ({
      ...prev,
      jobAlerts: { ...prev.jobAlerts, [name]: checked },
    }));
  };

  const handleRadioChange = (value: UserSettings['jobBoardDisplay']) => {
    setSettings(prev => ({ ...prev, jobBoardDisplay: value }));
  };

  const handleSelectChange = (value: string) => {
    setSettings(prev => ({ ...prev, itemsPerPage: parseInt(value, 10) as UserSettings['itemsPerPage'] }));
  };
  
  const handleClearSearchHistory = () => {
    setSettings(prev => ({ ...prev, searchHistory: [] }));
     toast({
      title: 'Search History Cleared',
      description: 'Your job search history has been cleared.',
    });
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    setIsLoading(false);
    toast({
      title: 'Settings Saved',
      description: 'Your preferences have been updated.',
    });
  };

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-headline">Account Settings</CardTitle>
        <CardDescription>Customize your JobBoardly experience and notification preferences.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-8">
          <section>
            <h3 className="text-lg font-semibold mb-3">Job Board Display</h3>
            <div className="space-y-4">
              <div>
                <Label className="mb-2 block">View Mode</Label>
                <RadioGroup
                  value={settings.jobBoardDisplay}
                  onValueChange={handleRadioChange}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="list" id="view-list" />
                    <Label htmlFor="view-list">List View</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="grid" id="view-grid" />
                    <Label htmlFor="view-grid">Grid View</Label>
                  </div>
                </RadioGroup>
              </div>
              <div>
                <Label htmlFor="itemsPerPage" className="mb-2 block">Items Per Page</Label>
                <Select value={String(settings.itemsPerPage)} onValueChange={handleSelectChange}>
                  <SelectTrigger id="itemsPerPage" className="w-[180px]">
                    <SelectValue placeholder="Select count" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10 items</SelectItem>
                    <SelectItem value="20">20 items</SelectItem>
                    <SelectItem value="50">50 items</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-3">Notification Preferences</h3>
            <div className="space-y-3">
              {(Object.keys(settings.jobAlerts) as Array<keyof UserSettings['jobAlerts']>).map((key) => (
                <div key={key} className="flex items-center justify-between p-3 border rounded-md bg-muted/20">
                  <Label htmlFor={key} className="capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()} Alerts
                  </Label>
                  <Switch
                    id={key}
                    checked={settings.jobAlerts[key]}
                    onCheckedChange={(checked) => handleSwitchChange(key, checked)}
                    aria-label={`${key.replace(/([A-Z])/g, ' $1').trim()} Alerts Toggle`}
                  />
                </div>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-1">Search History</h3>
            {settings.searchHistory.length > 0 ? (
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 max-h-40 overflow-y-auto bg-muted/20 p-3 rounded-md">
                {settings.searchHistory.map((term, index) => (
                  <li key={index}>{term}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No search history yet.</p>
            )}
            {settings.searchHistory.length > 0 && (
                 <Button type="button" variant="outline" size="sm" onClick={handleClearSearchHistory} className="mt-3">
                    <Trash2 className="mr-2 h-4 w-4" /> Clear Search History
                </Button>
            )}
          </section>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Settings
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
