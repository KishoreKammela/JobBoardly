# JobBoardly - Admin Features Guide

This document outlines the features, user flows, and technical interactions specific to the platform staff roles within JobBoardly.

## 1. Core Responsibilities

Platform staff are responsible for overseeing the platform's integrity, managing users (to varying degrees), ensuring content quality, providing user support, analyzing data, managing legal content, and maintaining system compliance and health, depending on their specific role.

## 2. Roles & Permissions Overview

JobBoardly utilizes a hierarchical admin structure with varying levels of access and responsibility:

### 2.1. Super Administrator

- **Full platform control.**
- Can manage all other admin types (SuperAdmins, Admins, Moderators, Support Agents, Data Analysts, etc.).
- Access to sensitive operations (e.g., data exports, critical system settings, AI Feature Toggles, Notification System Toggles, **Legal Content Management**).
- Can create/delete/suspend/activate any platform staff account.
- Can perform all content moderation and user (Job Seeker, Employer) management tasks.
- Manages platform-wide feature toggles.
- **Manages Privacy Policy and Terms of Service content.**

### 2.2. Administrator

- **General platform management.**
- Cannot manage (suspend/activate) Super Admins or other Admins.
- Cannot manage Legal Content.
- Can manage Moderators, Support Agents, and Data Analysts.
- Full content moderation capabilities (jobs, companies).
- Full Job Seeker management capabilities.
- May have access to some feature toggles (e.g., enabling/disabling certain AI or notification features for specific user groups, subject to SuperAdmin approval).

### 2.3. Content Moderator

- **Content-focused management.**
- Can approve/reject pending job postings and company profiles.
- Can manage the status (suspend/activate) of existing jobs (except for suspending, which is Admin+) and companies.
- Cannot manage any user accounts (Job Seekers, Platform Users) except for viewing their profiles.
- Cannot manage Legal Content.
- Primary focus on content quality and adherence to platform guidelines.
- Can view job details, including screening questions (for context during moderation).

### 2.4. Support Agent

- **User support focused.**
- Can view user profiles (Job Seekers, Employers, other Platform Staff) and application history.
- **Currently (Initial Phase):** Access to the admin dashboard is heavily restricted. Can primarily view data tables but cannot perform modification actions (e.g., suspend users, approve content, manage legal content). Can view job details, including screening questions.
- **Future Enhancements (from Roadmap):** Will have tools to reset passwords, handle basic account issues, and escalate complex issues. Will use a dedicated Support Agent Dashboard.

### 2.5. Data Analyst

- **Analytics and reporting focused.**
- **Currently (Initial Phase):** Access to the admin dashboard is heavily restricted. Can view the Platform Analytics overview and other data tables (including jobs with screening questions) but cannot perform modification actions (e.g., manage legal content).
- **Future Enhancements (from Roadmap):** Will have read-only access to most data for analysis and access to advanced analytics and reporting tools to generate custom reports. Will use a dedicated Data Analyst Dashboard.

### 2.6. Compliance Officer (Future Role - Not Implemented)

- **Legal and compliance focused.**
- **Future capabilities (from Roadmap):** Review flagged content, handle privacy requests (GDPR, data deletion), audit trail access. Cannot modify content but can flag for review. Will use a dedicated Compliance Dashboard.

### 2.7. System Monitor (Future Role - Not Implemented)

- **Technical monitoring focused.**
- **Future capabilities (from Roadmap):** Monitor system health and performance, view error logs and system metrics. Alert management for technical issues. Cannot access user data directly. Will use a dedicated System Monitoring Dashboard.

## 3. Key Features (Current Implementation for SuperAdmin, Admin, Moderator, SupportAgent, DataAnalyst)

### 3.1. Admin Dashboard

The central hub for administrative tasks, accessible after logging in via the Admin Login page (`/auth/admin/login`). The dashboard presents an overview and a tabbed interface. Permissions and visible actions vary based on the logged-in user's role. All critical actions (status changes, deletions) are protected by confirmation modals.

- **Platform Analytics Overview (Dashboard):** (Visible to SuperAdmin, Admin, Moderator, Data Analyst)

  - Total Job Seekers, Total Companies, Total Jobs, Approved Jobs, Total Applications.
  - (Support Agents do not see this overview currently).

- **Quick Moderation Cards (Dashboard Overview):** (Usable by SuperAdmin, Admin, Moderator)

  - **Pending Job Approvals**: Quickly approve (`✅`) or reject (`❌`) new job postings.
  - **Pending Company Approvals**: Quickly approve (`✅`) or reject (`❌`) new company profiles.
  - (Disabled for Support Agents, Data Analysts).

- **Companies Management Tab:** (Viewable by all admin types; Actions vary by role)

  - **View**: Table displays Company Name, Website, Status, Jobs Posted, Apps Received, Creation Date.
  - **Actions (Icon-based, with confirmation modals)**:
    - `👁️ View Company Profile` (All Admin Roles with access to this tab)
    - `✅ Approve`, `❌ Reject`, `🚫 Suspend`, `✅ Activate`, `🗑️ Delete (Soft)` (SuperAdmin, Admin, Moderator)
    - (Actions disabled for Support Agents, Data Analysts)
  - **Functionality**: Includes search, sorting, pagination.

- **All Jobs Management Tab:** (Viewable by all admin types; Actions vary by role)

  - **View**: Table shows Job Title, Company Name, Status, Applicant Count, Creation Date, Last Updated Date.
  - **Actions (Icon-based, with confirmation modals)**:
    - `👁️ View Public Job Page` (All Admin Roles with access to this tab - Admins/Moderators/etc. will see screening questions and actual status on this page).
    - `🚫 Suspend Job` (SuperAdmin, Admin only)
    - `✅ Activate Job`, `✅ Approve Job`, `❌ Reject Job` (SuperAdmin, Admin, Moderator)
    - (Actions disabled for Support Agents, Data Analysts)
  - **Functionality**: Includes search, sorting, pagination.

- **Job Seekers Management Tab:** (Viewable by SuperAdmin, Admin, Moderator, Support Agent, Data Analyst; Actions vary by role)

  - **View**: Table lists Job Seeker Name, Email, Status, Profile Searchable, Jobs Applied, Last Active, Joined Date.
  - **Actions (Icon-based, with confirmation modals)**:
    - `👁️ View Profile` (All Admin Roles with access to this tab)
    - `🚫 Suspend`, `✅ Activate`, `🗑️ Delete (Soft)` (SuperAdmin, Admin only)
    - (Actions disabled for Moderators, Support Agents, Data Analysts)
  - **Functionality**: Includes search, sorting, pagination.

- **Platform Users Management Tab:** (Viewable by SuperAdmin, Admin, Data Analyst; Actions vary by role)

  - **View**: Table displays Name, Email, Role, Status, Last Active, Joined Date.
  - **Actions (Icon-based, with confirmation modals)**:
    - `👁️ View Profile` (SuperAdmin, Admin, Moderator, Data Analyst - Moderator can view only)
    - `🚫 Suspend / ✅ Activate`:
      - SuperAdmins: Can manage other Admins, SuperAdmins, Moderators, Support Agents, Data Analysts.
      - Admins: Can manage Moderators, Support Agents, Data Analysts only.
      - Moderators, Support Agents, Data Analysts: Cannot manage any platform users (buttons disabled).
      - Users cannot suspend/activate themselves from this tab.
  - **Functionality**: Includes search, sorting, pagination.
  - (Tab hidden for Support Agents and Moderators).

- **Legal Content Management Tab:** (Visible and Editable by SuperAdmins only)

  - **View & Edit**: SuperAdmins can view and edit the content of the Privacy Policy and Terms of Service pages using a Markdown-supported textarea.
  - **Content Storage**: Legal content is stored in a dedicated Firestore collection (`legalContent`).
  - **Saving**: Requires confirmation. Changes are reflected live on public pages.
  - (Tab hidden for Admins, Moderators, Support Agents, Data Analysts).

- **AI Feature Management Tab (Conceptual Placeholder):** (Visible to SuperAdmins only)
  - A placeholder UI to indicate where future controls for enabling/disabling specific AI features (e.g., AI Career Path Advisor, Dynamic Summary Generator, AI Recruiter Assistant) will reside. Currently non-functional.
  - This section will be expanded into a comprehensive "Platform Feature Toggle Management" system.

### 3.2. Protected Admin Route & Login

- Access to the admin dashboard (`/admin`) is strictly limited to users with roles: `admin`, `superAdmin`, `moderator`, `supportAgent`, `dataAnalyst` (and future admin roles like `complianceOfficer`, `systemMonitor`).
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
    Q --> R[Click Action Icon (View, Suspend, Activate, Approve, Reject)]
    R --> R_Confirm[Confirmation Modal for Job Action]
    R_Confirm -- Yes --> R_Action[Perform Job Status Update]
    R_Action --> P
    R_Confirm -- No --> Q
    H -- Manage Job Seekers (View: SA, A, M, SuA, DA; Actions: SA, A) --> S[Navigate to 'Job Seekers' Tab]
    S --> T[Search/Sort/View Job Seekers]
    T --> U[Click Action Icon]
    U --> U_Confirm[Confirmation Modal for Job Seeker Action]
    U_Confirm -- Yes --> U_Action[Perform User Status Update]
    U_Action --> S
    U_Confirm -- No --> T
    H -- Manage Platform Users (View: SA, A, M, DA; Actions: SA, A - role-dependent) --> V[Navigate to 'Platform Users' Tab]
    V --> W[Search/Sort/View Platform Users]
    W --> X[Click Action Icon]
    X --> X_Confirm[Confirmation Modal for Platform User Action]
    X_Confirm -- Yes --> X_Action[Perform User Status Update]
    X_Action --> V
    X_Confirm -- No --> W
    H -- Manage Legal Content (SA only) --> LC[Navigate to 'Legal Content' Tab]
    LC --> LC_Edit[Edit Privacy Policy or Terms of Service]
    LC_Edit --> LC_Save_Confirm[Confirm Save Legal Doc]
    LC_Save_Confirm -- Yes --> LC_Save[Save Document to Firestore]
    LC_Save --> LC
    LC_Save_Confirm -- No --> LC_Edit
    F --> Y[Logout]
```

## 5. Page Routes

| Route                           | Description                                                                                                        | Access Level                                                                |
| :------------------------------ | :----------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------- |
| `/auth/admin/login`             | Dedicated login page for all platform staff roles.                                                                 | Public (for login)                                                          |
| `/admin`                        | Main admin dashboard. Features and actions vary significantly by role. Includes Legal Content tab for SuperAdmins. | SuperAdmin, Admin, Moderator, SupportAgent, DataAnalyst (with restrictions) |
| `/profile`                      | Platform staff can manage their own profile details (name, avatar).                                                | All Authenticated Platform Staff Roles                                      |
| `/employer/candidates/[userId]` | Used by platform staff to view profiles of any user (Job Seekers or other Platform Users) via the admin dashboard. | All Platform Staff Roles (employers are restricted to job seekers)          |
| `/jobs/[jobId]`                 | Platform staff can view job details, including non-approved jobs and screening questions.                          | All Platform Staff Roles                                                    |

## 6. Future Enhancements / Detailed Roadmap

This section outlines the comprehensive plan for evolving the JobBoardly Admin Panel, based on the enhanced requirements and future roadmaps.

### Prerequisite: Platform Feature Toggle Management System

A robust system within the Admin Panel (likely under a dedicated "System Administration" or "Feature Management" tab, primarily for SuperAdmins/Admins) to enable or disable specific platform features is a **critical prerequisite** for rolling out most new functionalities. This applies to:

- All features listed in the [AI Features Roadmap](./ai-features-roadmap.md).
- All features listed in the [Future Development Roadmap](../future-development-roadmap.md) (which incorporates the previous enhanced feature recommendations).
- All notification types and behaviors detailed in the [Notification & Email System Plan](./notification-system-plan.md).

This system must allow:

- Global toggles for major features.
- Potentially granular toggles for sub-features or specific user roles (Job Seeker, Employer).
- Backend logic for feature flags, database changes to store flag states, and checks throughout the application where features are conditionally rendered or executed.
- **This feature toggle system is a high-priority item for the next phase of development.**

### Phase 1 (High Priority - Next Steps, post current implementation)

1.  **Full Functionality for New Roles (Iterative Development):**
    - **Support Agent:** Implement tools for password resets, basic account issue handling, and an issue escalation system. Begin work on a dedicated (or heavily adapted) dashboard view for support tickets and user lookups.
    - **Data Analyst:** Develop initial read-only advanced data views/dashboards. Start work on a simple report generation tool.
2.  **Basic Audit Logging System:**
    - Start logging critical admin actions to Firestore (e.g., user status changes, job/company approvals/rejections, platform user role changes, feature toggle changes, **legal content updates**). Create a simple interface for SuperAdmins/Admins to view these logs.
3.  **Basic Bulk Operations (Content):**
    - Enhance bulk approval/rejection for pending jobs and companies in the respective admin tables if not already fully robust.
4.  **Implement the Platform Feature Toggle Management System (as described above).** This is foundational for enabling other roadmap items.
5.  **Notification Bell Functionality (Backend Triggers):** Implement backend triggers to populate the existing notification UI for admins (e.g., new content pending approval).

### Phase 2 (Medium Priority - Following successful Phase 1)

1.  **Introduce New User Roles (Full Implementation):**
    - **Compliance Officer:** Develop tools for reviewing flagged content, managing privacy requests (data access/deletion stubs), and viewing audit trails relevant to compliance.
    - **System Monitor:** Create a dashboard to display (mock or basic) system health metrics, error log summaries, and alert examples.
2.  **Advanced Content Quality Tools (Initial):**
    - Basic duplicate detection for job postings (flag potential duplicates).
    - Profile completeness indicators for job seekers and companies, visible in admin views.
3.  **Communication & Notification Management (Initial - based on [Notification Plan](./notification-system-plan.md)):**
    - Admin-to-user notification system: Allow admins to send targeted email notifications to user segments (controlled by feature toggles).
    - Basic internal admin notes on user/company/job records.
4.  **Custom Reporting System (Basic):**
    - Allow Data Analysts (and SuperAdmins) to generate pre-defined exportable reports (CSV/Excel) for key metrics.
5.  **Security Monitoring Enhancements (Initial):**
    - Display failed login attempt counts for user profiles.
    - Basic IP address logging for user actions (viewable by SuperAdmins).
6.  **Bulk User Operations (Initial):**
    - Allow selection of multiple users (job seekers first) for status changes (suspend/activate).

### Phase 3 & Beyond (Long-term - Based on provided Roadmaps & Plans)

This phase will encompass the full implementation of the features detailed in the:

- [Future Development Roadmap](../future-development-roadmap.md) (General Platform Enhancements)
- [AI Features Roadmap](./ai-features-roadmap.md) (AI-Specific Features)
- [Notification & Email System Plan](./notification-system-plan.md) (Communication Features)

All features will be controlled by the Platform Feature Toggle system. Key areas include:

1.  **Full Role-Based Dashboards:** Dedicated, streamlined UIs for each admin role.
2.  **Advanced User Management:** CSV import/export, batch notifications, user lifecycle tools, advanced filters.
3.  **Advanced Content Management:** AI job quality scoring, full duplicate detection, company verification levels, AI content flagging, user reporting, plagiarism detection.
4.  **Advanced Analytics & Reporting:** Real-time dashboards, custom report builder, scheduled reports, data visualization, predictive analytics.
5.  **Advanced Communication & Notification:** Full implementation of the Notification System Plan, including custom templates, targeted/scheduled notifications, A/B testing, internal admin chat, task assignment, knowledge base, escalation workflows.
6.  **Full Security & Compliance:** Comprehensive audit logs, data retention policies, GDPR/CCPA tools, 2FA enforcement, data breach response, IP management, session management.
7.  **Full System Administration:** System maintenance mode, email template UI, rate limiting config, integration management, database optimization tools.
8.  **Full QA & Testing Tools:** User impersonation, test data management, feature testing panel, error reproduction tools.
9.  **Advanced UI Components:** Smart filters, workflow management.

### Technical Considerations (To be addressed throughout development)

- **Database Design:** Implement tables/collections for granular permissions, comprehensive audit logs, flexible platform settings (including feature flags and legal content), and workflow task queues.
- **Security:** Adhere to the principle of least privilege, implement action confirmations, enhance session security, and encrypt sensitive admin data.
- **Performance:** Utilize lazy loading, caching, efficient pagination, and background processing for long-running tasks.

---

_This guide is intended for informational purposes for the JobBoardly team and will be updated as features evolve._
