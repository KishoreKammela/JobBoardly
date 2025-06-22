# JobBoardly - Development Strategy & Architecture

This document outlines the core architectural principles and development strategies for the JobBoardly platform. It serves as a benchmark for all new feature development, component creation, and service integration.

## 1. Core Architectural Principle: Separation of Concerns

The primary architectural goal is to decouple different parts of the application to improve maintainability, scalability, and testability. We achieve this through a dedicated **Services Layer**.

### 1.1. The Services Layer (`src/services/`)

- **Purpose:** This directory abstracts all direct data-fetching and mutation logic (specifically Firebase Firestore interactions) away from the UI components and React Contexts.
- **Structure:** Each file in this directory corresponds to a specific data model or resource (e.g., `user.services.ts`, `job.services.ts`, `company.services.ts`).
- **Rules for New Development:**
  - **NO** direct Firebase (`db`) calls should be made from within a component (`.tsx`), page (`page.tsx`), or context provider.
  - **ALL** interactions with the database (reads, writes, updates) **MUST** be encapsulated in a function within the appropriate service file in `src/services/`.
  - Service functions should be pure data functions: they take arguments, interact with the database, and return data or a promise. They should not contain component-level state logic.

### 1.2. React Contexts (`src/contexts/`)

- **Purpose:** Contexts are used to manage and provide global or section-specific state derived from the services layer.
- **Example Flow:**
  1. The `UserProfileContext` calls a function from `user.services.ts` to fetch the current user's profile.
  2. It stores this profile data in its state.
  3. It provides the profile data and an `updateUserProfile` function to its children.
  4. When a component calls `updateUserProfile`, the context's function then calls the corresponding update function in `user.services.ts`.

## 2. Component & Page Co-location Strategy

To keep component and page files clean, readable, and focused, we use a co-location strategy for complex UI elements.

- **Directory Structure:** If a page (`/app/admin/page.tsx`) or a component (`/components/my-jobs-display/`) becomes complex, it should be housed in its own directory.
- **Private `_lib` Folder:** Inside the component/page directory, create a private `_lib` folder. Next.js treats folders starting with an underscore as private, so they do not affect URL routing.
- **File Breakdown within `_lib`:**
  - `_lib/actions.ts`: Contains business logic, event handlers, and functions that perform specific actions for the component (e.g., `handleWithdrawApplication`). These functions often call the Services layer.
  - `_lib/utils.ts`: Holds pure helper and utility functions specific to the component (e.g., `getRoleDisplayName`).
  - `_lib/constants.ts`: Stores constants used only by that component (e.g., `ITEMS_PER_PAGE`).
  - `_lib/interfaces.ts`: Defines TypeScript interfaces and types relevant only to that component.
- **Benefit:** This keeps the main component file (`index.tsx` or `page.tsx`) lean and focused on state management (using `useState`, `useEffect`) and JSX rendering.

## 3. Creating New Features: A Checklist

When developing a new feature, follow this checklist:

1. **Define Types:** Add any new data models to `src/types/`.
2. **Create Service Functions:** Create a new service file (e.g., `src/services/new-feature.services.ts`) or add to an existing one. Define all necessary database interactions here.
3. **Create Context (if needed):** If the feature's state needs to be shared across multiple components, create a new context provider in `src/contexts/`.
4. **Build Components:**
   - Create new components in `src/components/`.
   - If a component becomes complex, create a directory and a `_lib` folder for it.
   - Components should get their data and action functions from context hooks (`useUserProfile`, `useMyFeature`, etc.) or as props.
5. **Create Page:** Create the new page route in `src/app/`. The page file should primarily be responsible for fetching initial data (if server-side), managing component state, and laying out the components.
6. **Update Documentation:** Add the new feature, routes, and API endpoints (if applicable) to the relevant files in the `/docs` directory.

By adhering to this structure, we ensure the JobBoardly codebase remains robust, scalable, and easy for any developer to navigate and contribute to.
