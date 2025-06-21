# API v1: Employer Endpoints

These endpoints are for employer-specific actions, including company management, candidate search, and viewing applicants.

---

### Get Employer's Company Profile

- **`GET /api/v1/me/company`**
- **Description**: Fetches the full profile of the company associated with the authenticated employer.
- **Authorization**: `employer`.
- **Success Response** (`200 OK`): The full `Company` object, including status and recruiter UIDs.
  ```json
  {
    "id": "companyA",
    "name": "Innovatech Solutions",
    "description": "A leading provider of innovative tech solutions...",
    "websiteUrl": "https://innovatech.com",
    "logoUrl": "https://placehold.co/100x100.png?text=IS",
    "bannerImageUrl": "https://placehold.co/650x450.png",
    "status": "approved",
    "recruiterUids": ["employer1", "employer3"],
    "adminUids": ["employer1"]
  }
  ```

---

### Update Company Profile

- **`PUT /api/v1/me/company`**
- **Description**: Allows a company admin to update their own company's profile.
- **Authorization**: `employer` with `isCompanyAdmin: true`.
- **Request Body**: A subset of updatable `Company` fields.
  ```json
  {
    "description": "A newly updated description of our company's mission and culture.",
    "websiteUrl": "https://innovatech.dev",
    "logoUrl": "https://new-logo-url.com/logo.png"
  }
  ```
- **Success Response** (`200 OK`): The updated company object.

---

### Find Candidates

- **`GET /api/v1/candidates`**
- **Description**: Fetches a paginated list of public, searchable job seeker profiles.
- **Authorization**: `employer`.
- **Query Parameters**:
  | Field | Type | Description |
  |---|---|---|
  | `q` | `string` | Keyword/boolean search for skills, headlines, etc. |
  | `loc` | `string` | Filter by preferred location. |
  | `notice`| `string` | Filter by `NoticePeriod` enum. |
  | `status`| `string` | Filter by job search status. |
  | `minSal`| `number` | Minimum expected salary (annual INR). |
  | `maxSal`| `number` | Maximum expected salary (annual INR). |
  | `activity`| `string` | Filter by profile activity (`24h`, `7d`, `30d`). |
  | `minExp`| `number` | Minimum years of experience. |
  | `page` | `number` | Page number for pagination. |
  | `limit` | `number` | Items per page. |
- **Success Response** (`200 OK`):
  ```json
  {
    "data": [
      {
        "uid": "user123",
        "name": "Jane Doe",
        "headline": "Experienced Full Stack Developer",
        "avatarUrl": "https://placehold.co/100x100.png?text=JD",
        "skills": ["React", "Node.js", "TypeScript"],
        "noticePeriod": "1 Month"
      }
    ],
    "pagination": { "currentPage": 1, "totalPages": 10, "totalItems": 100 }
  }
  ```

---

### Get Candidate Profile

- **`GET /api/v1/candidates/:userId`**
- **Description**: Fetches the full, detailed profile of a specific job seeker.
- **Authorization**: `employer`.
- **Success Response** (`200 OK`): The full `UserProfile` object for the job seeker.
- **Error Response** (`403 Forbidden`): If the job seeker's profile is not searchable.

---

### Save Candidate Search

- **`POST /api/v1/my-candidate-searches`**
- **Description**: Saves a combination of search terms and filters for later use.
- **Authorization**: `employer`.
- **Request Body**:
  | Field | Type | Rules | Description |
  |---|---|---|---|
  | `name` | `string` | `required` | A user-defined name for the search. |
  | `filters`| `CandidateFilters` | `required` | The filter object to save. |
- **Success Response** (`201 Created`): The newly created `SavedCandidateSearch` object.

---

### Delete Candidate Search

- **`DELETE /api/v1/my-candidate-searches/:searchId`**
- **Description**: Deletes a saved candidate search.
- **Authorization**: `employer`.
- **Success Response**: `204 No Content`.
