# JobBoardly - Job Seeker Features Guide

Welcome to the JobBoardly Job Seeker Guide! This document details the features available to help you find your next career opportunity.

## 1. Core Goal

To provide job seekers with a comprehensive, AI-enhanced platform to manage their professional profile, search for relevant jobs, apply seamlessly, and track their job-seeking journey.

## 2. Key Features

### 2.1. Authentication & Account Management

- **Secure Registration**: Sign up using Email/Password or social providers (Google, GitHub, Microsoft). Includes password strength indicators.
- **Login**: Access your account securely.
- **Change Password**: A dedicated page to update your account password. This action requires confirmation.
- **Account Status**: Your account can be 'active', 'suspended', or 'deleted' (by an admin).
  - **Suspended Accounts**: Can log in but have limited functionality. Cannot apply for jobs, edit main profile sections (like experience, education, skills), save jobs, or use AI job matcher. Can view jobs, change password, and adjust some settings (like theme, view saved searches, but cannot create new or delete saved searches). An alert will be displayed on relevant pages.
  - **Deleted Accounts**: Cannot log in. If Firebase Authentication succeeds, the application will immediately log the user out and display a message indicating the account is deactivated.

### 2.2. Profile Management (`/profile`)

- **Comprehensive Profile Sections**:
  - **Personal Information**: Name, Avatar, Mobile, Gender, Date of Birth, Home City/State.
  - **Professional Headline**: A short tagline to summarize your professional identity.
  - **Professional Summary**: A detailed summary of your career, often pre-filled by AI from your resume.
  - **Skills**: List your technical and soft skills.
  - **Work Experience**: Add detailed entries for each role (Company, Job Role, Duration, Description, Annual CTC).
  - **Education**: Detail your educational qualifications (Level, Degree, Institute, Batch, Specialization, Course Type, Description). Mark your most relevant qualification.
  - **Languages**: Specify languages known with proficiency (Read, Write, Speak).
  - **Total Experience**: Calculated or manually entered total years and months of professional experience.
  - **Compensation**: Specify current and expected annual CTC (in INR), with options for confidentiality and negotiability.
  - **Links**: Portfolio URL, LinkedIn Profile URL.
- **Resume Management**:
  - **Upload Resume**: Upload your resume (PDF, DOCX, TXT). Processing this requires confirmation.
  - **Paste Resume Text**: Alternatively, paste your resume content directly. Processing this requires confirmation.
  - **AI Resume Parsing**: Our AI attempts to parse your resume (uploaded or pasted) to pre-fill sections of your profile like summary, skills, and potentially structure experience/education.
  - _Note_: Plain text (.txt or pasted) generally yields the best parsing results.
  - **Stored Resume**: Your uploaded resume file can be stored and downloaded. Removing the resume requires confirmation.
- **Profile Visibility**: Control whether your profile is searchable by employers or kept private.
- **Downloadable PDF Profile**: Download a clean, ATS-friendly PDF version of your profile (`/profile`).
- **Profile Preview (`/profile/preview`)**: See how your profile might appear to employers.
- **Saving Profile Changes**: Requires confirmation before updates are saved.
- _Note_: If your account is 'suspended', most profile editing features will be disabled, and saving changes will be blocked.

### 2.3. Job Discovery

- **Job Search & Filtering (`/jobs`)**:
  - Browse a comprehensive list of approved job postings.
  - **Filters**:
    - Keywords (searches title, company, skills).
    - Location.
    - Role Type (Full-time, Part-time, etc.).
    - Remote option.
    - Recent Activity (e.g., posted in the last 7 days).
  - **Save Current Search**: Ability to save the current combination of search term and filters as a "Saved Search" with a custom name. (See Settings for management). Saving a search requires confirmation.
  - **View Modes**: Switch between Grid and List view for job listings.
- **Dynamic Job Detail Pages (`/jobs/[jobId]`)**:
  - View complete details for each job: description, responsibilities, qualifications, skills, salary, company info.
  - **Share Functionality**: Copy a direct link to the job posting.
- **Company Profile Pages (`/companies/[companyId]`)**:
  - View details about companies, including their open positions.

### 2.4. Application & Job Management

- **Apply for Jobs**:
  - Submit applications directly through the platform.
  - If a job has **Screening Questions** (defined by the employer), you'll answer them during the application process.
  - _Note_: Disabled if your account is 'suspended'.
- **Save Jobs**: Bookmark jobs you're interested in for later review or application.
  - _Note_: Disabled if your account is 'suspended'.
- **My Jobs Page (`/my-jobs`)**:
  - A centralized dashboard to view and manage:
    - **Saved Jobs**: Jobs you've bookmarked.
    - **Applied Jobs**: Jobs you've submitted applications for.
  - Filter jobs by status (All, Applied, Saved).

### 2.5. AI-Powered Job Matching (`/ai-match`)

- Input or review your comprehensive profile summary (editable for the session).
- The AI matches your profile (including detailed work experience, education, skills, languages, preferences like salary and location, and total experience) against all available approved job postings.
- Receive a list of relevant job IDs and a detailed reasoning for the matches.
- _Note_: Disabled if your account is 'suspended'.

### 2.6. User Settings (`/settings`)

- **Theme Customization**: Choose between Light, Dark, or System preference for the platform's appearance. Your choice is saved to your profile. (Available even if suspended).
- **Notification Preferences**: Manage how you receive alerts (e.g., new jobs matching profile, application status updates). (Disabled if suspended).
- **Manage Saved Searches**: View a list of your saved job search criteria.
  - **Apply Search**: Click a saved search to navigate to the `/jobs` page with those filters pre-applied.
  - **Delete Search**: Remove a saved search. Requires confirmation.
  - (Saving new searches is done from the `/jobs` page filter sidebar).
  - _Note_: Applying or deleting saved searches disabled if account 'suspended'.
- **Job Board Display Preferences**: Set your default view (list/grid) and items per page for job listings. (Disabled if suspended).
- **Local Search History**: View and clear your device-specific search term history (not synced across devices).

## 3. User Journey Maps (Job Seeker)

### Journey 1: Registration to Application

```mermaid
graph TD
    A[Start: Needs a Job] --> B[Visit JobBoardly]
    B --> C{Has Account?}
    C -- No --> D[Register: /auth/register]
    D --> E[Complete Basic Info]
    E --> F[Login: /auth/login]
    C -- Yes --> F
    F --> F_check_status{Account Status OK?}
    F_check_status -- Deleted --> F_deleted[Show Account Deactivated Message, Logout]
    F_check_status -- Suspended --> G_suspended[Go to Profile, Limited Actions & Alert]
    F_check_status -- Active --> G[Navigate to Profile: /profile]

    G --> H[Upload/Paste Resume & Complete Profile (Confirm resume process, confirm profile save)]
    H --> I[Set Profile Visibility]
    I --> J[Search for Jobs: /jobs]
    J --> K[Filter Jobs]
    K --> K_Save{Want to Save Search?}
    K_Save -- Yes --> K_Save_Action[Click 'Save Search', Name it, Confirm]
    K_Save_Action --> K
    K_Save -- No --> L
    L[View Job Details: /jobs/jobId]
    L --> M{Interested?}
    M -- Yes --> N[Apply for Job - Disabled if Suspended]
    N --> O[Answer Screening Questions if any]
    O --> P[Application Submitted!]
    P --> Q[View in My Jobs Applied: /my-jobs]
    M -- Save for Later --> S[Save Job - Disabled if Suspended]
    S --> T[View in My Jobs Saved: /my-jobs]
    Q --> U[Await Employer Response]
    T --> L

    G_suspended --> J
```

### Journey 2: AI Job Matching

```mermaid
graph TD
    A[Logged-in Job Seeker] --> A_check_status{Account Status OK?}
    A_check_status -- Suspended/Deleted --> A_disabled[Feature Unavailable, Show Alert]
    A_check_status -- Active --> B[Navigate to AI Job Matcher: /ai-match]
    B --> C[Review/Edit Profile Summary for Session]
    C --> D[Initiate AI Matching]
    D --> E[AI Processes Profile vs. All Jobs]
    E --> F[View Matched Job IDs & Reasoning]
    F --> G{Explore Matched Job?}
    G -- Yes --> H[Click Job -> View Details: /jobs/jobId]
    H --> I[Apply or Save Job - Disabled if Suspended]
    G -- No --> J[Refine Profile Summary or Search Manually]
```

### Journey 3: Managing Saved Searches

```mermaid
graph TD
    X[Logged-in Job Seeker] --> X_check_status{Account Status OK?}
    X_check_status -- Suspended/Deleted --> X_disabled[Feature Unavailable/Limited, Show Alert]
    X_check_status -- Active --> Y[Navigate to Settings: /settings]
    Y --> Z[View 'My Saved Searches' Section]
    Z --> AA{Select Action on a Saved Search}
    AA -- Apply --> AB[Click 'Apply' -> Redirect to /jobs with Filters]
    AA -- Delete --> AC[Click 'Delete' -> Confirmation Modal]
    AC -- Confirm --> AD[Search Deleted]
    AD --> Y
    AC -- Cancel --> Z
```

## 4. Page Routes

| Route                    | Description                                                                                               | Access Level |
| :----------------------- | :-------------------------------------------------------------------------------------------------------- | :----------- |
| `/`                      | Home page, redirects to `/jobs` if logged in as job seeker.                                               | Public       |
| `/auth/login`            | Job seeker login page. If account is 'deleted', login may fail post-auth check.                           | Public       |
| `/auth/register`         | Job seeker registration page.                                                                             | Public       |
| `/auth/change-password`  | Page to change account password. (Accessible if suspended). Requires confirmation.                        | Job Seeker   |
| `/profile`               | Manage profile. Editing restricted if account 'suspended'. Profile save requires confirmation.            | Job Seeker   |
| `/profile/preview`       | Preview profile. (Accessible if suspended).                                                               | Job Seeker   |
| `/jobs`                  | Browse, filter, and save job searches. (Saving search disabled if suspended).                             | Public       |
| `/jobs/[jobId]`          | View job details. Apply/Save actions disabled if account 'suspended'.                                     | Public       |
| `/companies`             | Browse company listings.                                                                                  | Public       |
| `/companies/[companyId]` | View company details.                                                                                     | Public       |
| `/my-jobs`               | Dashboard for saved/applied jobs. Viewing allowed if 'suspended', interactions on cards may be limited.   | Job Seeker   |
| `/ai-match`              | AI job matching tool. Disabled if account 'suspended'.                                                    | Job Seeker   |
| `/settings`              | Manage settings. Most disabled if account 'suspended', except theme. Deleting saved search needs confirm. | Job Seeker   |
| `/privacy-policy`        | Platform's privacy policy.                                                                                | Public       |
| `/terms-of-service`      | Platform's terms of service.                                                                              | Public       |

## 5. Key "API" Interactions (Data Flows with Genkit & Firebase)

Job seekers interact with AI features via Genkit flows and their profile data is stored in Firebase Firestore. Key actions like profile updates, resume processing, and managing saved searches require user confirmation.

- **Resume Parsing (`parseResumeFlow`):** (As before)
- **AI-Powered Job Matching (`aiPoweredJobMatching`):** (As before, but UI access restricted if account suspended)
- **Profile & Application Data (Firebase Firestore):**

  - **User Profile**: All details entered in `/profile` are stored in the `users` collection. Profile updates require confirmation. Editing restricted if account 'suspended'.
  - **Job Application**: An `application` document is created in the `applications` collection. Disabled if account 'suspended'.
  - **Saved Jobs/Searches**: Stored in the user's profile document (`savedJobIds` as string array, `savedSearches` as array of SavedSearch objects). Saving/unsaving jobs and saving/deleting searches disabled if account 'suspended'. Deleting saved searches requires confirmation.

- **Saving a Search:**

  - **Action**: User clicks "Save Current Search" in filter sidebar, names the search, confirms.
  - **Input Data**: Search name (string), current Filters object.
  - **Interaction**: Calls `saveSearch` in `AuthContext`.
    - Creates a `SavedSearch` object (with unique ID, name, filters, `createdAt` timestamp).
    - Updates the `users` document in Firestore by adding the new `SavedSearch` object to the `savedSearches` array (using `arrayUnion`).
  - **Effect**: Search criteria saved to user's profile.

- **Deleting a Saved Search:**
  - **Action**: User clicks "Delete" on a saved search in settings, confirms.
  - **Input Data**: `searchId` (string).
  - **Interaction**: Calls `deleteSearch` in `AuthContext`.
    - Finds the `SavedSearch` object by `searchId` in the user's local state.
    - Updates the `users` document in Firestore by removing the `SavedSearch` object from the `savedSearches` array (using `arrayRemove`).
  - **Effect**: Saved search removed from user's profile.

## 6. Future Updates (Potential Enhancements)

- **Advanced Resume Builder**: Tools to help create or improve resumes directly on the platform.
- **Skill Assessments**: Optional tests to verify skills and earn badges for their profile.
- **Interview Preparation Tools**: Resources and AI-powered mock interviews.
- **Career Path Suggestions**: AI-driven recommendations for career growth based on profile and job market trends.
- **Direct Messaging with Recruiters**: Secure communication channel (post-application or if recruiter initiates).
- **Enhanced Notifications**:
  - **Email/Push Notifications for Saved Searches**: Actively notify users when new jobs match their saved criteria.
  - More granular control over job alerts (e.g., daily/weekly digests, specific company alerts).
- **Gamification**: Points or badges for profile completion, applications, etc.
- **Networking Features**: Ability to connect with other professionals or mentors on the platform.
- **Clearer guidance for suspended users** on how to resolve their account status.

---

_This guide is intended for informational purposes for the JobBoardly team._
