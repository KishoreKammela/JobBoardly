# JobBoardly API v1 Documentation

Welcome to the JobBoardly API v1 documentation. This resource provides a detailed specification for all backend endpoints required to support the JobBoardly frontend application.

## 1. General Principles

### 1.1. Base URL

All API routes are prefixed with `/api/v1`. The full URL for an endpoint would be `https://yourdomain.com/api/v1/endpoint`.

### 1.2. Authentication

- The API is stateless and uses JSON Web Tokens (JWT) for authentication.
- The Login and Register endpoints will return a JWT.
- This token must be sent in the `Authorization` header for all protected routes (e.g., `Authorization: Bearer <your_jwt>`).
- The JWT payload should contain `uid`, `role`, and `companyId` (if applicable) for server-side authorization checks.

### 1.3. Responses

- **Success**: Responses will use standard HTTP status codes (e.g., `200 OK`, `201 Created`, `204 No Content`).
- **Error**: Errors will also use standard HTTP status codes (e.g., `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, `500 Internal Server Error`) and include a JSON body with a descriptive error message:
  ```json
  {
    "error": "A descriptive error message."
  }
  ```

### 1.4. Authorization Roles

- **`public`**: No authentication required.
- **`authenticated`**: Any logged-in user.
- **`jobSeeker`**: User with `role: 'jobSeeker'`.
- **`employer`**: User with `role: 'employer'`. The `isCompanyAdmin` flag may be required for certain actions.
- **`platformStaff`**: Includes roles like `admin`, `superAdmin`, `moderator`, `supportAgent`, `dataAnalyst`.

## 2. API Documentation Sections

The API is documented across multiple files for clarity:

- [**Authentication**](./auth.md): User registration, login, and password management.
- [**Jobs**](./jobs.md): Endpoints for creating, finding, and managing job listings.
- [**Companies**](./companies.md): Endpoints for viewing company profiles.
- [**Job Seekers**](./job-seekers.md): Endpoints specific to job seeker actions and profile management.
- [**Employers**](./employers.md): Endpoints for employers, including candidate search and company management.
- [**Admin**](./admin.md): Platform management endpoints for administrators.
- [**AI Services**](./ai-services.md): Endpoints that wrap Genkit AI flows.
- [**Notifications**](./notifications.md): Future endpoints for the notification system.
