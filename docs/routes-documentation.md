# JobBoardly - Application Routes Documentation

This document provides a comprehensive overview of all page routes within the JobBoardly application.

| Route Name/Purpose         | Path                                 | Access Level (Public/Auth/Role)  | Brief Explanation                                                                                               |
| :------------------------- | :----------------------------------- | :------------------------------- | :-------------------------------------------------------------------------------------------------------------- |
| **General & Public Pages** |                                      |                                  |                                                                                                                 |
| Home Page                  | `/`                                  | Public                           | Landing page. Redirects to role-specific dashboard if logged in.                                                |
| Job Listings               | `/jobs`                              | Public                           | Browse and filter all approved job postings. Supports query params for pre-filtering.                           |
| Job Details                | `/jobs/[jobId]`                      | Public                           | View full details of a specific job posting. Job seekers apply here.                                            |
| Company Listings           | `/companies`                         | Public                           | Browse and filter all approved company profiles.                                                                |
| Company Details            | `/companies/[companyId]`             | Public                           | View full details of a specific company, including their open positions.                                        |
| Employer Landing Page      | `/employer`                          | Public                           | Landing page specifically for employers, highlighting employer-centric features.                                |
| Privacy Policy             | `/privacy-policy`                    | Public                           | Displays the platform's privacy policy.                                                                         |
| Terms of Service           | `/terms-of-service`                  | Public                           | Displays the platform's terms of service.                                                                       |
| **Authentication Pages**   |                                      |                                  |                                                                                                                 |
| Job Seeker Login           | `/auth/login`                        | Public                           | Page for job seekers to log in.                                                                                 |
| Job Seeker Registration    | `/auth/register`                     | Public                           | Page for new job seekers to create an account.                                                                  |
| Employer Login             | `/employer/login`                    | Public                           | Page for employers/recruiters to log in.                                                                        |
| Employer Registration      | `/employer/register`                 | Public                           | Page for new employers/recruiters to create an account and register their company.                              |
| Admin Login                | `/auth/admin/login`                  | Public                           | Dedicated login page for platform administrators and super administrators.                                      |
| Change Password            | `/auth/change-password`              | Auth Required (Any Role)         | Page for any authenticated user to change their account password.                                               |
| **Job Seeker Routes**      |                                      |                                  |                                                                                                                 |
| Profile Management         | `/profile`                           | Auth Required (Job Seeker)       | Manage personal details, professional summary, resume, skills, experience, education, visibility, etc.          |
| Profile Preview            | `/profile/preview`                   | Auth Required (Job Seeker)       | Allows job seekers to see how their profile appears to potential employers.                                     |
| My Jobs (Saved/Applied)    | `/my-jobs`                           | Auth Required (Job Seeker)       | Dashboard to view and manage jobs they have saved or applied for.                                               |
| AI Job Matcher             | `/ai-match`                          | Auth Required (Job Seeker)       | AI tool to match the seeker's profile against all available jobs.                                               |
| Settings                   | `/settings`                          | Auth Required (Job Seeker)       | Manage account preferences like theme, notifications, saved searches, and job board display options.            |
| **Employer Routes**        |                                      |                                  |                                                                                                                 |
| Employer/Company Profile   | `/profile`                           | Auth Required (Employer)         | Manage personal recruiter profile. If Company Admin, also manages the company's public profile.                 |
| Post/Edit Job              | `/employer/post-job`                 | Auth Required (Employer)         | Form to create a new job posting or edit an existing one. Includes AI JD parsing and screening questions.       |
| Posted Jobs Dashboard      | `/employer/posted-jobs`              | Auth Required (Employer)         | Dashboard for employers to view and manage jobs posted by their company, including applicant counts and status. |
| View Applicants for Job    | `/employer/jobs/[jobId]/applicants`  | Auth Required (Employer)         | Page to view and manage applicants for a specific job posting.                                                  |
| Find Candidates            | `/employer/find-candidates`          | Auth Required (Employer)         | Search and filter through profiles of job seekers who have opted to be searchable.                              |
| Candidate Details          | `/employer/candidates/[candidateId]` | Auth Required (Employer)         | View the detailed profile of a specific job seeker (applicant or found via search).                             |
| AI Candidate Matcher       | `/employer/ai-candidate-match`       | Auth Required (Employer)         | AI tool for employers to find candidates matching a specific job description.                                   |
| Settings                   | `/settings`                          | Auth Required (Employer)         | Manage basic employer account preferences like theme and notifications.                                         |
| **Administrator Routes**   |                                      |                                  |                                                                                                                 |
| Admin Dashboard            | `/admin`                             | Auth Required (Admin/SuperAdmin) | Centralized dashboard for platform management (companies, jobs, users, moderation).                             |

**Notes on Dynamic Routes:**

- `[jobId]`: Represents the unique identifier for a job posting.
- `[companyId]`: Represents the unique identifier for a company profile.
- `[candidateId]`: Represents the unique identifier (UID) for a job seeker user.

This table provides a quick reference to the main navigable pages within the JobBoardly application. Access control is enforced based on user authentication status and role.
