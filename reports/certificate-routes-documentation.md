# Certificate Module - API Routes Documentation

**Base URL:** `/certificates`
**Authentication:** Bearer Token (JWT) - Required for all routes except `verify`

---

## Overview

The Certificate module manages redemption certificates for the Superior Rewards system. When a user redeems their points for gifts, a certificate is generated as proof of redemption. These certificates can be downloaded as PDFs, verified publicly, and tracked for printing/download events.

---

## Routes

### 1. Filter Certificates

**Endpoint:** `POST /certificates/filters`
**Authentication:** Required

**Description:**
Retrieves certificates with pagination, filtering, and optional population of related data. Supports dynamic filters using various operators for flexible querying.

**Request Body:**
```json
{
  "page": 1,
  "pageSize": 10,
  "withPopulate": true,
  "filters": {
    "certificateNumber[like]": "CERT-2026",
    "generatedAt[date]": ["2026-01-01", "2026-01-31"],
    "metadata.pointsRedeemed[range]": [1000, 10000],
    "printedAt[exists]": true
  },
  "populated": {
    "generatedBy[name]": "John"
  }
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `page` | number | No | Page number (default: 1) |
| `pageSize` | number | No | Items per page (default: 10) |
| `withPopulate` | boolean | No | Include related data (generatedBy, userGift, customer) |
| `filters` | object | No | Dynamic filters (see filter operators below) |
| `populated` | object | No | Filters on populated fields |

**Filter Operators:**
| Operator | Syntax | Description | Example |
|----------|--------|-------------|---------|
| `eq` | `field[eq]` | Exact match | `"certificateNumber[eq]": "CERT-2026-000001"` |
| `like` | `field[like]` | Partial match (case-insensitive) | `"certificateNumber[like]": "CERT"` |
| `range` | `field[range]` | Between min and max | `"metadata.pointsRedeemed[range]": [100, 5000]` |
| `date` | `field[date]` | Date range | `"generatedAt[date]": ["2026-01-01", "2026-01-31"]` |
| `exists` | `field[exists]` | Field exists or not | `"printedAt[exists]": true` |

**Response:**
```json
{
  "data": [
    {
      "_id": "64a1b2c3d4e5f6789...",
      "certificateNumber": "CERT-2026-000001",
      "verificationCode": "550e8400-e29b-41d4-a716-446655440000",
      "generatedAt": "2026-01-13T10:30:00.000Z",
      "metadata": {
        "customerName": "John Doe",
        "pointsRedeemed": 5000,
        "monetaryValue": 50.00
      },
      "generatedBy": {
        "_id": "64a1b2c3d4e5f6789...",
        "name": "Admin User"
      },
      "customer": {
        "_id": "64a1b2c3d4e5f6789...",
        "name": "John Doe",
        "email": "john@example.com"
      }
    }
  ],
  "page": 1,
  "pageSize": 10,
  "totalPages": 5,
  "filters": { ... }
}
```

---

### 2. Generate Certificate

**Endpoint:** `POST /certificates/generate`
**Authentication:** Required

**Description:**
Creates a new certificate for a completed gift redemption. This is typically called automatically when a user redeems their points, but can also be triggered manually.

**Request Body:**
```json
{
  "userGiftId": "64a1b2c3d4e5f6789...",
  "generatedBy": "64a1b2c3d4e5f6789...",
  "conversionRate": 0.01
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `userGiftId` | string (MongoID) | Yes | The ID of the UserGift record |
| `generatedBy` | string (MongoID) | Yes | The ID of the staff member generating the certificate |
| `conversionRate` | number | No | Points to currency conversion rate (default: 0.01) |

**Response:**
```json
{
  "success": true,
  "message": "Certificate generated successfully",
  "data": {
    "_id": "64a1b2c3d4e5f6789...",
    "certificateNumber": "COR-2026-000001",
    "verificationCode": "550e8400-e29b-41d4-a716-446655440000",
    "customerName": "John Doe",
    "pointsRedeemed": 5000,
    "monetaryValue": 50.00,
    "generatedAt": "2026-01-13T10:30:00.000Z"
  }
}
```

---

### 2. Get Certificate by ID

**Endpoint:** `GET /certificates/:id`
**Authentication:** Required

**Description:**
Retrieves the full details of a specific certificate by its MongoDB ID.

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Certificate MongoDB ID |

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "64a1b2c3d4e5f6789...",
    "certificateNumber": "COR-2026-000001",
    "verificationCode": "550e8400-e29b-41d4-a716-446655440000",
    "customerName": "John Doe",
    "customerId": "64a1b2c3d4e5f6789...",
    "customerEmail": "john@example.com",
    "pointsRedeemed": 5000,
    "monetaryValue": 50.00,
    "printedAt": null,
    "downloadedAt": null,
    "generatedAt": "2026-01-13T10:30:00.000Z"
  }
}
```

---

### 3. Download Certificate PDF

**Endpoint:** `GET /certificates/download/:id`
**Authentication:** Required

**Description:**
Downloads the certificate as a PDF file. The PDF includes the certificate details, QR code for verification, and professional formatting suitable for printing.

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Certificate MongoDB ID |

**Response:**
- **Content-Type:** `application/pdf`
- **Content-Disposition:** `attachment; filename="certificate-COR-2026-000001.pdf"`
- Returns binary PDF data

**Side Effects:**
- Automatically updates the `downloadedAt` timestamp if this is the first download

---

### 4. Verify Certificate (Public)

**Endpoint:** `GET /certificates/verify/:code`
**Authentication:** Not Required (Public)

**Description:**
Public endpoint that allows anyone to verify a certificate's authenticity using its verification code. This is typically accessed by scanning the QR code printed on the certificate.

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `code` | string (UUID) | The verification code from the certificate |

**Response (Valid Certificate):**
```json
{
  "isValid": true,
  "certificateNumber": "COR-2026-000001",
  "customerName": "John Doe",
  "pointsRedeemed": 5000,
  "monetaryValue": 50.00,
  "redemptionDate": "2026-01-13T10:30:00.000Z",
  "message": "Certificate is valid and verified"
}
```

**Response (Invalid Certificate):**
```json
{
  "isValid": false,
  "message": "Certificate not found or invalid verification code"
}
```

---

### 5. Get User Certificates

**Endpoint:** `GET /certificates/user/:userId`
**Authentication:** Required

**Description:**
Retrieves all certificates associated with a specific customer. Useful for viewing a customer's redemption history.

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `userId` | string | Customer's MongoDB ID |

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64a1b2c3d4e5f6789...",
      "certificateNumber": "COR-2026-000001",
      "pointsRedeemed": 5000,
      "monetaryValue": 50.00,
      "generatedAt": "2026-01-13T10:30:00.000Z"
    },
    {
      "_id": "64a1b2c3d4e5f6789...",
      "certificateNumber": "COR-2026-000002",
      "pointsRedeemed": 3000,
      "monetaryValue": 30.00,
      "generatedAt": "2026-01-10T14:20:00.000Z"
    }
  ],
  "count": 2
}
```

---

### 6. Mark Certificate as Printed

**Endpoint:** `POST /certificates/:id/printed`
**Authentication:** Required

**Description:**
Records that a certificate has been physically printed. Updates the `printedAt` timestamp for tracking purposes.

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Certificate MongoDB ID |

**Request Body:**
```json
{
  "printedBy": "64a1b2c3d4e5f6789..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Certificate marked as printed",
  "data": {
    "_id": "64a1b2c3d4e5f6789...",
    "certificateNumber": "COR-2026-000001",
    "printedAt": "2026-01-13T11:00:00.000Z"
  }
}
```

---

### 7. Track Download Event

**Endpoint:** `POST /certificates/:id/downloaded`
**Authentication:** Required

**Description:**
Manually records a download event for tracking and analytics. This is separate from the automatic tracking in the download endpoint.

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Certificate MongoDB ID |

**Response:**
```json
{
  "success": true,
  "message": "Download event tracked",
  "data": {
    "_id": "64a1b2c3d4e5f6789...",
    "certificateNumber": "COR-2026-000001",
    "downloadedAt": "2026-01-13T11:15:00.000Z"
  }
}
```

---

### 8. Get Certificate by UserGift ID

**Endpoint:** `GET /certificates/user-gift/:userGiftId`
**Authentication:** Required

**Description:**
Retrieves the certificate associated with a specific UserGift record. Useful when you have the redemption ID but need the certificate.

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `userGiftId` | string | UserGift MongoDB ID |

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "64a1b2c3d4e5f6789...",
    "certificateNumber": "COR-2026-000001",
    "userGiftId": "64a1b2c3d4e5f6789...",
    "pointsRedeemed": 5000,
    "monetaryValue": 50.00
  }
}
```

---

### 9. Delete Certificate

**Endpoint:** `DELETE /certificates/:id`
**Authentication:** Required

**Description:**
Permanently deletes a certificate by its ID. This action cannot be undone.

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Certificate MongoDB ID |

**Response:**
```json
{
  "success": true,
  "deleted": true,
  "message": "Certificate COR-2026-000001 deleted successfully"
}
```

---

### 10. Bulk Delete Certificates

**Endpoint:** `DELETE /certificates/bulk/delete`
**Authentication:** Required

**Description:**
Deletes multiple certificates in a single request. Useful for administrative cleanup.

**Request Body:**
```json
{
  "ids": [
    "64a1b2c3d4e5f6789...",
    "64a1b2c3d4e5f6789...",
    "64a1b2c3d4e5f6789..."
  ]
}
```

**Response:**
```json
{
  "success": true,
  "deletedCount": 3,
  "message": "3 certificates deleted successfully"
}
```

---

### 11. Delete Certificate by UserGift ID

**Endpoint:** `DELETE /certificates/user-gift/:userGiftId`
**Authentication:** Required

**Description:**
Deletes the certificate associated with a specific UserGift record. Useful when reversing a redemption.

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `userGiftId` | string | UserGift MongoDB ID |

**Response:**
```json
{
  "success": true,
  "deleted": true,
  "message": "Certificate for UserGift deleted successfully"
}
```

---

## Certificate Data Model

| Field | Type | Description |
|-------|------|-------------|
| `_id` | ObjectId | Unique identifier |
| `certificateNumber` | string | Human-readable number (e.g., COR-2026-000001) |
| `verificationCode` | string (UUID) | Unique code for verification |
| `userGiftId` | ObjectId | Reference to UserGift record |
| `customerName` | string | Customer's full name |
| `customerId` | ObjectId | Reference to Person record |
| `customerEmail` | string | Customer's email |
| `pointsRedeemed` | number | Points used in redemption |
| `monetaryValue` | number | Currency value of points |
| `transactionId` | ObjectId | Reference to Transaction record |
| `generatedBy` | ObjectId | Staff who generated certificate |
| `generatedAt` | Date | Generation timestamp |
| `printedAt` | Date | When certificate was printed |
| `downloadedAt` | Date | When certificate was first downloaded |
| `htmlContent` | string | Rendered HTML for PDF generation |
| `metadata` | object | Additional certificate data |

---

## Workflow Example

```
1. User redeems points for gifts
   └── POST /user-gifts/redeem
       └── Automatically calls POST /certificates/generate

2. Staff downloads certificate for customer
   └── GET /certificates/download/:id
       └── Returns PDF, updates downloadedAt

3. Staff prints certificate
   └── POST /certificates/:id/printed
       └── Records printedAt timestamp

4. Customer verifies certificate (scans QR code)
   └── GET /certificates/verify/:code
       └── Returns validation result (public)
```

---

## Error Responses

All endpoints may return the following error formats:

**404 Not Found:**
```json
{
  "statusCode": 404,
  "message": "Certificate not found",
  "error": "Not Found"
}
```

**500 Internal Server Error:**
```json
{
  "statusCode": 500,
  "message": "Internal server error",
  "error": "Internal Server Error"
}
```