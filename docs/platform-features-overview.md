# JobBoardly - Platform Features Overview

This document provides a detailed overview of all features currently implemented in the JobBoardly platform, categorized by user roles.

## 1. Core Platform Features

These features are foundational to the JobBoardly experience.

- **Responsive Design**: The platform is designed to work across various devices (desktops, tablets, mobile).
- **Dynamic Routing**: Next.js App Router is used for efficient page navigation and loading.
- **User Authentication**: Secure login and registration via Email/Password and social providers (Google, GitHub, Microsoft).
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

## 2. Job Seeker Features

### 2.1. Account Management

- **Registration & Login**: Secure account creation and login via email/password or social providers (Google, GitHub, Microsoft). Password strength indicators during registration.
- **Change Password**: Ability to change account password securely.
- **Account Status**: Awareness of account status (`active`, `suspended`). Suspended accounts have limited functionality. Deleted accounts cannot log in.

### 2.2. Profile Management (`/profile`)

- **Comprehensive Profile Creation**: Sections for personal info, professional headline, AI-assisted professional summary, skills, detailed work experience (with company, role, duration, description, CTC), education (with level, degree, institute, batch, specialization, course type, description, most relevant flag), languages (with proficiency), total experience, compensation (current & expected CTC), and links (portfolio, LinkedIn).
- **Resume Management**:
  - Upload resume (PDF, DOCX, TXT) or paste resume text.
  - **AI Resume Parsing**: Genkit flow (`parseResumeFlow`) analyzes the resume to extract key information and pre-fill profile sections.
  - View/Download/Remove stored resume file.
- **AI Professional Summary Generator**:
  - Job seekers can input a target role/company, and the AI (`generateProfileSummaryFlow`) generates a tailored summary based on their profile data.
  - Option to copy the generated summary to their main profile.
- **Profile Visibility**: Control whether their profile is searchable by employers.
- **Downloadable PDF Profile**: Generate and download a PDF version of their profile.
- **Profile Preview (`/profile/preview`)**: View how their profile appears to others.

### 2.3. Job Discovery

- **Job Search & Filtering (`/jobs`)**:
  - Browse and search approved job postings.
  - Filters for keywords, location, role type, remote option, and recent activity.
  - View modes: Grid or List.
- **Save Job Search**: Save current search criteria (keywords + filters) with a custom name. Managed in `/settings`.
- **Job Detail Page (`/jobs/[jobId]`)**:
  - View full job details (description, responsibilities, qualifications, skills, salary, company info).
  - Share job posting link.
  - Screening questions are not visible to public job seekers on this page (unless it's a preview by an Admin/owning Employer).
- **Company Profile Page (`/companies/[companyId]`)**: View company details and their open positions.

### 2.4. Application Management

- **Apply for Jobs**:
  - Apply directly for 'approved' jobs.
  - If a job has screening questions, a modal appears to answer them (text, yes/no currently supported). Answers are submitted with the application.
- **Re-application Prevention**: Cannot re-apply for a job once an application is submitted, withdrawn, or rejected.
- **Withdraw Application**: Withdraw an active application (status 'Applied') via the "My Jobs" page or job detail page.
- **Save Jobs**: Bookmark 'approved' jobs.
- **My Jobs Page (`/my-jobs`)**:
  - Dashboard to view and manage Saved Jobs and Applied Jobs.
  - Filter jobs by status (All, Applied, Saved, Withdrawn).
  - View application status (e.g., Applied, Reviewed, Withdrawn by Applicant, Rejected By Company).

### 2.5. AI-Powered Job Matching (`/ai-match`)

- Job seekers can input/review their profile summary.
- The AI (`aiPoweredJobMatchingFlow`) matches their comprehensive profile against all available 'approved' job postings.
- Provides a list of relevant job IDs and detailed reasoning for the matches.

### 2.6. User Settings (`/settings`)

- **Theme Customization**: Light, Dark, or System preference.
- **Notification Preferences**: Basic UI for toggling notification categories (backend triggers pending).
- **Manage Saved Searches**: View, apply, or delete saved job searches.
- **Job Board Display Preferences**: Default view (list/grid) and items per page.
- **Local Search History**: View and clear device-specific job search term history.

## 3. Employer Features

### 3.1. Account & Company Management

- **Registration & Login**: Secure account creation (associating with a new or existing company) and login. Company name is required for new company registration with social sign-up.
- **Company Profile**: New company profiles are set to 'pending' and require admin approval.
- **Change Password**: Ability to change account password.
- **Account & Company Status**: Aware of personal account status and associated company status (`pending`, `approved`, `rejected`, `suspended`, `deleted`). Suspended/deleted company status limits functionality.

### 3.2. Company Profile Management (`/profile` - for Company Admins)

- **Manage Company Details**: Update company name, description (Markdown), website, logo, banner URL.
- **Admin Approval**: Significant updates to company profiles may require re-approval.
- **View Recruiters**: View list of recruiters associated with the company.
- **Profile Preview (`/employer/profile/preview`)**: Preview the public company page.
- _Note: Editing disabled if company is suspended/deleted._

### 3.3. Job Posting & Management

- **Create/Edit Job Postings (`/employer/post-job`)**:
  - Form for job details: title, location, type, remote status, salary, skills.
  - **AI Job Description Parsing**: Upload a document (PDF, DOCX, TXT), and AI (`parseJobDescriptionFlow`) attempts to pre-fill fields.
  - **Screening Questions**: Add custom screening questions (text, yes/no) to job postings, mark as required.
- **Job Status**: New jobs are 'pending' approval. Edits resubmit job as 'pending'.
- **View Posted Jobs (`/employer/posted-jobs`)**:
  - Dashboard of all jobs posted by the company.
  - Displays job title, status, applicant count.
  - Links to edit job or view applicants.
  - **Preview Jobs**: Employers can preview their jobs in any status (pending, rejected, suspended) via a link which navigates to `/jobs/[jobId]`, where they will see full details including screening questions.

### 3.4. Applicant Management

- **View Applicants (`/employer/jobs/[jobId]/applicants`)**:
  - List of candidates who applied for a specific job.
  - View applicant name, headline, application date.
  - **View Screening Question Answers**: Answers provided by applicants are displayed.
  - Filter applicants by status.
- **Application Status Management**: Update application status (e.g., `Reviewed`, `Interviewing`, `Hired`).
- **Internal Notes**: Add private notes for each applicant.
- **Candidate Detail Page (`/employer/candidates/[candidateId]`)**: View full job seeker profiles.

### 3.5. Candidate Sourcing

- **Candidate Search & Filtering (`/employer/find-candidates`)**:
  - Search 'searchable' job seeker profiles.
  - Keyword search with basic boolean logic (AND, OR, NOT, "phrases").
  - Filters: location, availability, job search status, salary, recent activity, experience.
  - View modes: Grid or List.
- **Save Candidate Search**: Save current search criteria with a custom name. Managed in `/settings`.
- **AI-Powered Candidate Matching (`/employer/ai-candidate-match`)**:
  - Input/upload a job description.
  - AI (`aiPoweredCandidateMatchingFlow`) matches it against searchable candidate profiles.
  - Provides relevant candidate UIDs and match reasoning.

### 3.6. User Settings (`/settings`)

- **Theme Customization**: Light, Dark, or System.
- **Notification Preferences**: Basic UI for toggling notification categories (backend triggers pending).
- **Manage Saved Candidate Searches**: View, apply, or delete saved candidate searches.

## 4. Platform Staff / Admin Features (`/admin`)

### 4.1. Admin Dashboard Overview

- **Platform Analytics**: Key metrics (total job seekers, companies, jobs, applications). (Not visible to Support Agents).
- **Quick Moderation Cards**: For pending job and company approvals. (Usable by SuperAdmin, Admin, Moderator).

### 4.2. Content & User Management (Tab-Based)

- **Companies Management**:
  - View all companies with details.
  - Actions: View profile, Approve, Reject, Suspend, Activate, Delete (Soft). (Actions vary by role; restricted for Support Agents/Data Analysts).
  - Search, sort, pagination.
- **All Jobs Management**:
  - View all jobs with details (including screening questions if applicable for preview).
  - Actions: View public job page (admins see full details), Suspend (Admin+), Activate, Approve, Reject. (Actions vary by role; restricted for Support Agents/Data Analysts).
  - Search, sort, pagination.
- **Job Seekers Management**:
  - View all job seeker profiles.
  - Actions: View profile, Suspend, Activate, Delete (Soft). (Admin/SuperAdmin only).
  - Search, sort, pagination.
- **Platform Users Management**: (Visible to SuperAdmin, Admin, Data Analyst; actions vary)
  - View all platform staff accounts.
  - Actions: View profile. Suspend/Activate other staff (permission-based; SuperAdmins manage all, Admins manage Moderators/Support/Data Analysts).
  - Search, sort, pagination.
- **Legal Content Management**: (SuperAdmins only)
  - Edit Privacy Policy and Terms of Service using a Markdown editor.
  - Content stored in Firestore and dynamically displayed on public pages.
- **AI Feature Management (Placeholder)**: Placeholder tab for future AI feature toggles (SuperAdmins only).

### 4.3. Access Control

- **Protected Route**: `/admin` accessible only to defined admin-like roles.
- **Dedicated Login**: `/auth/admin/login` for platform staff.
- **Role-Based Permissions**: Features and actions within the admin panel are restricted based on the logged-in staff member's role.

---

This overview reflects the features implemented up to the current point. For planned future developments, please refer to the `docs/future-development-roadmap.md`.
