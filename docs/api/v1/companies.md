# API v1: Companies Endpoints

These endpoints are for public retrieval of company information.

---

### Get All Approved Companies

- **`GET /api/v1/companies`**
- **Description**: Fetches a paginated list of all `approved` company profiles for public display.
- **Authorization**: `public`.
- **Query Parameters**:
  | Field | Type | Description |
  |---|---|---|
  | `q` | `string` | Search by company name or description. |
  | `page` | `number` | Page number for pagination. |
  | `limit` | `number` | Items per page (e.g., 9). |
- **Success Response** (`200 OK`):
  ```json
  {
    "data": [
      {
        "id": "companyA",
        "name": "Innovatech Solutions",
        "description": "A leading provider of innovative tech solutions.",
        "logoUrl": "https://placehold.co/100x100.png?text=IS",
        "websiteUrl": "https://innovatech.com"
      },
      {
        "id": "companyB",
        "name": "AI Core Inc.",
        "description": "Pioneering the future of artificial intelligence.",
        "logoUrl": "https://placehold.co/100x100.png?text=AI",
        "websiteUrl": "https://aicore.com"
      }
    ],
    "pagination": { "currentPage": 1, "totalPages": 5, "totalItems": 45 }
  }
  ```

---

### Get Single Company Profile

- **`GET /api/v1/companies/:companyId`**
- **Description**: Fetches details for a single `approved` company, including its recruiters and approved job listings.
- **Authorization**: `public`.
- **Success Response** (`200 OK`):
  ```json
  {
    "company": {
      "id": "companyA",
      "name": "Innovatech Solutions",
      "description": "A leading provider of innovative tech solutions...",
      "websiteUrl": "https://innovatech.com",
      "logoUrl": "https://placehold.co/100x100.png?text=IS",
      "bannerImageUrl": "https://placehold.co/650x450.png",
      "status": "approved"
    },
    "recruiters": [
      {
        "uid": "employer1",
        "name": "John Recruiter",
        "avatarUrl": "https://placehold.co/100x100.png?text=JR"
      }
    ],
    "jobs": [
      {
        "id": "job123",
        "title": "Senior Frontend Developer",
        "location": "San Francisco, CA",
        "type": "Full-time",
        "isRemote": false,
        "postedDate": "2023-10-26T10:00:00Z"
      }
    ]
  }
  ```
- **Error Response** (`404 Not Found`): If no company with the given ID exists or it is not `approved`.
