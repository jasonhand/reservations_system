# Pine Ridge Hot Springs - API Documentation

## Overview

The Pine Ridge Hot Springs API provides endpoints for managing resort sites, reservations, and administrative functions. The API follows RESTful conventions and returns JSON responses.

**Base URL:** `https://pineridgehotsprings.netlify.app/.netlify/functions/api`  
**Development:** `http://localhost:3001/api`

## Authentication

### Admin Endpoints
Admin endpoints require Bearer token authentication:

```http
Authorization: Bearer <token>
```

Get token via `/admin/login` endpoint.

## Response Format

All API responses follow this format:

```json
{
  "success": boolean,
  "data": object | array,
  "error": string,
  "message": string
}
```

## Sites API

### Get All Sites
Retrieve all available sites.

```http
GET /api/sites
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "campsite-1",
      "name": "Riverside Retreat",
      "type": "campsite",
      "capacity": 4,
      "price": 45.00,
      "amenities": ["Fire pit", "Picnic table", "Water access"],
      "description": "A peaceful campsite along the mountain stream...",
      "images": ["https://images.unsplash.com/..."],
      "features": ["Stream-side location", "Shaded area"],
      "size": "20x30 ft",
      "bedrooms": null,
      "bathrooms": null
    }
  ]
}
```

### Get Site by ID
Retrieve a specific site by its ID.

```http
GET /api/sites/{id}
```

**Parameters:**
- `id` (string): Site ID

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "cabin-1",
    "name": "Cozy Pine Cabin",
    "type": "cabin",
    "capacity": 4,
    "price": 120.00,
    "amenities": ["Full kitchen", "Private bathroom", "Fireplace"],
    "description": "Charming one-bedroom cabin...",
    "images": ["https://images.unsplash.com/..."],
    "features": ["Wood-burning fireplace", "Full kitchen"],
    "size": "600 sq ft",
    "bedrooms": 1,
    "bathrooms": 1
  }
}
```

### Get Available Sites
Find sites available for specific dates.

```http
GET /api/sites/available?checkIn=2024-01-15&checkOut=2024-01-18&guests=2&siteType=cabin
```

**Query Parameters:**
- `checkIn` (string, required): Check-in date (YYYY-MM-DD)
- `checkOut` (string, required): Check-out date (YYYY-MM-DD)
- `guests` (number, required): Number of guests
- `siteType` (string, optional): Filter by site type (`campsite`, `cabin`, `premium`)

### Check Site Availability
Check if a specific site is available for given dates.

```http
POST /api/sites/{id}/check-availability
```

**Request Body:**
```json
{
  "checkIn": "2024-01-15",
  "checkOut": "2024-01-18"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "siteId": "cabin-1",
    "siteName": "Cozy Pine Cabin",
    "checkIn": "2024-01-15",
    "checkOut": "2024-01-18",
    "available": true,
    "conflictCount": 0
  }
}
```

## Reservations API

### Create Reservation
Create a new reservation.

```http
POST /api/reservations
```

**Request Body:**
```json
{
  "siteId": "cabin-1",
  "checkIn": "2024-01-15",
  "checkOut": "2024-01-18",
  "guests": 2,
  "guestName": "John Smith",
  "guestEmail": "john@example.com",
  "guestPhone": "(555) 123-4567",
  "specialRequests": "Anniversary celebration"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "res-uuid-here",
    "siteId": "cabin-1",
    "siteName": "Cozy Pine Cabin",
    "guestName": "John Smith",
    "guestEmail": "john@example.com",
    "guestPhone": "(555) 123-4567",
    "checkIn": "2024-01-15",
    "checkOut": "2024-01-18",
    "guests": 2,
    "totalCost": 360.00,
    "specialRequests": "Anniversary celebration",
    "status": "pending",
    "createdAt": "2024-01-10T10:30:00Z"
  },
  "message": "Reservation created successfully. Please check your email for confirmation."
}
```

### Get Reservation
Retrieve a specific reservation.

```http
GET /api/reservations/{id}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "res-uuid-here",
    "siteId": "cabin-1",
    "siteName": "Cozy Pine Cabin",
    "guestName": "John Smith",
    "guestEmail": "john@example.com",
    "guestPhone": "(555) 123-4567",
    "checkIn": "2024-01-15",
    "checkOut": "2024-01-18",
    "guests": 2,
    "totalCost": 360.00,
    "specialRequests": "Anniversary celebration",
    "status": "confirmed",
    "createdAt": "2024-01-10T10:30:00Z",
    "updatedAt": "2024-01-10T11:00:00Z",
    "siteType": "cabin",
    "amenities": ["Full kitchen", "Private bathroom"],
    "images": ["https://images.unsplash.com/..."]
  }
}
```

### Verify Reservation
Confirm a reservation using email verification token.

```http
POST /api/reservations/verify
```

**Request Body:**
```json
{
  "token": "verification-token-uuid"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "res-uuid-here",
    "status": "confirmed",
    "updatedAt": "2024-01-10T11:00:00Z"
  },
  "message": "Reservation confirmed successfully!"
}
```

### Cancel Reservation
Cancel an existing reservation.

```http
DELETE /api/reservations/{id}?email=john@example.com
```

**Query Parameters:**
- `email` (string, optional): Guest email for verification

**Response:**
```json
{
  "success": true,
  "message": "Reservation cancelled successfully"
}
```

## Admin API

All admin endpoints require authentication.

### Admin Login
Authenticate admin user.

```http
POST /api/admin/login
```

**Request Body:**
```json
{
  "email": "admin@pineridgehotsprings.com",
  "password": "[DEMO_PASSWORD]"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "admin-demo-token-2024",
    "user": {
      "email": "admin@pineridgehotsprings.com",
      "role": "admin"
    }
  }
}
```

### Get All Reservations
Retrieve all reservations with optional filters.

```http
GET /api/admin/reservations?status=confirmed&startDate=2024-01-01&endDate=2024-12-31
```

**Headers:**
```http
Authorization: Bearer admin-demo-token-2024
```

**Query Parameters:**
- `status` (string, optional): Filter by status (`pending`, `confirmed`, `cancelled`)
- `startDate` (string, optional): Filter by check-in date (YYYY-MM-DD)
- `endDate` (string, optional): Filter by check-out date (YYYY-MM-DD)
- `siteType` (string, optional): Filter by site type

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "res-uuid-here",
      "siteId": "cabin-1",
      "siteName": "Cozy Pine Cabin",
      "guestName": "John Smith",
      "guestEmail": "john@example.com",
      "guestPhone": "(555) 123-4567",
      "checkIn": "2024-01-15",
      "checkOut": "2024-01-18",
      "guests": 2,
      "totalCost": 360.00,
      "status": "confirmed",
      "siteType": "cabin",
      "sitePrice": 120.00,
      "createdAt": "2024-01-10T10:30:00Z"
    }
  ]
}
```

### Get Dashboard Statistics
Retrieve admin dashboard statistics.

```http
GET /api/admin/stats
```

**Headers:**
```http
Authorization: Bearer admin-demo-token-2024
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalReservations": 15,
    "reservationsByStatus": [
      { "status": "confirmed", "count": 10 },
      { "status": "pending", "count": 3 },
      { "status": "cancelled", "count": 2 }
    ],
    "currentMonthRevenue": 2450.00,
    "upcomingCheckIns": 5,
    "siteTypePopularity": [
      { "type": "cabin", "bookings": 8 },
      { "type": "campsite", "bookings": 5 },
      { "type": "premium", "bookings": 2 }
    ],
    "recentActivity": [
      {
        "id": "res-123",
        "guest_name": "Jane Doe",
        "site_name": "Mountain View Cabin",
        "status": "confirmed",
        "created_at": "2024-01-10T15:30:00Z"
      }
    ]
  }
}
```

### Update Reservation Status
Update the status of a reservation.

```http
PATCH /api/admin/reservations/{id}/status
```

**Headers:**
```http
Authorization: Bearer admin-demo-token-2024
```

**Request Body:**
```json
{
  "status": "confirmed"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "res-uuid-here",
    "status": "confirmed",
    "updatedAt": "2024-01-10T16:00:00Z"
  },
  "message": "Reservation status updated to confirmed"
}
```

### Get Site Occupancy
Retrieve site occupancy data for calendar view.

```http
GET /api/admin/occupancy?startDate=2024-01-01&endDate=2024-01-31
```

**Headers:**
```http
Authorization: Bearer admin-demo-token-2024
```

**Query Parameters:**
- `startDate` (string, optional): Start date (YYYY-MM-DD)
- `endDate` (string, optional): End date (YYYY-MM-DD)

**Response:**
```json
{
  "success": true,
  "data": {
    "startDate": "2024-01-01",
    "endDate": "2024-01-31",
    "sites": [
      {
        "siteId": "cabin-1",
        "siteName": "Cozy Pine Cabin",
        "siteType": "cabin",
        "reservations": [
          {
            "checkIn": "2024-01-15",
            "checkOut": "2024-01-18",
            "guestName": "John Smith",
            "status": "confirmed"
          }
        ]
      }
    ]
  }
}
```

## Error Handling

### Error Response Format
```json
{
  "success": false,
  "error": "Error message",
  "details": [
    {
      "field": "guestEmail",
      "message": "Please provide a valid email address"
    }
  ]
}
```

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized
- `404` - Not Found
- `500` - Internal Server Error

### Common Error Scenarios

**Validation Error (400):**
```json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    {
      "field": "checkIn",
      "message": "Check-in date cannot be in the past"
    },
    {
      "field": "guestEmail",
      "message": "Please provide a valid email address"
    }
  ]
}
```

**Site Not Available (400):**
```json
{
  "success": false,
  "error": "Site is not available for the selected dates"
}
```

**Authorization Required (401):**
```json
{
  "success": false,
  "error": "Authorization required"
}
```

**Resource Not Found (404):**
```json
{
  "success": false,
  "error": "Site not found"
}
```

## Rate Limiting

- **General API**: 100 requests per minute per IP
- **Admin API**: 200 requests per minute per authenticated user
- **Reservation Creation**: 10 requests per minute per IP

## Data Validation

### Reservation Data
- `checkIn/checkOut`: Must be valid dates in YYYY-MM-DD format
- `guests`: Must be between 1 and site capacity
- `guestName`: 2-100 characters
- `guestEmail`: Valid email format
- `guestPhone`: Valid phone number format
- `specialRequests`: Max 500 characters

### Date Constraints
- Check-in must be in the future
- Check-out must be after check-in
- Maximum stay: 30 nights
- Maximum advance booking: 1 year

## Testing

Use the following test endpoints to verify API functionality:

```bash
# Health check
curl https://pineridgehotsprings.netlify.app/.netlify/functions/api/health

# Get all sites
curl https://pineridgehotsprings.netlify.app/.netlify/functions/api/sites

# Check availability
curl "https://pineridgehotsprings.netlify.app/.netlify/functions/api/sites/available?checkIn=2024-06-01&checkOut=2024-06-03&guests=2"
```

## Contact

For API support or questions:
- **Email**: api-support@pineridgehotsprings.com
- **Documentation**: [GitHub Repository](https://github.com/yourusername/pine-ridge-hot-springs)
- **Issues**: [GitHub Issues](https://github.com/yourusername/pine-ridge-hot-springs/issues)