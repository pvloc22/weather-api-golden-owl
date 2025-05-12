# Firebase Cloud Functions Deployment for Email Sending

This document provides instructions on how to deploy Firebase Cloud Functions for sending emails in the Weather Forecast application.

## Installing Firebase CLI Tools

1. Install Node.js (if not already installed): https://nodejs.org/
2. Install Firebase CLI:
   ```
   npm install -g firebase-tools
   ```

## Login and Initialize Project

1. Login to Firebase:
   ```
   firebase login
   ```

2. Create a new Firebase project from Firebase Console: https://console.firebase.google.com/

3. Initialize the project in the root directory of the application:
   ```
   firebase init
   ```
   
   - Select "Functions" and "Hosting"
   - Choose the Firebase project you created
   - Select JavaScript
   - Don't install ESLint
   - Install dependencies with npm

## Configuration

1. The functions directory already contains these files:
   - index.js: Contains Cloud Functions source code
   - package.json: Contains dependencies

2. Update the `index.js` file with the content in this repo.

3. Install the dependencies:
   ```
   cd functions
   npm install nodemailer cors
   ```

## Deploying Functions

1. Deploy Functions to Firebase:
   ```
   firebase deploy --only functions
   ```

2. After deployment, you will receive URLs for each Cloud Function, for example:
   ```
   Function URL (sendVerificationEmail): https://us-central1-your-project-id.cloudfunctions.net/sendVerificationEmail
   ```

3. Update the URLs in `lib/core/service/firebase_email_service.dart`:
   ```dart
   final String _baseUrl = 'https://us-central1-your-project-id.cloudfunctions.net';
   ```

## Testing

You can test the APIs using tools like Postman or curl:

```bash
curl -X POST https://us-central1-your-project-id.cloudfunctions.net/sendVerificationEmail \
  -H "Content-Type: application/json" \
  -d '{"email":"your-email@example.com","otp":"123456"}'
```

## Handling Gmail Security Issues

If you encounter errors when sending emails, it may be due to Gmail security settings:

1. Enable "Less secure app access" in your Google account
2. Or better, use an App Password: https://support.google.com/accounts/answer/185833

## CORS Configuration

If you encounter CORS errors when calling the API from a web application, update the CORS configuration in the `index.js` file:

```javascript
const cors = require('cors')({ origin: true });
```

Replace `true` with your web application's domain if necessary. 