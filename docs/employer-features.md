# JobBoardly - Employer Features Guide

This guide provides an overview of the features and functionalities available to Employers and Recruiters on the JobBoardly platform.

## 1. Core Goal

To empower employers to efficiently find and connect with qualified candidates by providing tools for job posting, company profile management, applicant tracking, and AI-driven candidate matching.

## 2. Key Features

### 2.1. Authentication & Account Management

- **Secure Registration (`/employer/register`)**:
  - Employers register by providing their name, company name, email, and password.
  - A new company profile is created with 'pending' status upon first employer registration for that company.
  - Social sign-up options (Google, GitHub, Microsoft) are available; company name must be provided if it's a new company.
- **Login (`/employer/login`)**: Secure access for registered employers.
- **Change Password (`/auth/change-password`)**: Dedicated page for updating account passwords. Requires confirmation.
- **Account Status**: Employer accounts can be 'active' or 'suspended'.
  - **Company Status Impact**: If the associated company profile is 'suspended' by a platform Admin, recruiters can still log in but will have limited access (e.g., cannot post/edit jobs, cannot edit main company profile details, cannot manage applicants for suspended jobs). They can typically edit their personal recruiter details and settings. If the company is 'deleted' by an admin, recruiters will be effectively locked out of employer features after Firebase Authentication succeeds; they will see messages indicating the company account is deactivated.

### 2.2. Company Profile Management (`/profile` if Company Admin)

- **Setup & Manage Company Details**: Company Admins can set up and update:
  - Company Name
  - Description (Markdown supported)
  - Website URL
  - Logo URL
  - Banner Image URL
- **Admin Approval**: New company profiles (and significant updates) require approval from a platform Admin before becoming publicly visible or fully operational.
- **Company Status**: Current status (e.g., `Pending`, `Approved`, `Rejected`, `Suspended`, `Deleted`) is visible to the company admin.
- **Recruiter List**: Company Admins can view a list of recruiters associated with their company (recruiter management itself is an admin task).
- **Saving Changes**: Requires confirmation.
- **Profile Preview (`/employer/profile/preview`)**: Company Admins can preview how their company's public profile page will appear to job seekers and other users.
- _Note_: If the company status is 'suspended' or 'deleted', editing company profile details is disabled.

### 2.3. Job Posting & Management

- **Create & Edit Job Postings (`/employer/post-job`)**:
  - Intuitive form to input job details including:
    - **Core Info**: Title, Location, Type (Full-time, Part-time, etc.), Remote status.
    - **Detailed Info**: Industry, Department/Functional Area, Role/Designation, Experience Level, Min/Max Years of Experience, Education Qualification.
    - **Responsibilities & Requirements**: Separate, detailed text areas for what the candidate will do and what they need to have.
    - **Compensation**: Salary range (Min/Max INR) and a `Pay Transparency` checkbox to control visibility.
    - **Benefits**: A text area to describe company perks.
  - **AI Job Description Parsing**: Upload a job description document (PDF, DOCX, TXT). The AI attempts to parse it and pre-fill the form fields. _Note: Plain text (.txt) is recommended for best parsing results with the current AI model._
  - **Screening Questions**: Add custom screening questions (text input, yes/no supported) to job postings. These questions are presented to job seekers during the application process. Employers can mark questions as required.
  - Submitting new jobs or updating existing ones requires confirmation.
- **Job Status**:
  - New jobs are submitted with a 'pending' status and require platform Admin approval.
  - Editing an existing job displays its current status (e.g., `approved`, `rejected`, `suspended`). Saving edits resubmits the job as 'pending' for re-approval.
- **View Posted Jobs (`/employer/posted-jobs`)**:
  - A dashboard listing all jobs posted by the employer's company.
  - Displays job title, status, and applicant count for each job.
  - Quick links to edit a job or view its applicants. Actions may be disabled if the job or company is suspended/deleted, or if the job itself is suspended by an admin.
  - Employers can preview their jobs in any status (pending, rejected, suspended) via a link on this page, which leads to the job detail page (`/jobs/[jobId]`) where they will see all details including screening questions.
- _Note_: Job posting and management are disabled if the company account is 'suspended' or 'deleted'.

### 2.4. Applicant Management

- **View Applicants (`/employer/jobs/[jobId]/applicants`)**:
  - See a list of candidates who have applied for a specific job.
  - View applicants' names, headlines, and application dates.
  - **Access answers to screening questions**: If the job had screening questions, the answers provided by each applicant are displayed.
  - Filter applicants by their current application status.
  - _Note_: Disabled if the company account is 'suspended' or 'deleted', or if the specific job is 'suspended' by an admin.
- **Application Status Management**:
  - Update the status of an application (e.g., `Reviewed`, `Interviewing`, `Offer Made`, `Hired`, `Rejected By Company`). Requires confirmation.
  - Add internal notes (visible only to employers from the same company) for each applicant.
  - _Note_: Disabled if the company account is 'suspended' or 'deleted', or if the specific job is 'suspended'.
- **Dynamic Candidate Detail Pages (`/employer/candidates/[candidateId]`)**:
  - View comprehensive profiles of job seekers who have applied or are found via search.
  - Includes their skills, experience, education, languages, preferences (including `noticePeriod`), and resume summary.
  - Download a PDF version of the candidate's profile (if they've enabled it and their profile is viewable).

### 2.5. Candidate Sourcing

- **Candidate Search & Filtering (`/employer/find-candidates`)**:
  - Browse and search through all job seeker profiles marked as 'searchable'.
  - **Advanced Search**:
    - Keyword search supporting basic **boolean logic** (AND, OR, NOT, "exact phrases").
  - **Filters**:
    - Preferred Location.
    - `Notice Period`.
    - Job Search Status (e.g., Actively Looking, Open to Opportunities).
    - Desired Salary Range (Min/Max INR).
    - Recent Profile Activity (e.g., profile updated in the last 7 days).
    - Minimum Years of Experience.
  - **View Modes**: Grid or List view for search results.
  - **Save Current Search**: Ability to save the current combination of search term and filters as a "Saved Candidate Search" with a custom name. (See Settings for management). Saving a search requires confirmation.
  - _Note_: Disabled if the company account is 'suspended' or 'deleted'.
- **AI-Powered Candidate Matching (`/employer/ai-candidate-match`)**:
  - Input a job description (either by pasting text or uploading a document for AI parsing).
  - The AI matches the job description against the database of searchable candidate profiles.
  - Provides a list of relevant candidate UIDs and detailed reasoning for the matches, considering skills, experience, education, preferences, etc.
  - _Note_: Disabled if the company account is 'suspended' or 'deleted'.

### 2.6. User Settings (`/settings`)

- Customize basic platform preferences:
  - Theme (Light, Dark, System). (Available even if company suspended/deleted).
  - Notification preferences (for application updates, etc. - _basic UI implemented, backend triggers for notifications pending_). (Disabled if company suspended/deleted).
- **Manage Saved Candidate Searches**: View a list of your saved candidate search criteria.
  - **Apply Search**: Click a saved search to navigate to the `/employer/find-candidates` page with those filters pre-applied.
  - **Delete Search**: Remove a saved candidate search. Requires confirmation.
  - (Saving new searches is done from the `/employer/find-candidates` page filter sidebar).
  - _Note_: Applying or deleting saved candidate searches disabled if company account 'suspended'/'deleted'.

## 3. User Journey Maps (Employer)

### Journey 1: Company Registration to Posting First Job

```mermaid
graph TD
    A[Start: Needs to Hire] --> B[Visit JobBoardly Employer Section: /employer]
    B --> C{Has Account & Company Setup?}
    C -->|No| D[Register Company & Recruiter Account: /employer/register]
    D --> E[Company Profile Pending Admin Approval]
    E --> F[Login: /employer/login]
    F --> F_check_status{Company Status OK?}
    F_check_status -->|Deleted| F_deleted[Show Account Deactivated, Logout/Lockout]
    F_check_status -->|Suspended| G_suspended[Go to Post Job, Feature Disabled]
    C -->|Yes| F
    F_check_status -->|Active/Approved| G[Navigate to Post Job: /employer/post-job]
    G --> H[Fill Job Details or Upload/Parse JD Document with AI]
    H --> I[Add Screening Questions Optional Text, Yes/No]
    I --> J_confirm[Confirm Job Submission]
    J_confirm -->|Yes| J[Submit Job for Admin Approval]
    J --> K[Job Pending in My Postings: /employer/posted-jobs]
    K --> L[Await Admin Approval for Job or Preview job details]
    G_suspended --> M[Show Alert: Posting Disabled]
```

### Journey 2: Managing Applicants for an Approved Job

```mermaid
graph TD
    A[Job Approved by Admin] --> B_check_status{Company/Job Status OK?}
    B_check_status -- Suspended/Deleted --> B_disabled[Feature Disabled]
    B_check_status -- Active/Approved --> B[Employer Notified or Checks /employer/posted-jobs]
    B --> C[Job visible to Seekers, Applications Received]
    C --> D[View Applicants for Job: /employer/jobs/jobId/applicants]
    D --> E[Filter/Review Applicant List]
    E --> F{Select Applicant}
    F -- View Profile --> G[Candidate Detail Page: /employer/candidates/applicantId]
    G --> H[Review Full Profile & Screening Answers]
    H --> I_confirm[Confirm Status Update]
    I_confirm -- Yes --> I[Update Application Status e.g. Interviewing]
    I --> J[Add Internal Notes]
    J --> D
    F -- Back to List --> D
```

### Journey 3: Previewing Company Profile (Company Admin) (As before)

### Journey 4: Saving and Using a Candidate Search (As before)

## 4. Page Routes

| Route                                | Description                                                                                                                                                                              | Access Level                                                      |
| :----------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------- |
| `/employer`                          | Landing page for employers.                                                                                                                                                              | Public                                                            |
| `/employer/register`                 | Employer and new company registration page.                                                                                                                                              | Public                                                            |
| `/employer/login`                    | Employer login page. If company is 'deleted', feature access restricted post-auth.                                                                                                       | Public                                                            |
| `/profile`                           | Manage recruiter profile; if Company Admin, also company profile. Company profile editing restricted if company 'suspended'/'deleted'. Profile save requires confirmation.               | Employer                                                          |
| `/employer/profile/preview`          | Company Admins can preview their public company profile.                                                                                                                                 | Employer (Company Admin)                                          |
| `/employer/post-job`                 | Form to create/edit job. Supports AI Job Description Parsing & Screening Questions (Text, Yes/No). Disabled if company 'suspended'/'deleted'. Submitting/updating requires confirmation. | Employer                                                          |
| `/employer/posted-jobs`              | Dashboard of posted jobs. Can preview jobs in any status. Actions restricted if company 'suspended'/'deleted' or job 'suspended'.                                                        | Employer                                                          |
| `/employer/jobs/[jobId]/applicants`  | View/manage applicants, including screening question answers. Disabled if company 'suspended'/'deleted' or job 'suspended'. Status updates require confirmation.                         | Employer                                                          |
| `/employer/find-candidates`          | Search/filter job seekers. Disabled if company 'suspended'/'deleted'.                                                                                                                    | Employer                                                          |
| `/employer/candidates/[candidateId]` | View user profile (Job Seeker by Employer; Any User by Platform Staff). Access for platform staff depends on their role's permissions.                                                   | Employer, Admin, SuperAdmin, Moderator, SupportAgent, DataAnalyst |
| `/employer/ai-candidate-match`       | AI tool to find candidates. Disabled if company 'suspended'/'deleted'.                                                                                                                   | Employer                                                          |
| `/settings`                          | Manage employer preferences (theme, saved candidate searches, notification settings). Most disabled if company 'suspended'/'deleted', except theme. Deleting saved search needs confirm. | Employer                                                          |
| `/auth/change-password`              | Page to change password. (Accessible if company suspended/deleted). Password change requires confirmation.                                                                               | Employer                                                          |

## 5. Key "API" Interactions (Data Flows with Genkit & Firebase)

Employers use Genkit flows for AI-assisted tasks and interact with Firebase Firestore for data storage and management. Critical write operations (job posts, applicant status, profile updates, saving/deleting searches) are preceded by confirmation modals.

- **Job Description Parsing (`parseJobDescriptionFlow`):** Parses uploaded job description documents to extract `title`, `responsibilities`, `requirements`, and other detailed fields.
- **AI-Powered Candidate Matching (`aiPoweredCandidateMatching`):** Matches a detailed job description (including all new fields) against the candidate database.
- **Company & Job Data (Firebase Firestore):**
  - **Company Profile**: Updated in `companies` collection. Admin approval required for new/significant changes. Saving requires confirmation. Editing restricted if company status is 'suspended' or 'deleted'.
  - **Job Postings**: Created/updated in `jobs` collection, now includes detailed fields like `responsibilities`, `requirements`, `benefits` (string), `industry`, `experienceLevel`, and `screeningQuestions`. Submitting/updating requires confirmation.
  - **Application Management**: Employers update `status` and `employerNotes` in `application` documents (which now includes `answers` from job seekers). Status updates require confirmation.

## 6. Future Updates (Potential Enhancements)

- **Advanced Applicant Tracking System (ATS) Features**:
  - Customizable application pipelines/stages.
  - Bulk actions on applicants (e.g., send templated emails).
  - Collaborative notes and ratings for applicants by multiple recruiters in the company.
- **Employer Branding Tools**: Enhanced company profile pages with more customizable sections (e.g., "Life at [Company]", testimonials).
- **Analytics & Reporting**: Performance metrics for job postings (views, application rates, source of applicants).
- **Direct Messaging with Candidates**: Secure, in-platform communication.
- **Interview Scheduling Integration**: Connect with calendar tools to streamline interview scheduling.
- **Team Management**: For Company Admins to invite and manage recruiter accounts (currently admin task).
- **Clearer guidance for recruiters** whose company account is suspended or deleted.
- **Enhanced candidate search analytics**: Insights on search effectiveness.
- **Support for Multiple Choice & Checkbox Screening Questions**: Enhance the UI for employers to create these types and for job seekers to answer them.
- Extensive AI-powered enhancements are planned, including AI Recruiter Assistant and Smart Job Description Optimizer. See `docs/ai-features-roadmap.md` for the full AI vision.
- For a comprehensive view of planned general platform enhancements, consult the [Future Development Roadmap](../future-development-roadmap.md).

---

_This guide is intended for informational purposes for the JobBoardly team._
