# API v1: AI Service Endpoints

These endpoints encapsulate the Genkit flows that provide AI-powered functionality.

---

### Parse Resume

- **`POST /api/v1/ai/parse-resume`**
- **Description**: Parses a resume file (or pasted text) and extracts structured data to pre-fill a job seeker's profile.
- **Authorization**: `jobSeeker`.
- **Request Body**:

  ```json
  {
    "resumeDataUri": "data:application/pdf;base64,JVBERi0xLjQKJ..."
  }
  ```

  | Field           | Type     | Rules                         | Description                                                                |
  | --------------- | -------- | ----------------------------- | -------------------------------------------------------------------------- |
  | `resumeDataUri` | `string` | `required`, `data URI format` | The resume file as a data URI. Plain text is recommended for best results. |

- **Success Response** (`200 OK`):
  ```json
  {
    "name": "Jane Doe",
    "email": "jane.doe@example.com",
    "mobileNumber": "+1-555-0101",
    "headline": "Senior Software Engineer",
    "skills": ["React", "Node.js", "TypeScript", "Next.js"],
    "experience": "Led development of key features...",
    "education": "B.S. in Computer Science...",
    "portfolioUrl": "https://jane.dev",
    "linkedinUrl": "https://linkedin.com/in/janedoe",
    "totalYearsExperience": 5
  }
  ```
- **Error Response** (`400 Bad Request`): If the data URI is invalid or missing.

---

### Parse Job Description

- **`POST /api/v1/ai/parse-job-description`**
- **Description**: Parses a job description document to extract structured data and pre-fill the job posting form.
- **Authorization**: `employer`.
- **Request Body**:
  ```json
  {
    "jobDescriptionDataUri": "data:text/plain;base64,U2VuaW9yIFNvZnR..."
  }
  ```
- **Success Response** (`200 OK`):
  ```json
  {
    "title": "Senior Software Engineer",
    "responsibilities": "Develop and maintain web applications...",
    "requirements": "5+ years of experience with React...",
    "skills": ["React", "TypeScript", "Node.js"],
    "location": "San Francisco, CA",
    "jobType": "Full-time",
    "salaryMin": 120000,
    "salaryMax": 150000,
    "industry": "Technology",
    "experienceLevel": "Senior-Level"
  }
  ```

---

### Generate Professional Summary

- **`POST /api/v1/ai/generate-summary`**
- **Description**: Generates a professional summary based on a job seeker's profile data.
- **Authorization**: `jobSeeker`.
- **Request Body**:
  ```json
  {
    "jobSeekerProfileData": "Name: Jane Doe. Skills: React, Node.js. Experience: 5 years as a software engineer...",
    "targetRoleOrCompany": "Product Manager at Google"
  }
  ```
- **Success Response** (`200 OK`):
  ```json
  {
    "generatedSummary": "Accomplished software engineer with 5 years of experience in full-stack development, seeking to leverage technical expertise in a Product Manager role at Google. Proficient in driving projects from conception to completion..."
  }
  ```

---

### Match Jobs for Seeker

- **`POST /api/v1/ai/match-jobs`**
- **Description**: Matches a job seeker's profile against all available, approved jobs.
- **Authorization**: `jobSeeker`.
- **Request Body**:
  ```json
  {
    "jobSeekerProfile": "A detailed, stringified version of the user's full profile, including skills, experience, education, preferences, notice period, etc."
  }
  ```
- **Success Response** (`200 OK`):
  ```json
  {
    "relevantJobIDs": ["job123", "job456"],
    "reasoning": "Job 123 is a strong match due to the seeker's 5 years of React experience and preference for remote work. Job 456 aligns with their salary expectations and experience level."
  }
  ```

---

### Match Candidates for Employer

- **`POST /api/v1/ai/match-candidates`**
- **Description**: Matches a job description against all searchable candidate profiles.
- **Authorization**: `employer`.
- **Request Body**:
  ```json
  {
    "jobDescription": "A detailed, stringified job description, including title, responsibilities, requirements, skills, location, salary, industry, experience level, etc."
  }
  ```
- **Success Response** (`200 OK`):
  ```json
  {
    "relevantCandidateIDs": ["user123", "user789"],
    "reasoning": "User 123 is a strong match based on their 5 years of experience and skill set. User 789 is a potential fit due to their strong ML background, though their location preference is different."
  }
  ```

---

## Future AI Endpoints (Planned)

The following endpoints are planned for future development based on the AI roadmap.

- **`POST /api/v1/ai/career-path-advisor`**: Analyzes a job seeker's profile to suggest career trajectories and identify skill gaps.
- **`POST /api/v1/ai/application-success-predictor`**: Provides a job seeker with a likelihood score for getting an interview for a specific job.
- **`POST /api/v1/ai/job-description-optimizer`**: Provides employers with suggestions to improve a job description for clarity, inclusivity, and performance.
- **`POST /api/v1/ai/candidate-quality-scorer`**: Provides employers with a multi-dimensional score for an applicant based on skills, experience, and other factors.
