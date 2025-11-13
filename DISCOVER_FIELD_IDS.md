# Discover Field IDs for Form 3

## The Problem

Your submission shows:
```json
{
  "1": "test",
  "2": "test@testing.com",
  "3": "111111111111",
  "4": "11111",
  "5": "67809",
  "6": "2025-12-01",
  "7": "1-bedroom",
  "8": "No"
}
```

But Gravity Forms returns: `{ status: 400, response: 'Bad request' }`

This means **field IDs 1-8 don't exist in form 3**.

---

## Solution: Find the Real Field IDs

### Option 1: Use the Helper Endpoint (Easiest)

1. Make sure your dev server is running
2. Open your browser and visit:
   ```
   http://localhost:3000/api/gravity-forms-info?formId=3
   ```

3. Look at the JSON response - it will show you ALL the field IDs

4. Example response:
   ```json
   {
     "success": true,
     "formId": "3",
     "title": "Your Form Name",
     "fields": [
       { "id": "10", "label": "Name", "type": "text" },
       { "id": "11", "label": "Email", "type": "email" },
       { "id": "12", "label": "Phone", "type": "phone" },
       { "id": "15", "label": "From Zip", "type": "text" },
       { "id": "16", "label": "To Zip", "type": "text" },
       { "id": "20", "label": "Move Date", "type": "date" },
       { "id": "21", "label": "Move Size", "type": "select" },
       { "id": "25", "label": "Discount", "type": "text" }
     ]
   }
   ```

5. Copy those exact field IDs and tell me what they are!

---

### Option 2: Check WordPress Admin

1. Log into WordPress admin
2. Go to **Forms → Select Form 3 → Edit**
3. Click on each field (Name, Email, Phone, etc.)
4. Look at the **Field ID** in the settings panel on the right
5. Write down all 8 field IDs

---

### Option 3: Inspect the Form HTML

1. Visit the form on your website: `https://www.atlantafurnituremovers.com/form-3/`
2. Right-click → Inspect Element
3. Look for input elements with IDs like `input_3_X` where X is the field ID
   - Example: `input_3_10` means field ID is 10
   - Example: `input_3_15` means field ID is 15

---

## Once You Have the Field IDs

Tell me the field IDs and I'll update the code immediately!

For example, if you find:
- Name = Field 10
- Email = Field 11
- Phone = Field 12
- From Zip = Field 15
- To Zip = Field 16
- Move Date = Field 20
- Move Size = Field 21
- Discount = Field 25

I'll update the code to:
```typescript
const gravityFormsFieldData = {
  '10': name,
  '11': email,
  '12': phone,
  '15': fromZip,
  '16': toZip,
  '20': moveDate,
  '21': moveSize,
  '25': hasDiscount ? 'Yes' : 'No',
}
```

---

## Quick Test

Visit this URL right now and share what you see:
```
http://localhost:3000/api/gravity-forms-info?formId=3
```

Share the JSON response with me!
