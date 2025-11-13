# Gravity Forms Integration - Troubleshooting Guide

## Current Issue: 200 OK with 400 Bad Request in Response Body

**Current Error:**
```
Response Status: 200 OK
Gravity Forms API success response: { status: 400, response: 'Bad request' }
```

**What this means:**
- ✅ Authentication is working (API keys are correct)
- ❌ Field data format or field IDs are incorrect

This is a **field mapping issue**, not an authentication problem.

## Debugging Steps

### 1. Enable Console Logging

The code now includes comprehensive logging. To see what's happening:

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Open your browser's Network tab (F12 → Network)

3. Fill out and submit a form

4. Check the **server console** (terminal where `npm run dev` is running) for these log messages:

   ```
   === Send Email API - Received Data ===
   Body: { ... }
   Extracted fields: { name, email, phone, ... }

   === Preparing Gravity Forms Submission ===
   Form ID: 1
   Field Data to submit: { ... }

   === Gravity Forms Submission Debug ===
   Form ID: 1
   Endpoint: /forms/1/submissions
   URL: https://www.atlantafurnituremovers.com/gravityformsapi/forms/1/submissions?api_key=...
   Field Data: { ... }
   Response Status: 200 OK (or error)

   === Gravity Forms Submission Result ===
   Success: true/false
   ```

### 2. Check the Logs

Based on the logs, identify where the issue occurs:

#### Problem A: Data not reaching API route
**Symptom:** "Send Email API - Received Data" shows empty or undefined fields

**Solution:** Check the form submission in `app/page.tsx`:
```typescript
// Line 261 in app/page.tsx
const response = await fetch('/api/send-email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ ...formData, hasDiscount }),
})
```

Verify that `formData` contains all the values before submission.

#### Problem B: Wrong field format for Gravity Forms
**Symptom:** Response Status shows 400 Bad Request or validation error

**Possible Solutions:**

Gravity Forms API v1 accepts different field formats depending on the installation. Try these alternatives:

**Option 1: Use numeric field IDs instead of input_X**

Edit `app/api/send-email/route.ts` (line 240-248):
```typescript
const gravityFormsFieldData = {
  '1': name,           // Instead of input_1
  '2': email,          // Instead of input_2
  '3': phone,          // Instead of input_3
  '4': fromZip,        // Instead of input_4
  '5': toZip,          // Instead of input_5
  '6': moveDate,       // Instead of input_6
  '7': moveSize,       // Instead of input_7
  '8': hasDiscount ? 'Yes' : 'No', // Instead of input_8
}
```

**Option 2: Use decimal notation**

Some Gravity Forms installations require decimal notation for sub-fields:
```typescript
const gravityFormsFieldData = {
  '1.3': name,  // Field 1, input 3 (for name fields)
  '1.6': name,  // Or field 1, input 6 (depends on field type)
  '2': email,
  '3': phone,
  // ... etc
}
```

#### Problem C: Wrong form ID
**Symptom:** Response Status shows 404 Not Found

**Solution:** Verify the correct form ID in your WordPress admin:
1. Go to WordPress → Forms
2. Hover over your form to see the ID in the URL
3. Update the `GRAVITY_FORMS_ID` in your `.env.local` file

#### Problem D: Authentication failure
**Symptom:** Response Status shows 401 Unauthorized

**Solution:** Verify your API credentials in `lib/gravityforms.ts`:
```typescript
export const gravityFormsConfig: GravityFormsConfig = {
  baseUrl: 'https://www.atlantafurnituremovers.com/gravityformsapi',
  publicKey: '0b7fbd1824',
  privateKey: '27842c3fdf765bd',
}
```

### 3. Test with curl

To test if the API credentials work, try this curl command:

```bash
# Replace the values with your actual credentials
PUBLIC_KEY="0b7fbd1824"
PRIVATE_KEY="27842c3fdf765bd"
FORM_ID="1"
BASE_URL="https://www.atlantafurnituremovers.com/gravityformsapi"

# Calculate signature (you'll need to use a script for this)
# For testing, you can also use the built-in test function
```

### 4. Use WordPress Gravity Forms Testing

The most reliable way to find the correct field format:

1. In WordPress admin, go to Forms → Your Form
2. Click "Preview"
3. Fill out the form and submit
4. Go to Forms → Entries
5. Click on the entry and view "Entry Details"
6. Note the field IDs shown (e.g., "1", "2", "3" or "input_1", "input_2")

## Common Field Format Variations

### Format 1: input_X (Current Implementation)
```json
{
  "input_1": "John Doe",
  "input_2": "john@example.com",
  "input_3": "555-1234"
}
```

### Format 2: Numeric IDs
```json
{
  "1": "John Doe",
  "2": "john@example.com",
  "3": "555-1234"
}
```

### Format 3: Decimal notation (for complex fields)
```json
{
  "1.3": "John",
  "1.6": "Doe",
  "2": "john@example.com",
  "3": "555-1234"
}
```

### Format 4: Nested structure (some API versions)
```json
{
  "1": {
    "3": "John",
    "6": "Doe"
  },
  "2": "john@example.com",
  "3": "555-1234"
}
```

## Quick Fix: Manual Field Mapping

To quickly test which format works, edit `app/api/send-email/route.ts`:

```typescript
// Try each format one at a time
const formats = [
  // Format 1: input_X (current)
  {
    input_1: name,
    input_2: email,
    input_3: phone,
    input_4: fromZip,
    input_5: toZip,
    input_6: moveDate,
    input_7: moveSize,
    input_8: hasDiscount ? 'Yes' : 'No',
  },

  // Format 2: Numeric
  {
    '1': name,
    '2': email,
    '3': phone,
    '4': fromZip,
    '5': toZip,
    '6': moveDate,
    '7': moveSize,
    '8': hasDiscount ? 'Yes' : 'No',
  },
]

// Test with formats[0] first, then formats[1], etc.
const gravityFormsFieldData = formats[0] // Change index to test
```

## SOLUTION: Get Your Actual Field IDs

**The issue is that your form's field IDs might not be 1, 2, 3, 4, 5, 6, 7, 8.**

You need to find the **exact field IDs** from your Gravity Forms installation:

### Method 1: WordPress Admin Panel (EASIEST)
1. Log into WordPress
2. Go to **Forms → Your Form → Edit**
3. Click on each field (Name, Email, Phone, etc.)
4. In the field settings panel on the right, note the **Field ID** number
5. Update the code with the correct IDs

Example: If your "Name" field shows "Field ID: 5", then use:
```typescript
'5': name,  // Instead of '1': name
```

### Method 2: Inspect Form HTML
1. Go to the form on your website
2. Right-click → Inspect Element
3. Look for input field IDs like `input_1_5` (means field ID is 5)

### Method 3: Use Built-in Helper Endpoint (NEW - EASIEST!)
We've created a helper endpoint that automatically fetches your form structure!

1. Start your dev server: `npm run dev`
2. Visit in your browser: `http://localhost:3000/api/gravity-forms-info?formId=3`
3. You'll see a JSON response with all field IDs and labels:

```json
{
  "success": true,
  "formId": "1",
  "title": "Moving Quote Form",
  "fields": [
    { "id": "1", "label": "Name", "type": "text" },
    { "id": "2", "label": "Email", "type": "email" },
    { "id": "3", "label": "Phone", "type": "phone" },
    ...
  ]
}
```

4. Use these exact IDs in your code!

### Method 4: Direct API Call
Use this curl command (replace the signature):

```bash
curl "https://www.atlantafurnituremovers.com/gravityformsapi/forms/3?api_key=0b7fbd1824&signature=YOUR_SIGNATURE&expires=TIMESTAMP"
```

This returns the form structure with all field IDs and their labels.

### Method 4: Check Existing Entries
1. Forms → Entries
2. View any existing entry
3. The field labels will show their IDs (e.g., "Field 12: Name")

---

## Quick Fix: Update Field IDs

Once you know the correct field IDs, update [app/api/send-email/route.ts:247-256](app/api/send-email/route.ts#L247-L256):

```typescript
const gravityFormsFieldData = {
  '12': name,      // Replace 1 with your actual Name field ID
  '13': email,     // Replace 2 with your actual Email field ID
  '14': phone,     // Replace 3 with your actual Phone field ID
  '15': fromZip,   // Replace 4 with your actual From Zip field ID
  '16': toZip,     // Replace 5 with your actual To Zip field ID
  '17': moveDate,  // Replace 6 with your actual Move Date field ID
  '18': moveSize,  // Replace 7 with your actual Move Size field ID
  '19': hasDiscount ? 'Yes' : 'No', // Replace 8 with your actual Discount field ID
}
```

## Next Steps

1. **Run a test submission** and check the server logs
2. **Identify where the failure occurs** using the log messages
3. **Try different field formats** if it's a field mapping issue
4. **Verify API credentials** if you get 401/403 errors
5. **Confirm form ID** if you get 404 errors

## Need More Help?

If you're still having issues:

1. Share the **complete log output** from the server console
2. Provide the **error message** from the Gravity Forms API response
3. Confirm your **Gravity Forms version** (Forms → Settings → Info)
4. Check if **REST API is enabled** in Gravity Forms settings

## Alternative: Use Gravity Forms Webhooks

If the REST API continues to have issues, consider using Gravity Forms webhooks instead:

1. In WordPress: Forms → Settings → Webhooks
2. Create a new webhook pointing to your app
3. Your app receives form submissions via webhook
4. This bypasses the need for API authentication

Let me know which error you encounter, and I can help you fix it!
