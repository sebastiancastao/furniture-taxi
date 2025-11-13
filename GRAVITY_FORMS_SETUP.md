# Gravity Forms API Integration - Setup Guide

## Overview

This application now integrates with Gravity Forms API v1 to automatically submit moving quote forms to your WordPress Gravity Forms installation.

## Files Created

1. **`lib/gravityforms.ts`** - Core utility functions for Gravity Forms authentication and submission
2. **`app/api/gravity-forms-submit/route.ts`** - Standalone API endpoint for Gravity Forms submissions
3. **Updated `app/api/send-email/route.ts`** - Integrated Gravity Forms submission with email sending

## Configuration

### Environment Variables

Add the following to your `.env.local` file:

```env
# Gravity Forms Configuration (Optional - defaults are already set in the code)
GRAVITY_FORMS_ID=3

# Existing variables (keep these)
RESEND_API_KEY=your_resend_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
```

**Note:** The API credentials (public key, private key, and base URL) are already configured in `lib/gravityforms.ts`. If you need to change them, edit that file directly.

### Current Configuration

- **Base URL:** `https://www.atlantafurnituremovers.com/gravityformsapi`
- **Public Key:** `0b7fbd1824`
- **Private Key:** `27842c3fdf765bd`
- **Default Form ID:** `3` (can be overridden with `GRAVITY_FORMS_ID` env variable)

## Field Mapping

The form data is mapped to Gravity Forms fields as follows:

| Form Field | Gravity Forms Field ID | Description |
|------------|------------------------|-------------|
| Name | `input_1` | Customer name |
| Email | `input_2` | Customer email |
| Phone | `input_3` | Customer phone |
| From Zip | `input_4` | Moving from zip code |
| To Zip | `input_5` | Moving to zip code |
| Move Date | `input_6` | Requested move date |
| Move Size | `input_7` | Size of move (studio, 1-bedroom, etc.) |
| Has Discount | `input_8` | Whether discount was applied (Yes/No) |

**Important:** You may need to update these field IDs to match your actual Gravity Forms setup.

### How to Find Your Field IDs

1. Log into your WordPress admin
2. Go to Forms → Your Form → Edit
3. Click on each field to see its Field ID
4. Update the field mapping in:
   - `app/api/send-email/route.ts` (lines 235-243)
   - `app/api/gravity-forms-submit/route.ts` (lines 32-39)

## How It Works

### Automatic Submission Flow

When a user submits the moving request form:

1. ✅ Form data is validated
2. 📧 Email is sent to admin (`service@furnituretaxi.site`)
3. 📧 Confirmation email is sent to customer
4. 📝 **Form is submitted to Gravity Forms** (NEW)
5. 💾 Submission is logged to Supabase database

### Authentication

The integration uses **Signature-based authentication (HMAC-SHA1)**:

1. For each API request, a signature is generated using:
   - Public key
   - Private key
   - HTTP method
   - Full URL
   - Expiration timestamp

2. The signature is calculated as:
   ```
   HMAC-SHA1(private_key, "{public_key}:{method}:{url}:{expires}")
   ```

3. The signature is base64-encoded and URL-encoded

4. The authenticated URL includes query parameters:
   ```
   ?api_key={public_key}&signature={signature}&expires={timestamp}
   ```

### Error Handling

- If Gravity Forms submission fails, it **does not** prevent the form from being submitted
- The email will still be sent to the admin and customer
- Errors are logged to the console for debugging
- The API response includes `gravityFormsSubmitted: true/false` to indicate success

## Testing

### Test the Integration

1. Visit your form with a valid code: `http://localhost:3000?code=YOUR_CODE`
2. Fill out and submit the form
3. Check the browser console or server logs for:
   ```
   Gravity Forms submission failed: [error message]
   ```
   OR
   ```json
   {
     "success": true,
     "gravityFormsSubmitted": true,
     "gravityFormsData": {...}
   }
   ```

### Verify in WordPress

1. Log into WordPress admin
2. Go to Forms → Entries
3. Check if the new submission appears

## API Endpoints

### 1. Integrated Submission (Recommended)

**Endpoint:** `POST /api/send-email`

This endpoint handles everything: emails + Gravity Forms + Supabase logging.

```javascript
const response = await fetch('/api/send-email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'John Doe',
    email: 'john@example.com',
    phone: '555-123-4567',
    fromZip: '12345',
    toZip: '67890',
    moveDate: '2025-12-01',
    moveSize: '2-bedroom',
    hasDiscount: true
  })
})
```

**Response:**
```json
{
  "success": true,
  "message": "Emails sent successfully",
  "adminEmailId": "...",
  "customerEmailId": "...",
  "gravityFormsSubmitted": true,
  "gravityFormsData": {...}
}
```

### 2. Standalone Gravity Forms Submission

**Endpoint:** `POST /api/gravity-forms-submit`

Use this if you want to submit to Gravity Forms independently.

```javascript
const response = await fetch('/api/gravity-forms-submit', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    formId: '1',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '555-123-4567',
    fromZip: '12345',
    toZip: '67890',
    moveDate: '2025-12-01',
    moveSize: '2-bedroom',
    hasDiscount: true
  })
})
```

## Troubleshooting

### Common Issues

#### 1. "API request failed: 401 Unauthorized"
- **Cause:** Invalid signature or expired timestamp
- **Solution:** Check that your public/private keys are correct in `lib/gravityforms.ts`

#### 2. "API request failed: 404 Not Found"
- **Cause:** Incorrect form ID or base URL
- **Solution:**
  - Verify the form ID exists in WordPress
  - Check that the base URL is correct (`https://www.atlantafurnituremovers.com/gravityformsapi`)

#### 3. Submissions not appearing in WordPress
- **Cause:** Field ID mismatch
- **Solution:** Update field IDs to match your Gravity Forms setup (see Field Mapping section)

#### 4. TypeScript errors about 'crypto' module
- **Cause:** Missing Node.js types
- **Solution:** Run `npm install --save-dev @types/node`

### Debugging Tips

1. **Enable verbose logging:**
   ```typescript
   // In lib/gravityforms.ts, add console logs
   console.log('Authenticated URL:', url)
   console.log('Request body:', JSON.stringify(fieldData, null, 2))
   ```

2. **Test authentication manually:**
   ```typescript
   import { buildAuthenticatedUrl } from '@/lib/gravityforms'
   const { url } = buildAuthenticatedUrl('/forms/1/submissions', 'POST')
   console.log('Test URL:', url)
   ```

3. **Check Gravity Forms API logs:**
   - In WordPress, go to Forms → Settings → Logging
   - Enable API logging
   - Review logs after submission attempts

## Security Notes

- API credentials are stored in the codebase (not environment variables)
- Consider moving sensitive credentials to environment variables in production
- Signatures expire after 1 hour by default
- All requests are made server-side (credentials never exposed to client)

## Next Steps

1. ✅ Update field IDs to match your Gravity Forms setup
2. ✅ Test with a real form submission
3. ✅ Verify entries appear in WordPress
4. ✅ Monitor logs for any errors
5. ✅ (Optional) Move API credentials to environment variables

## Support

For Gravity Forms API documentation, visit:
https://docs.gravityforms.com/rest-api-v1/

For issues specific to this integration, check the console logs and refer to the Troubleshooting section above.
