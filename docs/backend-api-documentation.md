# JobBoardly - Backend API Documentation

This document outlines the API specification for a future Node.js/Express backend for the JobBoardly application. It translates the current client-side Firebase and Genkit interactions into a formal set of RESTful API endpoints, providing a blueprint for the backend team.

## Table of Contents

1.  [General Principles](#1-general-principles)
2.  [Authentication Endpoints (`/auth`)](#2-authentication-endpoints-auth)
3.  [User & Profile Endpoints (`/users`)](#3-user--profile-endpoints-users)
4.  [Company Endpoints (`/companies`)](#4-company-endpoints-companies)
5.  [Job Endpoints (`/jobs`)](#5-job-endpoints-jobs)
6.  [Application Endpoints (`/applications`)](#6-application-endpoints-applications)
7.  [Notification Endpoints (`/notifications`)](#7-notification-endpoints-notifications)
8.  [AI Service Endpoints (`/ai`)](#8-ai-service-endpoints-ai)
9.  [Legal Content Endpoints (`/legal`)](#9-legal-content-endpoints-legal)
10. [Admin Endpoints (`/admin`)](#10-admin-endpoints-admin)
11. [Appendix: Data Models](#11-appendix-data-models)

---

## 1. General Principles

### 1.1. Authentication

- The API will be stateless and use JSON Web Tokens (JWT) for authentication.
- The `Login` and `Register` endpoints will return a JWT.
- This token must be sent in the `Authorization` header for all protected routes (e.g., `Authorization: Bearer <your_jwt>`).
- The JWT payload should contain `uid`, `role`, and `companyId` (if applicable) for server-side authorization checks.

### 1.2. Responses

- **Success**: Responses will use standard HTTP status codes (e.g., `200 OK`, `201 Created`, `204 No Content`).
- **Error**: Errors will also use standard HTTP status codes (e.g., `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, `500 Internal Server Error`) and include a JSON body with a descriptive error message:
  ```json
  {
    "error": "Descriptive error message here."
  }
  ```

### 1.3. Authorization Roles

- **public**: No authentication required.
- **authenticated**: Any logged-in user.
- **jobSeeker**: User with `role: 'jobSeeker'`.
- **employer**: User with `role: 'employer'`. `isCompanyAdmin` flag may be required for certain actions.
- **admin**: User with `role: 'admin'`.
- **superAdmin**: User with `role: 'superAdmin'`. Has the highest level of privileges.
- **platformStaff**: Includes `admin`, `superAdmin`, `moderator`, `supportAgent`, `dataAnalyst`.

---

## 2. Authentication Endpoints (`/auth`)

### `POST /auth/register`

- **Description**: Registers a new user (job seeker or employer). For employers registering a new company, a corresponding company document is created.
- **Authorization**: `public`.
- **Request Body**:
  | Field | Type | Rules | Description |
  |---|---|---|---|
  | `email` | `string` | `required`, `email format` | The user's email. |
  | `password`| `string` | `required`, `min:8`, strong password rules | The user's password. |
  | `name` | `string` | `required` | The user's full name. |
  | `role` | `string` | `required`, one of: `jobSeeker`, `employer` | Role to register as. |
  | `companyName`| `string`| `optional`, `required` if `role` is `employer` | Company name. A new company profile is created with `pending` status. |
- **Success Response** (`201 Created`):
  ```json
  {
    "token": "jwt_string",
    "user": { ...UserProfile } // The created UserProfile object
  }
  ```

### `POST /auth/login`

- **Description**: Authenticates a user and returns a JWT. Handles login for all user types.
- **Authorization**: `public`.
- **Request Body**:
  | Field | Type | Rules | Description |
  |---|---|---|---|
  | `email` | `string` | `required`, `email format` | The user's email. |
  | `password`| `string` | `required` | The user's password. |
- **Success Response** (`200 OK`):
  ```json
  {
    "token": "jwt_string",
    "user": { ...UserProfile },
    "company": { ...Company } // optional, included if user is an employer
  }
  ```
- **Error Response** (`401 Unauthorized`): For invalid credentials. `403 Forbidden` if user account is `suspended` or `deleted`.

### `POST /auth/change-password`

- **Description**: Allows an authenticated user to change their password.
- **Authorization**: `authenticated`.
- **Request Body**:
  | Field | Type | Rules | Description |
  |---|---|---|---|
  | `currentPassword` | `string` | `required` | The user's current password for re-authentication. |
  | `newPassword`| `string` | `required`, `min:8`, strong password rules | The user's new password. |
- **Success Response**: `204 No Content`.

---

## 3. User & Profile Endpoints (`/users`)

### `GET /users/me`

- **Description**: Fetches the profile of the currently authenticated user.
- **Authorization**: `authenticated`.
- **Success Response** (`200 OK`):
  ```json
  {
    "user": { ...UserProfile },
    "company": { ...Company } // optional, if employer
  }
  ```

### `PUT /users/me`

- **Description**: Updates the profile of the currently authenticated user.
- **Authorization**: `authenticated`.
- **Request Body**: A subset of fields from the `UserProfile` data model. The backend should validate which fields are updatable by the user.
- **Success Response** (`200 OK`):
  ```json
  {
    "user": { ...UserProfile } // The updated UserProfile object
  }
  ```

### `GET /candidates`

- **Description**: Fetches a list of public, searchable job seeker profiles. For employers.
- **Authorization**: `employer`.
- **Query Parameters**:
  - `q`: `string` (for keyword/boolean search)
  - `loc`: `string` (location)
  - `notice`: `string` (notice period)
  - `status`: `string` (job search status)
  - `minSal`, `maxSal`: `number` (expected salary range)
  - `activity`: `string` ('24h', '7d', '30d')
  - `minExp`: `number` (min years of experience)
  - `page`: `number` (for pagination)
  - `limit`: `number` (for pagination)
- **Success Response** (`200 OK`):
  ```json
  {
    "data": [{ ...UserProfile }],
    "pagination": { "currentPage": 1, "totalPages": 10, "totalItems": 100 }
  }
  ```

### `GET /candidates/{userId}`

- **Description**: Fetches a single user profile. Can be used by employers to view a job seeker or by admins to view any user.
- **Authorization**: `employer` (can only view `jobSeeker` roles), `platformStaff` (can view any user).
- **Success Response** (`200 OK`):
  ```json
  {
    "user": { ...UserProfile }
  }
  ```

---

## 4. Company Endpoints (`/companies`)

### `GET /companies`

- **Description**: Fetches a paginated list of all `approved` company profiles.
- **Authorization**: `public`.
- **Query Parameters**: `q` (search by name/description), `page`, `limit`.
- **Success Response** (`200 OK`):
  ```json
  {
    "data": [{ ...Company }],
    "pagination": { "currentPage": 1, "totalPages": 5, "totalItems": 50 }
  }
  ```

### `GET /companies/{companyId}`

- **Description**: Fetches a single `approved` company profile and its `approved` jobs.
- **Authorization**: `public` (for approved companies), `platformStaff` / `owning employer` (for any status).
- **Success Response** (`200 OK`):
  ```json
  {
    "company": { ...Company },
    "recruiters": [{ ...UserProfile }],
    "jobs": [{ ...Job }]
  }
  ```

### `PUT /companies/{companyId}`

- **Description**: Allows a company admin to update their own company's profile.
- **Authorization**: `employer` with `isCompanyAdmin: true` and matching `companyId`.
- **Request Body**: A subset of updatable `Company` fields (e.g., `description`, `websiteUrl`, `logoUrl`, `bannerImageUrl`).
- **Success Response** (`200 OK`):
  ```json
  {
    "company": { ...Company } // Updated company object
  }
  ```

---

## 5. Job Endpoints (`/jobs`)

### `GET /jobs`

- **Description**: Fetches a paginated list of all `approved` jobs.
- **Authorization**: `public`.
- **Query Parameters**: All filters from the `Filters` type in `src/types/index.ts` (e.g., `q`, `loc`, `type`, `remote`, `industry`, `expLevel`, `minSal`, `maxSal`, `minExp`, `page`, `limit`).
- **Success Response** (`200 OK`):
  ```json
  {
    "data": [{ ...Job }],
    "pagination": { "currentPage": 1, "totalPages": 20, "totalItems": 200 }
  }
  ```

### `GET /jobs/{jobId}`

- **Description**: Fetches a single job's details.
- **Authorization**: `public` (for approved jobs), `platformStaff` / `owning employer` (for any status).
- **Success Response** (`200 OK`):
  ```json
  {
    "job": { ...Job },
    "company": { ...Company } // Associated company details
  }
  ```

### `POST /jobs`

- **Description**: Creates a new job posting. The job is created with `pending` status.
- **Authorization**: `employer`.
- **Request Body**: All fields from the job posting form (subset of `Job` type).
- **Success Response** (`201 Created`):
  ```json
  { ...Job } // The created job object
  ```

### `PUT /jobs/{jobId}`

- **Description**: Updates an existing job posting. Resubmits the job for approval by setting status to `pending`.
- **Authorization**: `employer` who owns the job.
- **Request Body**: All fields from the job posting form.
- **Success Response** (`200 OK`):
  ```json
  { ...Job } // The updated job object
  ```

---

## 6. Application Endpoints (`/applications`)

### `GET /applications/my`

- **Description**: Fetches all applications submitted by the currently logged-in job seeker.
- **Authorization**: `jobSeeker`.
- **Success Response** (`200 OK`):
  ```json
  {
    "data": [{ ...Application }]
  }
  ```

### `POST /applications`

- **Description**: Submits a new job application.
- **Authorization**: `jobSeeker`.
- **Request Body**:
  | Field | Type | Rules | Description |
  |---|---|---|---|
  | `jobId` | `string` | `required` | The ID of the job to apply for. |
  | `answers`| `ApplicationAnswer[]` | `optional` | Array of answers to screening questions. |
- **Success Response** (`201 Created`):
  ```json
  { ...Application } // The created application object
  ```

### `PATCH /applications/{applicationId}`

- **Description**: Updates an application's status or notes.
- **Authorization**: `jobSeeker` (can only update status to `Withdrawn by Applicant`), `employer` (can update to other statuses and add `employerNotes`).
- **Request Body**:
  | Field | Type | Rules | Description |
  |---|---|---|---|
  | `status` | `string` | `required` | The new `ApplicationStatus`. |
  | `employerNotes`| `string` | `optional` (for employers) | Internal notes about the applicant. |
- **Success Response** (`200 OK`):
  ```json
  { ...Application } // The updated application object
  ```

---

## 7. Notification Endpoints (`/notifications`)

### `GET /notifications`

- **Description**: Fetches the authenticated user's recent notifications.
- **Authorization**: `authenticated`.
- **Success Response** (`200 OK`):
  ```json
  {
    "data": [{ ...Notification }],
    "unreadCount": 5
  }
  ```

### `POST /notifications/mark-read`

- **Description**: Marks one or all notifications as read.
- **Authorization**: `authenticated`.
- **Request Body**:
  | Field | Type | Rules | Description |
  |---|---|---|---|
  | `notificationId` | `string` | `optional` | ID of a single notification to mark as read. |
  | `all`| `boolean` | `optional` | If `true`, marks all notifications as read. |
- **Success Response**: `204 No Content`.

---

## 8. AI Service Endpoints (`/ai`)

These endpoints encapsulate the Genkit flows.

### `POST /ai/parse-resume`

- **Description**: Parses a resume file and extracts structured data.
- **Authorization**: `jobSeeker`.
- **Request Body**:
  | Field | Type | Rules | Description |
  |---|---|---|---|
  | `resumeDataUri` | `string` | `required`, `data URI format` | The resume file as a data URI. |
- **Success Response** (`200 OK`):
  ```json
  { ...ParseResumeOutput } // See src/types/index.ts for schema
  ```

### `POST /ai/parse-job-description`

- **Description**: Parses a job description document and extracts structured data.
- **Authorization**: `employer`.
- **Request Body**:
  | Field | Type | Rules | Description |
  |---|---|---|---|
  | `jobDescriptionDataUri` | `string` | `required`, `data URI format` | The JD file as a data URI. |
- **Success Response** (`200 OK`):
  ```json
  { ...ParsedJobData } // See src/types/index.ts for schema
  ```

### `POST /ai/generate-summary`

- **Description**: Generates a professional summary based on a job seeker's profile.
- **Authorization**: `jobSeeker`.
- **Request Body**:
  | Field | Type | Rules | Description |
  |---|---|---|---|
  | `jobSeekerProfileData` | `string` | `required` | A stringified version of the user's profile. |
  | `targetRoleOrCompany` | `string` | `optional` | Target to tailor the summary for. |
- **Success Response** (`200 OK`):
  ```json
  { "generatedSummary": "string" }
  ```

### `POST /ai/match-jobs`

- **Description**: Matches a job seeker's profile against all available jobs.
- **Authorization**: `jobSeeker`.
- **Request Body**: `{ "jobSeekerProfile": "string" }` (A detailed, stringified version of the user's profile).
- **Success Response** (`200 OK`):
  ```json
  {
    "relevantJobIDs": ["string"],
    "reasoning": "string"
  }
  ```

### `POST /ai/match-candidates`

- **Description**: Matches a job description against all searchable candidates.
- **Authorization**: `employer`.
- **Request Body**: `{ "jobDescription": "string" }` (A detailed, stringified job description).
- **Success Response** (`200 OK`):
  ```json
  {
    "relevantCandidateIDs": ["string"],
    "reasoning": "string"
  }
  ```

---

## 9. Legal Content Endpoints (`/legal`)

### `GET /legal/{documentName}`

- **Description**: Fetches the content for a legal document.
- **Authorization**: `public`.
- **URL Parameters**:
  - `documentName`: `string`, one of `privacyPolicy`, `termsOfService`.
- **Success Response** (`200 OK`):
  ```json
  { ...LegalDocument }
  ```

---

## 10. Admin Endpoints (`/admin`)

### `GET /admin/stats`

- **Description**: Fetches platform-wide statistics.
- **Authorization**: `platformStaff` (with potential restrictions based on role).
- **Success Response** (`200 OK`):
  ```json
  {
    "totalJobSeekers": 1000,
    "totalCompanies": 50,
    "totalJobs": 200,
    "approvedJobs": 150,
    "totalApplications": 5000
  }
  ```

### `GET /admin/{resource}`

- **Description**: Fetches lists of all users, companies, or jobs for admin management.
- **Authorization**: `platformStaff`.
- **URL Parameters**: `resource` is one of `users`, `companies`, `jobs`.
- **Query Parameters**: For filtering, sorting, pagination.
- **Success Response** (`200 OK`): Paginated list of the requested resource.

### `PUT /admin/{resource}/{id}/status`

- **Description**: Updates the status of a user, company, or job.
- **Authorization**: `platformStaff` (permissions vary by role, e.g., moderators can't suspend).
- **URL Parameters**: `resource` (users/companies/jobs), `id`.
- **Request Body**:
  | Field | Type | Rules | Description |
  |---|---|---|---|
  | `status` | `string` | `required` | The new status (e.g., `approved`, `suspended`). |
  | `reason` | `string` | `optional` | A reason for the status change. |
- **Success Response** (`200 OK`): The updated resource object.

### `PUT /admin/legal/{documentName}`

- **Description**: Updates the content of a legal document.
- **Authorization**: `superAdmin`.
- **URL Parameters**: `documentName` (privacyPolicy/termsOfService).
- **Request Body**: `{ "content": "markdown_string" }`.
- **Success Response** (`200 OK`):
  ```json
  { ...LegalDocument } // The updated legal document
  ```

---

## 11. Appendix: Data Models

_This section contains the core data structures from `src/types/index.ts` for reference._

```typescript
// --- Data Models from src/types/index.ts ---

export type UserRole =
  | 'jobSeeker'
  | 'employer'
  | 'admin'
  | 'superAdmin'
  | 'moderator'
  | 'supportAgent'
  | 'dataAnalyst'
  | 'complianceOfficer'
  | 'systemMonitor';

export type ScreeningQuestionType =
  | 'text'
  | 'yesNo'
  | 'multipleChoice'
  | 'checkboxGroup';

export interface ScreeningQuestion {
  id: string;
  questionText: string;
  type: ScreeningQuestionType;
  options?: string[];
  isRequired: boolean;
}

export interface ApplicationAnswer {
  questionId: string;
  questionText: string;
  answer: string | boolean | string[];
}

export type NoticePeriod =
  | 'Immediately Available'
  | '1 Month'
  | '2 Months'
  | '3 Months'
  | '4 Months'
  | '5 Months'
  | '6 Months'
  | 'More than 6 Months'
  | 'Flexible';

export interface LanguageEntry {
  id: string;
  languageName: string;
  proficiency: 'Beginner' | 'Intermediate' | 'Advanced' | 'Native';
  canRead: boolean;
  canWrite: boolean;
  canSpeak: boolean;
}

export interface ExperienceEntry {
  id: string;
  companyName: string;
  jobRole: string;
  startDate?: string;
  endDate?: string;
  currentlyWorking: boolean;
  description?: string;
  annualCTC?: number;
}

export interface EducationEntry {
  id: string;
  level:
    | 'Post Graduate'
    | 'Graduate'
    | 'Schooling (XII)'
    | 'Schooling (X)'
    | 'Certification / Other';
  degreeName: string;
  instituteName: string;
  startYear?: number;
  endYear?: number;
  specialization?: string;
  courseType?: 'Full Time' | 'Part Time' | 'Distance Learning';
  isMostRelevant?: boolean;
  description?: string;
}

export interface Company {
  id: string;
  name: string;
  description?: string;
  websiteUrl?: string;
  logoUrl?: string;
  bannerImageUrl?: string;
  adminUids: string[];
  recruiterUids: string[];
  createdAt: unknown; // Firestore Timestamp
  updatedAt: unknown; // Firestore Timestamp
  status:
    | 'pending'
    | 'approved'
    | 'rejected'
    | 'suspended'
    | 'deleted'
    | 'active';
  moderationReason?: string;
}

export type JobExperienceLevel =
  | 'Entry-Level'
  | 'Mid-Level'
  | 'Senior-Level'
  | 'Lead'
  | 'Manager'
  | 'Executive';

export interface Job {
  id: string;
  title: string;
  company: string;
  companyId: string;
  location: string;
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Internship';
  responsibilities?: string;
  requirements?: string;
  postedDate: unknown; // Firestore Timestamp or string
  isRemote: boolean;
  skills: string[];
  salaryMin?: number;
  salaryMax?: number;
  companyLogoUrl?: string;
  postedById: string;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  moderationReason?: string;
  createdAt?: unknown; // Firestore Timestamp
  updatedAt?: unknown; // Firestore Timestamp
  screeningQuestions?: ScreeningQuestion[];
  payTransparency?: boolean;
  benefits?: string;
  industry: string;
  department: string;
  roleDesignation?: string;
  experienceLevel: JobExperienceLevel;
  minExperienceYears?: number;
  maxExperienceYears?: number;
  educationQualification?: string;
  applicationDeadline?: unknown; // Firestore Timestamp or string
}

export type ApplicationStatus =
  | 'Applied'
  | 'Reviewed'
  | 'Interviewing'
  | 'Offer Made'
  | 'Hired'
  | 'Rejected By Company'
  | 'Withdrawn by Applicant';

export interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  applicantId: string;
  applicantName: string;
  applicantAvatarUrl?: string;
  applicantHeadline?: string;
  companyId: string;
  postedById: string;
  status: ApplicationStatus;
  appliedAt: unknown; // Firestore Timestamp
  updatedAt: unknown; // Firestore Timestamp
  employerNotes?: string;
  answers?: ApplicationAnswer[];
}

export type NotificationType =
  | 'NEW_APPLICATION'
  | 'APPLICATION_STATUS_UPDATE'
  | 'JOB_APPROVED'
  | 'JOB_REJECTED'
  | 'COMPANY_APPROVED'
  | 'COMPANY_REJECTED'
  | 'ADMIN_CONTENT_PENDING'
  | 'GENERIC_INFO';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  link?: string;
  isRead: boolean;
  createdAt: unknown; // Firestore Timestamp
}

export interface UserProfile {
  uid: string;
  role: UserRole;
  email: string | null;
  name: string;
  avatarUrl?: string;
  createdAt?: unknown; // Firestore Timestamp
  updatedAt?: unknown; // Firestore Timestamp
  status?: 'active' | 'suspended' | 'deleted';
  theme?: 'light' | 'dark' | 'system';
  jobBoardDisplay?: 'list' | 'grid';
  itemsPerPage?: 10 | 20 | 50;
  jobAlerts?: {
    newJobsMatchingProfile: boolean;
    savedSearchAlerts: boolean;
    applicationStatusUpdates: boolean;
  };

  headline?: string;
  skills?: string[];
  parsedResumeText?: string;

  gender?: 'Male' | 'Female' | 'Other' | 'Prefer not to say';
  dateOfBirth?: string;
  currentCTCValue?: number;
  currentCTCConfidential?: boolean;
  expectedCTCValue?: number;
  expectedCTCNegotiable?: boolean;
  homeState?: string;
  homeCity?: string;
  totalYearsExperience?: number;
  totalMonthsExperience?: number;

  experiences?: ExperienceEntry[];
  educations?: EducationEntry[];
  languages?: LanguageEntry[];

  mobileNumber?: string;
  noticePeriod?: NoticePeriod;
  portfolioUrl?: string;
  linkedinUrl?: string;
  preferredLocations?: string[];
  jobSearchStatus?: 'activelyLooking' | 'openToOpportunities' | 'notLooking';
  isProfileSearchable?: boolean;
  resumeUrl?: string;
  resumeFileName?: string;

  savedJobIds?: string[];
  savedSearches?: unknown[]; // SavedSearch[]
  companyId?: string;
  isCompanyAdmin?: boolean;
  savedCandidateSearches?: unknown[]; // SavedCandidateSearch[]
}

export interface LegalDocument {
  id: string;
  content: string;
  lastUpdated: unknown; // Firestore Timestamp
}
```
