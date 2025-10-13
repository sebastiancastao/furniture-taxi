# Setup Guide - Resend Email Integration

## ✅ What's Been Done

Your application now has **complete email integration** with Resend API! Here's what was added:

### 1. Email API Route (`app/api/send-email/route.ts`)
- Sends **two emails** on form submission:
  - **Customer Confirmation Email**: Beautiful HTML email with move details and $50 discount badge (if applicable)
  - **Admin Notification Email**: Email to your business with all customer information

### 2. Updated Form Submission (`app/page.tsx`)
- Form now calls the email API when submitted
- Tracks discount status (`hasDiscount`) from code lookup
- Shows success message after email is sent
- Better error handling

### 3. Discount Amount Display
- When a valid code is found (from `discount` or `referral` tables):
  - Shows "$50 OFF" in the success message
  - Includes discount badge in emails
  - Passes discount info to the email API

## 🔧 What You Need to Do

### Step 1: Get Your Resend API Key

1. Go to [resend.com](https://resend.com) and sign up
2. Navigate to **API Keys** section
3. Click **Create API Key**
4. Copy the API key

### Step 2: Update .env.local

Open `.env.local` file and replace `your_resend_api_key_here` with your actual API key:

```env
NEXT_PUBLIC_SUPABASE_URL=https://mnpovhuuvaexevcbrirh.supabase.co
NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ucG92aHV1dmFleGV2Y2JyaXJoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDEzMTMyNiwiZXhwIjoyMDc1NzA3MzI2fQ.l2o12pOpW1Fgz2cRmcVT9ZqKIOe5b_tGII6rvaRxzvc
RESEND_API_KEY=re_your_actual_api_key_here
```

### Step 3: Configure Email Addresses

Open `app/api/send-email/route.ts` and update these lines:

**Line 125 - Change the "from" email:**
```typescript
from: 'Furniture Taxi <onboarding@resend.dev>', // Change this to your verified domain
```

**Important:** 
- Use `onboarding@resend.dev` for testing (works immediately)
- For production, verify your domain in Resend and use: `Furniture Taxi <noreply@yourdomain.com>`

**Line 126 - Change the admin email:**
```typescript
to: ['admin@furnituretaxi.com'], // Change to your actual admin email
```

Replace with your business email where you want to receive booking notifications.

### Step 4: Restart the Server

After updating `.env.local`:

```bash
# Stop the current server (Ctrl+C or kill the process)
npm run dev
```

## 📧 Email Features

### Customer Email Includes:
- ✅ Personalized greeting
- ✅ Move details (from/to zip, date, size)
- ✅ $50 discount banner (if code was used)
- ✅ Contact information
- ✅ Professional branding

### Admin Email Includes:
- ✅ All customer information (name, email, phone)
- ✅ Complete move details
- ✅ Discount status highlighted
- ✅ Easy-to-read formatted layout

## 🎨 Email Templates

The emails use beautiful HTML templates with:
- Professional design
- Responsive layout
- Color-coded sections
- Discount badges when applicable

## 🧪 Testing

### Test Without Discount:
1. Visit: `http://localhost:3000`
2. Fill out the form
3. Submit
4. Check both emails (customer + admin)

### Test With Discount:
1. Visit: `http://localhost:3000/?code=YOUR_CODE`
2. Form pre-fills with name, email, phone
3. Complete the remaining fields
4. Submit
5. Emails will include the $50 discount badge

## 📝 Notes

- **Resend Free Tier**: 100 emails/day, 3,000 emails/month
- **Testing**: Use `onboarding@resend.dev` as sender (no domain verification needed)
- **Production**: Verify your domain in Resend for better deliverability
- **Discount**: Currently hardcoded to $50 USD (can be made dynamic if needed)

## 🔍 Troubleshooting

**Emails not sending?**
- Check your Resend API key is correct in `.env.local`
- Restart the dev server after updating `.env.local`
- Check the browser console for errors
- Verify the API route is accessible at `/api/send-email`

**Admin not receiving emails?**
- Update the `to:` address in `app/api/send-email/route.ts` line 126
- Make sure it's not in spam folder

**Customer not receiving emails?**
- Check the email address entered in the form
- Verify Resend account is active
- Check Resend dashboard for delivery logs

## Environment Variables Setup

To send emails via Resend, you must add your API credentials as environment variables. Follow these steps:

1. In the root of your project, create a file named `.env.local` if it does not already exist.

2. Add the following lines to `.env.local` (replace these values with your actual keys if different):

```
RESEND_API_KEY=b820d9d6ddda49b3b682219983054087
RESEND_CLIENT_ID=4434d301-bc23-4492-9fd7-60b5b9fa9ad8
```

- `RESEND_API_KEY` is required for your backend (API route) to send mail via Resend.
- The client ID (`RESEND_CLIENT_ID`) can be referenced in the Frontend if you need to, or for dashboard/API purposes.

**Note:** Never commit `.env.local` to source control. It is already ignored by default by Next.js templates. If not, add `.env.local` to your `.gitignore` file.

---




