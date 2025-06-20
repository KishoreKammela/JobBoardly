import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Save, Gavel } from 'lucide-react';

interface AdminLegalEditorProps {
  privacyPolicyContent: string;
  termsOfServiceContent: string;
  onPrivacyPolicyChange: (value: string) => void;
  onTermsOfServiceChange: (value: string) => void;
  onSaveLegalDocument: (
    docId: 'privacyPolicy' | 'termsOfService',
    content: string
  ) => Promise<void>;
  isContentLoaded: { privacy: boolean; terms: boolean };
  isSaving: 'privacy' | 'terms' | null;
}

const AdminLegalEditor: React.FC<AdminLegalEditorProps> = ({
  privacyPolicyContent,
  termsOfServiceContent,
  onPrivacyPolicyChange,
  onTermsOfServiceChange,
  onSaveLegalDocument,
  isContentLoaded,
  isSaving,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gavel /> Manage Legal Content
        </CardTitle>
        <CardDescription>
          Edit the Privacy Policy and Terms of Service. Changes are live
          immediately.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3 p-4 border rounded-md">
          <h3 className="text-lg font-semibold">Privacy Policy</h3>
          {!isContentLoaded.privacy ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading Privacy Policy...
            </div>
          ) : (
            <Textarea
              value={privacyPolicyContent}
              onChange={(e) => onPrivacyPolicyChange(e.target.value)}
              rows={15}
              className="font-mono text-sm"
              placeholder="Enter Privacy Policy content in Markdown..."
            />
          )}
          <Button
            onClick={() =>
              onSaveLegalDocument('privacyPolicy', privacyPolicyContent)
            }
            disabled={isSaving === 'privacy' || !isContentLoaded.privacy}
          >
            {isSaving === 'privacy' ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save Privacy Policy
          </Button>
        </div>

        <div className="space-y-3 p-4 border rounded-md">
          <h3 className="text-lg font-semibold">Terms of Service</h3>
          {!isContentLoaded.terms ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading Terms of Service...
            </div>
          ) : (
            <Textarea
              value={termsOfServiceContent}
              onChange={(e) => onTermsOfServiceChange(e.target.value)}
              rows={15}
              className="font-mono text-sm"
              placeholder="Enter Terms of Service content in Markdown..."
            />
          )}
          <Button
            onClick={() =>
              onSaveLegalDocument('termsOfService', termsOfServiceContent)
            }
            disabled={isSaving === 'terms' || !isContentLoaded.terms}
          >
            {isSaving === 'terms' ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save Terms of Service
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminLegalEditor;
