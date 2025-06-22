# JobBoardly - Platform Features Overview

This document provides a detailed overview of all features currently implemented in the JobBoardly platform, categorized by user roles.

## 1. Core Platform Features

- **Responsive Design**: The platform is designed to work across various devices (desktops, tablets, mobile).
- **Dynamic Routing**: Next.js App Router is used for efficient page navigation and loading.
- **User Authentication**: Secure login and registration via Email/Password and social providers (Google, GitHub, Microsoft). Includes robust redirection and personalized welcome messages.
- **Account Status Management**: User and company accounts can have statuses like `active`, `pending`, `approved`, `rejected`, `suspended`, or `deleted`, which control access and visibility.
- **Toast Notifications**: Used for providing feedback on user actions (e.g., success messages, error alerts).
- **Basic In-App Notification System (UI Shell)**: A notification bell icon in the navbar and a dropdown to display recent notifications. Includes functionality to mark notifications as read/all read. (Backend triggers for creating notifications are pending future development).
- **Firebase Integration**: Leverages Firebase for Authentication, Firestore (database), and Storage.
- **Genkit AI Integration**: Utilizes Genkit with Gemini models for AI-powered features.
- **SEO Enhancements**:
  - Optimized `metadata` (titles, descriptions, keywords) for public pages.
  - Dynamic `sitemap.xml` generation for search engines.
  - User-friendly HTML sitemap page (`/sitemap`).
  - Proper use of H1 tags and `next/image` for image optimization on key public pages.
- **Legal Pages**: Dynamically rendered Privacy Policy and Terms of Service pages, with content editable by SuperAdmins.
- **Services Layer Architecture**: Data interactions with Firebase are abstracted into a dedicated services layer (`src/services`) for maintainability and scalability.

## 2. Job Seeker Features

### 2.1. Account Management

- **Registration & Login**: Secure account creation and login via email/password or social providers.
- **Change Password**: Ability to change account password securely.
- **Account Status**: Awareness of account status (`active`, `suspended`). Suspended accounts have limited functionality. Deleted accounts cannot log in.

### 2.2. Profile Management (`/profile`)

- **Comprehensive Profile Creation**: Sections for personal info, professional headline, AI-assisted professional summary, skills, detailed work experience, education, languages, total experience, compensation (current & expected CTC), links (portfolio, LinkedIn), and job preferences (including `noticePeriod`).
- **Resume Management**:
  - Upload resume (PDF, DOCX, TXT) or paste resume text.
  - **AI Resume Parsing**: Genkit flow (`parseResumeFlow`) analyzes the resume to extract key information and pre-fill profile sections.
  - View/Download/Remove stored resume file.
- **AI Professional Summary Generator**:
  - Job seekers can input a target role/company, and the AI (`generateProfileSummaryFlow`) generates a tailored summary.
  - Option to copy the generated summary to their main profile.
- **Profile Visibility**: Control whether their profile is searchable by employers.
- **Downloadable PDF Profile**: Generate and download a PDF version of their profile.
- **Profile Preview (`/profile/preview`)**: View how their profile appears to others.

### 2.3. Job Discovery

- **Job Search & Filtering (`/jobs`)**:
  - Browse and search approved job postings.
  - Filters for keywords, location, role type, remote option, recent activity, salary range, experience level, and min experience years.
  - View modes: Grid or List.
- **Save Job Search**: Save current search criteria. Managed in `/settings`.
- **Job Detail Page (`/jobs/[jobId]`)**:
  - View full job details, now including distinct sections for `responsibilities` and `requirements`, plus benefits, industry, experience level, and a prominent company info header.
- **Company Profile Page (`/companies/[companyId]`)**: View company details and their open positions.

### 2.4. Application Management

- **Apply for Jobs**:
  - Apply directly for 'approved' jobs.
  - If a job has screening questions, a modal appears to answer them (text, yes/no supported).
- **Re-application Prevention**: Cannot re-apply for a job once an application is submitted, withdrawn, or rejected.
- **Withdraw Application**: Withdraw an active application at any stage before a final decision (e.g., 'Hired' or 'Rejected By Company') is made.
- **Save Jobs**: Bookmark 'approved' jobs. This is disabled if an application for the job already exists.
- **My Jobs Page (`/my-jobs`)**:
  - Dashboard to view and manage Saved Jobs and Applied Jobs.
  - Filter jobs by status (All, Applied, Saved, Withdrawn).

### 2.5. AI-Powered Job Matching (`/ai-match`)

- AI (`aiPoweredJobMatchingFlow`) matches their comprehensive profile (including `noticePeriod` and other detailed preferences) against all available 'approved' job postings.
- Provides a list of relevant job IDs and detailed reasoning for the matches.

### 2.6. User Settings (`/settings`)

- **Theme Customization**: Light, Dark, or System preference.
- **Notification Preferences**: Basic UI for toggling notification categories (backend triggers pending).
- **Manage Saved Searches**: View, apply, or delete saved job searches.
- **Job Board Display Preferences**: Default view (list/grid) and items per page.
- **Local Search History**: View and clear device-specific job search term history.

## 3. Employer Features

### 3.1. Multi-Recruiter System

- **Company Admin Role**: The first user to register a company becomes its admin.
- **Recruiter Invitation**: Company Admins can invite new recruiters to their company via email (up to a limit of 3 total recruiters).
- **Automated Linking**: New users registering with an invited email are automatically linked to the company as a standard recruiter.

### 3.2. Company Profile Management

- **Admin-Only Editing (`/employer/company/edit`)**: A dedicated, protected page for Company Admins to edit company details.
- **Re-Approval Workflow**: Submitting company profile edits sets the company status to 'pending' for admin review.
- **Recruiter Management (`/profile`)**: Company Admins can view current recruiters, see pending invitations, and send new invites.
- **Profile Preview (`/employer/profile/preview`)**: Company Admins can preview the public company page.

### 3.3. Job Posting & Management

- **Collaborative Posting**: All recruiters in a company can create, edit, and manage job postings for that company.
- **Create/Edit Job Postings (`/employer/post-job`)**:
  - Form for comprehensive job details, including `responsibilities`, `requirements`, `benefits`, salary, and an `applicationDeadline`.
  - **AI Job Description Parsing**: Upload a document, and AI (`parseJobDescriptionFlow`) attempts to pre-fill these fields.
  - **Screening Questions**: Add custom screening questions (text, yes/no) to job postings.
- **Job Status**: New jobs are 'pending' approval. Edits resubmit job as 'pending'.
- **View Posted Jobs (`/employer/posted-jobs`)**: Dashboard of all jobs posted by the company.

### 3.4. Applicant Management

- **View Applicants (`/employer/jobs/[jobId]/applicants`)**:
  - List of candidates who applied for a specific job.
  - **View Screening Question Answers**: Answers provided by applicants are displayed.
  - Filter applicants by status.
- **Application Status Management**: Update application status (e.g., `Reviewed`, `Interviewing`, `Hired`).
- **Internal Notes**: Add private notes for each applicant.
- **Candidate Detail Page (`/employer/candidates/[candidateId]`)**: View full job seeker profiles.

### 3.5. Candidate Sourcing

- **Candidate Search & Filtering (`/employer/find-candidates`)**:
  - Search 'searchable' job seeker profiles.
  - Keyword search with boolean logic.
  - Filters: location, `noticePeriod`, job search status, salary, recent activity, experience.
- **Save Candidate Search**: Save current search criteria.
- **AI-Powered Candidate Matching (`/employer/ai-candidate-match`)**:
  - AI (`aiPoweredCandidateMatchingFlow`) matches a detailed job description against searchable candidate profiles.

### 3.6. User Settings (`/settings`)

- **Theme Customization**: Light, Dark, or System.
- **Notification Preferences**: Basic UI.
- **Manage Saved Candidate Searches**: View, apply, or delete saved candidate searches.

## 4. Platform Staff / Admin Features (`/admin`)

- **Dashboard Overview**: Key platform analytics and quick moderation cards.
- **Content & User Management (Tab-Based)**:
  - **Companies Management**: Approve, reject, suspend, activate, and delete companies.
  - **All Jobs Management**: View all jobs, including screening questions on preview. Suspend, activate, approve, reject jobs.
  - **Job Seekers Management**: Suspend, activate, delete job seeker accounts.
  - **Platform Users Management**: Manage admin/moderator accounts with role-based permissions.
  - **Legal Content Management**: (SuperAdmins only) Edit Privacy Policy and Terms of Service.
  - **AI Feature Management (Placeholder)**: Placeholder for future AI feature toggles.
- **Access Control**: Protected `/admin` route with a dedicated login at `/auth/admin/login`.

---

This overview reflects the features implemented up to the current point. For planned future developments, please refer to the `../planning/01-future-development-roadmap.md`.
