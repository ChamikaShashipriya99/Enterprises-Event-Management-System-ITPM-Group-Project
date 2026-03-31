# API Testing Guide

## Quick Reference: All Endpoints

### Base URL
```
http://localhost:5000/api
```

---

## Authentication

### Before Testing
1. Register a student account or use existing
2. Get JWT token by logging in
3. Add token to headers: `Authorization: Bearer {token}`

### Sample Login Request
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@example.com",
    "password": "password123"
  }'
```

Response:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { ... }
}
```

---

## Attendance (Check-In) Tests

### Test 1: Check-In with QR Code
```bash
curl -X POST http://localhost:5000/api/attendance/check-in \
  -H "Authorization: Bearer YOUR_ORGANIZER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "qrCode": "{\"bookingId\":\"BK-ABC123-1234567\",\"studentId\":\"507f1f77bcf86cd799439011\",\"eventId\":\"507f1f77bcf86cd799439012\",\"studentEmail\":\"student@example.com\",\"generatedAt\":\"2024-03-25T10:00:00Z\",\"checksum\":\"abc-123\"}"
  }'
```

Success Response:
```json
{
  "success": true,
  "message": "Student checked in successfully",
  "data": {
    "attendance": {
      "attendanceId": "507f1f77bcf86cd799439013",
      "bookingId": "BK-ABC123-1234567",
      "studentName": "John Doe",
      "studentEmail": "john@example.com",
      "eventTitle": "React Workshop",
      "checkedInAt": "2024-03-25T10:30:00.000Z",
      "checkedInBy": "Organizer Name",
      "status": "present"
    }
  }
}
```

Error Response (Already Checked In):
```json
{
  "success": false,
  "message": "Student has already been checked in for this event",
  "checkedInAt": "2024-03-25T09:00:00.000Z",
  "checkedInBy": "507f1f77bcf86cd799439014"
}
```

### Test 2: Get Event Attendance
```bash
curl -X GET http://localhost:5000/api/attendance/event/507f1f77bcf86cd799439012 \
  -H "Authorization: Bearer YOUR_ORGANIZER_TOKEN"
```

Response:
```json
{
  "success": true,
  "summary": {
    "totalAttendees": 15,
    "present": 12,
    "absent": 2,
    "excused": 1
  },
  "data": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "booking": { "bookingId": "BK-ABC123-1234567" },
      "student": { "name": "John Doe", "email": "john@example.com" },
      "event": { "title": "React Workshop" },
      "status": "present",
      "checkedInAt": "2024-03-25T10:30:00.000Z",
      "checkedInBy": { "name": "Organizer Name", "role": "organizer" },
      "qrCodeScanned": "{...}",
      "notes": "Checked in by organizer"
    }
    // ... more records
  ]
}
```

### Test 3: Get Booking Attendance
```bash
curl -X GET http://localhost:5000/api/attendance/booking/507f1f77bcf86cd799439013 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Response:
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439013",
    "booking": { "bookingId": "BK-ABC123-1234567" },
    "student": { "name": "John Doe", "email": "john@example.com" },
    "event": { "title": "React Workshop", "date": "2024-03-25T00:00:00.000Z" },
    "status": "present",
    "checkedInAt": "2024-03-25T10:30:00.000Z",
    "checkedInBy": { "name": "Organizer", "role": "organizer" }
  }
}
```

### Test 4: Update Attendance Status
```bash
curl -X PUT http://localhost:5000/api/attendance/507f1f77bcf86cd799439013/status \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "present",
    "notes": "Marked present after confirmation"
  }'
```

Response:
```json
{
  "success": true,
  "message": "Attendance status updated successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439013",
    "status": "present",
    "notes": "Marked present after confirmation",
    "student": { "name": "John Doe", "email": "john@example.com" },
    "event": { "title": "React Workshop" }
  }
}
```

### Test 5: Get Student Attendance History
```bash
curl -X GET http://localhost:5000/api/attendance/student/history \
  -H "Authorization: Bearer YOUR_STUDENT_TOKEN"
```

Response:
```json
{
  "success": true,
  "totalEvents": 3,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "booking": { "bookingId": "BK-ABC123-1234567" },
      "event": { 
        "title": "React Workshop",
        "date": "2024-03-25T10:00:00.000Z",
        "location": "Room 101"
      },
      "status": "present",
      "checkedInAt": "2024-03-25T10:30:00.000Z"
    }
    // ... more events
  ]
}
```

---

## Certificate Tests

### Test 1: Generate Certificates for Event
```bash
curl -X POST http://localhost:5000/api/certificates/generate-for-event/507f1f77bcf86cd799439012 \
  -H "Authorization: Bearer YOUR_ORGANIZER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "attendanceHours": 2
  }'
```

Response:
```json
{
  "success": true,
  "message": "Certificate generation completed",
  "eventTitle": "React Workshop",
  "data": {
    "total": 12,
    "generated": [
      {
        "certificateId": "CERT-ABC123-1234567890",
        "studentName": "John Doe",
        "studentEmail": "john@example.com"
      },
      {
        "certificateId": "CERT-DEF456-1234567890",
        "studentName": "Jane Smith",
        "studentEmail": "jane@example.com"
      }
    ],
    "failed": [],
    "alreadyGenerated": []
  }
}
```

### Test 2: Get Student Certificates
```bash
curl -X GET http://localhost:5000/api/certificates/student \
  -H "Authorization: Bearer YOUR_STUDENT_TOKEN"
```

Response:
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439014",
      "certificateId": "CERT-ABC123-1234567890",
      "booking": { "bookingId": "BK-ABC123-1234567" },
      "student": { "name": "John Doe", "email": "john@example.com" },
      "event": {
        "_id": "507f1f77bcf86cd799439012",
        "title": "React Workshop",
        "date": "2024-03-25T10:00:00.000Z",
        "location": "Room 101"
      },
      "filePath": "certificates/John_Doe_CERT-ABC123-1234567890.pdf",
      "issuedAt": "2024-03-25T12:00:00.000Z",
      "emailSent": false,
      "emailSentAt": null
    }
  ]
}
```

### Test 3: Get Certificate Details
```bash
curl -X GET http://localhost:5000/api/certificates/507f1f77bcf86cd799439014 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Response:
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439014",
    "certificateId": "CERT-ABC123-1234567890",
    "booking": { "bookingId": "BK-ABC123-1234567" },
    "student": {
      "_id": "507f1f77bcf86cd799439001",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "event": {
      "_id": "507f1f77bcf86cd799439012",
      "title": "React Workshop",
      "date": "2024-03-25T10:00:00.000Z",
      "location": "Room 101",
      "organizer": { "name": "Dr. Smith" }
    },
    "filePath": "certificates/John_Doe_CERT-ABC123-1234567890.pdf",
    "issuedAt": "2024-03-25T12:00:00.000Z",
    "emailSent": false
  }
}
```

### Test 4: Download Certificate PDF
```bash
curl -X GET http://localhost:5000/api/certificates/507f1f77bcf86cd799439014/download \
  -H "Authorization: Bearer YOUR_STUDENT_TOKEN" \
  -o certificate.pdf
```

Returns PDF file directly.

### Test 5: Send Certificate Email
```bash
curl -X POST http://localhost:5000/api/certificates/507f1f77bcf86cd799439014/send-email \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}'
```

Response:
```json
{
  "success": true,
  "message": "Certificate sent successfully to john@example.com",
  "data": {
    "certificateId": "CERT-ABC123-1234567890",
    "recipientEmail": "john@example.com",
    "sentAt": "2024-03-25T12:30:00.000Z"
  }
}
```

### Test 6: Get Certificate Statistics
```bash
curl -X GET http://localhost:5000/api/certificates/event/507f1f77bcf86cd799439012/stats \
  -H "Authorization: Bearer YOUR_ORGANIZER_TOKEN"
```

Response:
```json
{
  "success": true,
  "data": {
    "totalCertificatesGenerated": 12,
    "totalEmailsSent": 8,
    "totalAttendees": 12,
    "eventTitle": "React Workshop",
    "generationRate": "100%"
  }
}
```

---

## Booking Tests (Extended with QR)

### Test: Create Booking (QR Generated)
```bash
curl -X POST http://localhost:5000/api/bookings \
  -H "Authorization: Bearer YOUR_STUDENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "eventId": "507f1f77bcf86cd799439012"
  }'
```

Response:
```json
{
  "success": true,
  "message": "Booking confirmed successfully",
  "data": {
    "bookingId": "BK-ABC123-1710000000000",
    "status": "confirmed",
    "event": {
      "id": "507f1f77bcf86cd799439012",
      "title": "React Workshop",
      "date": "2024-03-25T10:00:00.000Z",
      "location": "Room 101"
    },
    "qrCodeImage": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAA...",
    "createdAt": "2024-03-20T10:30:00.000Z"
  }
}
```

---

## Error Response Examples

### Invalid QR Code
```json
{
  "success": false,
  "message": "Invalid QR code: Missing required QR field: studentId"
}
```

### Already Checked In
```json
{
  "success": false,
  "message": "Student has already been checked in for this event",
  "checkedInAt": "2024-03-25T09:00:00.000Z"
}
```

### Event Not Yet Completed
```json
{
  "success": false,
  "message": "Event has not yet been completed. Cannot generate certificates for future events."
}
```

### Unauthorized
```json
{
  "success": false,
  "message": "You can only check in students for events you organize"
}
```

### Certificate File Not Found
```json
{
  "success": false,
  "message": "Certificate file not found on server"
}
```

---

## Postman Collection Quick Setup

1. Create new collection: "Event Management - Check-in & Certificates"

2. Create folder: "Authentication"
   - POST /api/auth/login

3. Create folder: "Attendance"
   - POST /api/attendance/check-in
   - GET /api/attendance/event/:eventId
   - GET /api/attendance/booking/:bookingId
   - PUT /api/attendance/:attendanceId/status
   - GET /api/attendance/student/history

4. Create folder: "Certificates"
   - POST /api/certificates/generate-for-event/:eventId
   - GET /api/certificates/student
   - GET /api/certificates/:certificateId
   - GET /api/certificates/:certificateId/download
   - POST /api/certificates/:certificateId/send-email
   - GET /api/certificates/event/:eventId/stats

---

## Testing Workflow

### Complete Flow Test

1. **Student Books Event**
   ```bash
   POST /api/bookings
   # Copy bookingId and qrCodeImage from response
   ```

2. **Organizer Checks In Student**
   ```bash
   POST /api/attendance/check-in
   # Use qrCodeData from booking (embedded in image)
   ```

3. **Verify Attendance Recorded**
   ```bash
   GET /api/attendance/event/{eventId}
   # Should show 1 present
   ```

4. **Generate Certificates**
   ```bash
   POST /api/certificates/generate-for-event/{eventId}
   # After event date passes
   ```

5. **Student Gets Certificate**
   ```bash
   GET /api/certificates/student
   # Should show generated certificate
   ```

6. **Download Certificate**
   ```bash
   GET /api/certificates/{certificateId}/download
   # Returns PDF file
   ```

7. **Email Certificate**
   ```bash
   POST /api/certificates/{certificateId}/send-email
   # Certificate emailed to student
   ```

---

## Environment Variables for Testing

```bash
# For manual QR testing
QR_TEST_DATA='{"bookingId":"BK-TEST-123","studentId":"507f1f77bcf86cd799439001","eventId":"507f1f77bcf86cd799439012","studentEmail":"test@example.com","generatedAt":"2024-03-25T10:00:00Z","checksum":"test-123"}'

# For email testing
TEST_EMAIL=test_student@example.com
TEST_HOURS=2
```

---

## Tips & Tricks

### Get QR Data from Base64 Image
```javascript
// In browser console:
const qrImage = "data:image/png;base64,iVBORw0KGgoAAAA..."
const canvas = document.createElement('canvas');
// Use jsQR library to decode
// Or extract from booking response directly
```

### Test with Network Throttling
In browser DevTools:
1. Open Network tab
2. Click throttle settings
3. Select "4G" or "3G"
4. Run certificate download test

### Monitor API Performance
```bash
# Using time command
time curl -X GET http://localhost:5000/api/certificates/student \
  -H "Authorization: Bearer TOKEN"
```

### Test Bulk Certificate Generation
```bash
# Generate for event with 100+ attendees
POST /api/certificates/generate-for-event/{largeEventId}
# Monitor performance and memory
```

---

**Happy Testing!** 🚀

For issues or questions, check the main documentation in `CHECKIN_CERTIFICATION_SETUP.md`
