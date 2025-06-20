# JobBoardly - Admin Features Guide

This document outlines the features, user flows, and technical interactions specific to the platform staff roles within JobBoardly.

## 1. Core Responsibilities

Platform staff are responsible for overseeing the platform's integrity, managing users (to varying degrees), ensuring content quality, providing user support, analyzing data, and maintaining system compliance and health, depending on their specific role.

## 2. Roles & Permissions Overview

JobBoardly utilizes a hierarchical admin structure with varying levels of access and responsibility:

### 2.1. Super Administrator

- **Full platform control.**
- Can manage all other admin types (SuperAdmins, Admins, Moderators, Support Agents, Data Analysts, etc.).
- Access to sensitive operations (e.g., data exports, critical system settings).
- Can create/delete/suspend/activate any platform staff account.
- Can perform all content moderation and user (Job Seeker, Employer) management tasks.

### 2.2. Administrator

- **General platform management.**
- Cannot manage (suspend/activate) Super Admins or other Admins.
- Can manage Moderators, Support Agents, and Data Analysts.
- Full content moderation capabilities (jobs, companies).
- Full Job Seeker management capabilities.

### 2.3. Content Moderator

- **Content-focused management.**
- Can approve/reject pending job postings and company profiles.
- Can manage the status (suspend/activate) of existing jobs (except for suspending, which is Admin+) and companies.
- Cannot manage any user accounts (Job Seekers, Platform Users) except for viewing their profiles.
- Primary focus on content quality and adherence to platform guidelines.

### 2.4. Support Agent (New - Foundational Implementation)

- **User support focused.**
- Can view user profiles (Job Seekers, Employers, other Platform Staff) and application history.
- **Currently (Initial Phase):** Access to the admin dashboard is heavily restricted. Can primarily view data tables but cannot perform modification actions (e.g., suspend users, approve content).
- **Future Enhancements:** Will have tools to reset passwords, handle basic account issues, and escalate complex issues.

### 2.5. Data Analyst (New - Foundational Implementation)

- **Analytics and reporting focused.**
- **Currently (Initial Phase):** Access to the admin dashboard is heavily restricted. Can view the Platform Analytics overview and other data tables but cannot perform modification actions.
- **Future Enhancements:** Will have read-only access to most data for analysis and access to advanced analytics and reporting tools to generate custom reports.

### 2.6. Compliance Officer (Future Role)

- **Legal and compliance focused.**
- Future capabilities: Review flagged content, handle privacy requests (GDPR, data deletion), audit trail access. Cannot modify content but can flag for review.

### 2.7. System Monitor (Future Role)

- **Technical monitoring focused.**
- Future capabilities: Monitor system health and performance, view error logs and system metrics. Alert management for technical issues. Cannot access user data directly.

## 3. Key Features (Current Implementation for SuperAdmin, Admin, Moderator)

### 3.1. Admin Dashboard

The central hub for administrative tasks, accessible after logging in via the Admin Login page (`/auth/admin/login`). The dashboard presents an overview and a tabbed interface. Permissions and visible actions vary based on the logged-in user's role. All critical actions (status changes, deletions) are protected by confirmation modals.

- **Platform Analytics Overview (Dashboard):** (Visible to SuperAdmin, Admin, Moderator, Data Analyst)

  - Total Job Seekers, Total Companies, Total Jobs, Approved Jobs, Total Applications.

- **Quick Moderation Cards (Dashboard Overview):** (Usable by SuperAdmin, Admin, Moderator)

  - **Pending Job Approvals**: Quickly approve (`✅`) or reject (`❌`) new job postings.
  - **Pending Company Approvals**: Quickly approve (`✅`) or reject (`❌`) new company profiles.
  - (Disabled for Support Agents, Data Analysts)

- **Companies Management Tab:** (Viewable by all admin types; Actions vary by role)

  - **View**: Table displays Company Name, Website, Status, Jobs Posted, Apps Received, Creation Date.
  - **Actions (Icon-based, with confirmation modals)**:
    - `👁️ View Company Profile` (All Admin Roles)
    - `✅ Approve`, `❌ Reject`, `🚫 Suspend`, `✅ Activate`, `🗑️ Delete (Soft)` (SuperAdmin, Admin, Moderator)
    - (Actions disabled for Support Agents, Data Analysts)
  - **Functionality**: Includes search, sorting, pagination.

- **All Jobs Management Tab:** (Viewable by all admin types; Actions vary by role)

  - **View**: Table shows Job Title, Company Name, Status, Applicant Count, Creation Date, Last Updated Date.
  - **Actions (Icon-based, with confirmation modals)**:
    - `👁️ View Public Job Page` (All Admin Roles)
    - `🚫 Suspend Job` (SuperAdmin, Admin only)
    - `✅ Activate Job`, `✅ Approve Job`, `❌ Reject Job` (SuperAdmin, Admin, Moderator)
    - (Actions disabled for Support Agents, Data Analysts)
  - **Functionality**: Includes search, sorting, pagination.

- **Job Seekers Management Tab:** (Viewable by all admin types; Actions vary by role)

  - **View**: Table lists Job Seeker Name, Email, Status, Profile Searchable, Jobs Applied, Last Active, Joined Date.
  - **Actions (Icon-based, with confirmation modals)**:
    - `👁️ View Profile` (All Admin Roles)
    - `🚫 Suspend`, `✅ Activate`, `🗑️ Delete (Soft)` (SuperAdmin, Admin only)
    - (Actions disabled for Moderators, Support Agents, Data Analysts)
  - **Functionality**: Includes search, sorting, pagination.

- **Platform Users Management Tab:** (Viewable by SuperAdmin, Admin, Data Analyst; Actions vary by role)
  - **View**: Table displays Name, Email, Role, Status, Last Active, Joined Date.
  - **Actions (Icon-based, with confirmation modals)**:
    - `👁️ View Profile` (SuperAdmin, Admin, Moderator, Data Analyst)
    - `🚫 Suspend / ✅ Activate`:
      - SuperAdmins: Can manage other Admins, SuperAdmins, Moderators, Support Agents, Data Analysts.
      - Admins: Can manage Moderators, Support Agents, Data Analysts only.
      - Moderators, Support Agents, Data Analysts: Cannot manage any platform users (buttons disabled).
      - Users cannot suspend/activate themselves from this tab.
  - **Functionality**: Includes search, sorting, pagination.
  - (Tab hidden for Support Agents and Moderators)

### 3.2. Protected Admin Route & Login

- Access to the admin dashboard (`/admin`) is strictly limited to users with roles: `admin`, `superAdmin`, `moderator`, `supportAgent`, `dataAnalyst` (and future admin roles).
- A dedicated admin login page is available at `/auth/admin/login` for all platform staff.

## 4. User Journey Map (Admin/Moderator Example)

```mermaid
graph TD
    A[Start: Platform Staff Needs to Manage Platform] --> B{Authenticated?}
    B -- No --> C[Navigate to /auth/admin/login]
    C --> D[Enter Credentials]
    D --> E{Login Successful & Role is Admin-like?}
    E -- Yes --> F[Redirect to /admin Dashboard]
    B -- Yes --> F
    E -- No --> G[Error/Redirect to General Login]
    F --> FA[View Platform Analytics Overview (SA, A, M, DA)]
    FA --> H{Select Task based on Role}
    H -- Moderate Pending Jobs (SA, A, M) --> I[Use Quick Moderation Card for Jobs]
    I --> J_Confirm[Confirm Action: Approve/Reject Job]
    J_Confirm -- Yes --> J_Action[Perform Job Status Update]
    J_Action --> F
    J_Confirm -- No --> I
    H -- Moderate Pending Companies (SA, A, M) --> K[Use Quick Moderation Card for Companies]
    K --> L_Confirm[Confirm Action: Approve/Reject Company]
    L_Confirm -- Yes --> L_Action[Perform Company Status Update]
    L_Action --> F
    L_Confirm -- No --> K
    H -- Manage Companies (View: All; Actions: SA, A, M) --> M[Navigate to 'Companies' Tab]
    M --> N[Search/Sort/View Companies]
    N --> O[Click Action Icon]
    O --> O_Confirm[Confirmation Modal for Company Action]
    O_Confirm -- Yes --> O_Action[Perform Company Status Update]
    O_Action --> M
    O_Confirm -- No --> N
    H -- Manage Jobs (View: All; Actions: SA, A, M - M limited) --> P[Navigate to 'All Jobs' Tab]
    P --> Q[Search/Sort/View Jobs]
    Q --> R[Click Action Icon]
    R --> R_Confirm[Confirmation Modal for Job Action]
    R_Confirm -- Yes --> R_Action[Perform Job Status Update]
    R_Action --> P
    R_Confirm -- No --> Q
    H -- Manage Job Seekers (View: All; Actions: SA, A) --> S[Navigate to 'Job Seekers' Tab]
    S --> T[Search/Sort/View Job Seekers]
    T --> U[Click Action Icon]
    U --> U_Confirm[Confirmation Modal for Job Seeker Action]
    U_Confirm -- Yes --> U_Action[Perform User Status Update]
    U_Action --> S
    U_Confirm -- No --> T
    H -- Manage Platform Users (View: SA, A, DA; Actions: SA, A - role-dependent) --> V[Navigate to 'Platform Users' Tab]
    V --> W[Search/Sort/View Platform Users]
    W --> X[Click Action Icon]
    X --> X_Confirm[Confirmation Modal for Platform User Action]
    X_Confirm -- Yes --> X_Action[Perform User Status Update]
    X_Action --> V
    X_Confirm -- No --> W
    F --> Y[Logout]
```

## 5. Page Routes

| Route                           | Description                                                                                                        | Access Level                                                                |
| :------------------------------ | :----------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------- |
| `/auth/admin/login`             | Dedicated login page for all platform staff roles.                                                                 | Public (for login)                                                          |
| `/admin`                        | Main admin dashboard. Features and actions vary significantly by role.                                             | SuperAdmin, Admin, Moderator, SupportAgent, DataAnalyst (with restrictions) |
| `/profile`                      | Platform staff can manage their own profile details (name, avatar).                                                | All Authenticated Platform Staff Roles                                      |
| `/employer/candidates/[userId]` | Used by platform staff to view profiles of any user (Job Seekers or other Platform Users) via the admin dashboard. | All Platform Staff Roles (employers are restricted to job seekers)          |

## 6. Key "API" Interactions (Data Flows)

Platform Staff interact primarily with the Firebase Firestore database. Permissions are enforced in the UI and backend functions (if any future Cloud Functions are added for complex operations).

- **Fetching Data**: Queries Firestore with filters based on roles.
- **Updating Status**: Updates Firestore documents. `handleUserStatusUpdate` now has stricter role-based checks.

## 7. Future Enhancements / Detailed Roadmap

This section outlines the comprehensive plan for evolving the JobBoardly Admin Panel, based on the enhanced requirements provided.

### 7.1. Phase 1 (High Priority - Immediate Next Steps after foundational role setup)

1.  **Enhanced User Types (Full Implementation):**
    - **Support Agent:** Implement tools for password resets, basic account issue handling, and an issue escalation system. Create a dedicated (or heavily adapted) dashboard view for support tickets and user lookups.
    - **Data Analyst:** Develop initial read-only advanced data views/dashboards if different from the main admin overview. Begin work on a simple report generation tool.
2.  **Bulk Operations (Initial):**
    - Implement basic bulk approval/rejection for pending jobs and companies in the respective admin tables.
    - Allow selection of multiple users (job seekers first) for status changes (suspend/activate).
3.  **Advanced Analytics Dashboard (Initial):**
    - Expand the current "Platform Analytics Overview" with more detailed metrics (e.g., user engagement trends, application success rate summaries).
4.  **Audit Logging System (Basic):**
    - Start logging critical admin actions to Firestore (e.g., user status changes, job/company approvals/rejections, platform user role changes). Create a simple interface for SuperAdmins to view these logs.

### 7.2. Phase 2 (Medium Priority)

1.  **Introduce New User Roles (Full Implementation):**
    - **Compliance Officer:** Develop tools for reviewing flagged content, managing privacy requests (data access/deletion stubs), and viewing audit trails relevant to compliance.
    - **System Monitor:** Create a dashboard to display (mock or basic) system health metrics, error log summaries (if available/integrated), and alert examples.
2.  **Advanced Content Quality Tools:**
    - Basic duplicate detection for job postings (flag potential duplicates based on title/company/description similarity).
    - Profile completeness indicators for job seekers and companies, visible in admin views.
3.  **Communication & Notification Management:**
    - Admin-to-user notification system: Allow admins to send targeted email notifications to user segments (e.g., all job seekers in a specific location, all employers with pending jobs).
    - Basic internal admin notes on user/company/job records.
4.  **Custom Reporting System (Basic):**
    - Allow Data Analysts (and SuperAdmins) to generate pre-defined exportable reports (CSV/Excel) for key metrics like user registration numbers, job posting volumes, application counts by period.
5.  **Security Monitoring Enhancements:**
    - Display failed login attempt counts for user profiles in the admin panel.
    - Basic IP address logging for user actions (viewable by SuperAdmins).

### 7.3. Phase 3 (Long-term) & Beyond

1.  **Full Role-Based Dashboards:** Implement dedicated, streamlined dashboard UIs for each admin role (Content Moderator, Support Agent, Data Analyst, Compliance Officer, System Monitor) as outlined in the "Enhanced Admin Dashboard Structure" requirement.
2.  **Predictive Analytics:**
    - User churn prediction models.
    - Job success prediction models.
    - Market trend analysis tools.
3.  **Advanced Compliance & Security Tools:**
    - Full GDPR/CCPA request handling workflows.
    - Two-factor authentication enforcement for admin accounts.
    - Advanced session management.
    - Data breach response toolkit (procedures, communication tools).
4.  **System Administration & Configuration:**
    - Feature flags management UI.
    - System maintenance mode controls.
    - Email template management UI.
    - Rate limiting configuration.
5.  **AI-Powered Moderation & Quality Control:**
    - Automated content flagging for inappropriate content.
    - Plagiarism detection for job descriptions.
    - AI-powered job/profile quality scoring.
6.  **User Lifecycle Management (Full):**
    - Company verification system (levels, document uploads).
    - User onboarding tracking.
    - Inactive user management workflows.
7.  **Internal Communication Tools (Full):**
    - Admin chat system, task assignment, escalation workflows, internal knowledge base.
8.  **Testing & Debugging Tools:**
    - User impersonation for support.
    - Test data management tools.
9.  **Database & Performance Optimization Tools.**

### 7.4. Advanced User Management (Roadmap)

- **Bulk Operations**: CSV import/export, batch notifications, bulk profile updates.
- **User Lifecycle Management**: Account verification (manual for premium), onboarding tracking, inactive user management, account recovery assistance.
- **Advanced User Filters**: Registration date ranges, last activity, application activity, profile completion %, geographic distribution, account status history.

### 7.5. Advanced Content Management (Roadmap)

- **Job Management**: Salary range validation, job performance analytics, job template management.
- **Company Verification**: Verification levels, document verification, website/domain verification, social media verification, compliance tracking.
- **Content Moderation**: User reporting system, content categorization.

### 7.6. Technical Considerations (To be addressed throughout development)

- **Database Design**: Implement tables for granular permissions, comprehensive audit logs, flexible platform settings, and workflow task queues.
- **Security**: Adhere to the principle of least privilege, implement action confirmations, enhance session security, and encrypt sensitive admin data.
- **Performance**: Utilize lazy loading, caching, efficient pagination, and background processing for long-running tasks.

---

_This guide is intended for informational purposes for the JobBoardly team and will be updated as features evolve._
