# Furniture Taxi - Moving Request Form

A modern, single-page Next.js application for collecting moving requests.

## Features

- Clean and modern UI with Tailwind CSS
- Fully responsive design
- Form validation
- All required fields marked with asterisks
- Date picker for move date
- Dropdown for move size selection
- Form submission with success message
- **Supabase Integration**: Pre-populate form with data using URL parameter `?code=YOUR_CODE`
  - Checks `discount` table for matching code
  - Falls back to `referral` table if not found in discount
  - Auto-fills Name, Email, and Phone fields when code is found

## Getting Started

First, install the dependencies:

```bash
npm install
# or
yarn install
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Form Fields

- **Name*** - Text input for customer's name
- **E-mail*** - Email input with validation
- **Phone*** - Phone number input
- **Moving From Zip Code*** - 5-digit zip code
- **Moving To Zip Code*** - 5-digit zip code
- **Move Date*** - Date picker (MM/DD/YYYY format)
- **Move Size*** - Dropdown with options (Studio, 1-4+ Bedroom, Office, Storage Unit)

## Build for Production

```bash
npm run build
npm start
```

## Technologies Used

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS


