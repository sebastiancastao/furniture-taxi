# Gravity Forms - Quick Fix Guide

## Problem Identified

Your Gravity Forms integration is **almost working**!

✅ Authentication: **SUCCESS** (API keys are correct)
❌ Field IDs: **INCORRECT** (the field IDs 1-8 don't match your form)

## Current Error
```
Response Status: 200 OK
Response Body: { status: 400, response: 'Bad request' }
```

This means the API accepts your request but rejects the field data because the field IDs are wrong.

---

## Solution: 3 Easy Steps

### Step 1: Discover Your Actual Field IDs

**Option A: Use Our Helper Tool (Easiest)**

1. Make sure your dev server is running:
   ```bash
   npm run dev
   ```

2. Open your browser and go to:
   ```
   http://localhost:3000/api/gravity-forms-info?formId=3
   ```

   (Note: Your form ID is 3, not 1)

3. You'll see all your field IDs! Example:
   ```json
   {
     "fields": [
       { "id": "1", "label": "Name" },
       { "id": "2", "label": "Email" },
       { "id": "5", "label": "Phone" },
       { "id": "7", "label": "From Zip" },
       ...
     ]
   }
   ```

**Option B: Check WordPress Admin**

1. Log into WordPress
2. Go to **Forms → Your Form → Edit**
3. Click each field and note the "Field ID" in the settings panel

---

### Step 2: Update the Field IDs in Your Code

Open the file: `app/api/send-email/route.ts`

Find line 247 (the `gravityFormsFieldData` object) and update with YOUR actual field IDs:

**Before (Current - WRONG):**
```typescript
const gravityFormsFieldData = {
  '1': name,
  '2': email,
  '3': phone,
  '4': fromZip,
  '5': toZip,
  '6': moveDate,
  '7': moveSize,
  '8': hasDiscount ? 'Yes' : 'No',
}
```

**After (Example with correct IDs):**
```typescript
const gravityFormsFieldData = {
  '1': name,      // If Name is field ID 1
  '2': email,     // If Email is field ID 2
  '5': phone,     // If Phone is field ID 5 (not 3!)
  '7': fromZip,   // If From Zip is field ID 7 (not 4!)
  '8': toZip,     // etc...
  '9': moveDate,
  '10': moveSize,
  '12': hasDiscount ? 'Yes' : 'No',
}
```

**Important:** Use the EXACT field IDs from Step 1!

---

### Step 3: Test Again

1. Save the file
2. Submit a test form at: `http://localhost:3000?code=YOUR_CODE`
3. Check the server logs - you should see:
   ```
   Response Status: 200 OK
   Gravity Forms API success response: { is_valid: true, ... }
   ```

4. Verify the entry appears in WordPress: Forms → Entries

---

## Alternative: If Field IDs Still Don't Work

Sometimes Gravity Forms has complex field structures (like Name fields with First/Last subfields). Try these alternatives:

### Check for Subfield IDs

Name fields often have subfields like:
- `1.3` = First Name
- `1.6` = Last Name

Address fields have:
- `X.1` = Street
- `X.2` = Address Line 2
- `X.3` = City
- `X.4` = State
- `X.5` = Zip

Update your code to use decimal notation:
```typescript
const gravityFormsFieldData = {
  '1.3': name,  // First Name subfield
  '2': email,
  '3': phone,
  ...
}
```

---

## Testing Checklist

- [ ] I ran the helper endpoint: `/api/gravity-forms-info?formId=1`
- [ ] I noted all the field IDs
- [ ] I updated `app/api/send-email/route.ts` with correct IDs
- [ ] I restarted the dev server
- [ ] I tested with a form submission
- [ ] I checked server logs for success
- [ ] I verified entry in WordPress admin

---

## Still Having Issues?

If you're still getting errors, share:

1. The output from `/api/gravity-forms-info?formId=1`
2. The server log output from a test submission
3. A screenshot of your form structure in WordPress

I'll help you map the fields correctly!

---

## Quick Reference

| File | What to Update |
|------|----------------|
| `app/api/send-email/route.ts` | Line 247: Field IDs |
| Check field structure | `http://localhost:3000/api/gravity-forms-info?formId=1` |
| View logs | Terminal where `npm run dev` is running |
| Verify entries | WordPress → Forms → Entries |
