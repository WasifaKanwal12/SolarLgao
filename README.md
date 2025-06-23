
Project Structure


└── SolarWebApp/
    ├── .env
    ├── package.json
    ├── README.md
    ├── public/
    └── src/
        ├── app/
        │   ├── admin/
        │   ├── api/
        │   │   ├── auth/
        │   │   │   ├── signin/
        │   │   │   │   ├── emailPassword/
        │   │   │   │   └── google/
        │   │   │   ├── signup/
        │   │   │   └── verification/
        │   │   ├── chatbot/
        │   │   ├── orders/
        │   │   ├── providers/
        │   │   ├── recommendation/
        │   │   ├── reviews/
        │   │   ├── spreadsheet/
        │   │   └── users/
        │   ├── customer/
        │   ├── provider/
        │   ├── recommendation/
        │   ├── signin/
        │   ├── signup/
        │   ├── pending-approval/
        │   ├── pendingVerification/
        │   ├── unauthorized/
        │   ├── globals.css
        │   ├── layout.js
        │   └── page.js
        ├── components/
        └── lib/


Getting Started

Prerequisites:
Node.js (v18 or later)
npm (v9 or later)
Firebase account
Google Cloud account (for Gemini API)
FastAPI backend (for solar calculations)

Installation:

Clone the repository:

git clone https://github.com/yourusername/solar-energy-app.git
cd solar-energy-app
Install dependencies:

npm install

Set up environment variables:

Create a .env file in the root directory

Add the following variables:

NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_firebase_measurement_id
GEMINI_API_KEY=your_gemini_api_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
FASTAPI_BACKEND_URL=http://localhost:8000

Start the development server:

npm run dev


Features:

For Customers:

Get personalized solar system recommendations based on location and energy usage
Connect with verified solar providers
View estimated costs and savings
Export recommendations to Google Sheets
User authentication and profile management

For Providers:

Dashboard to manage services and orders
Customer management tools
Service tracking and analytics
Profile verification system

Technical Highlights:

Next.js 14 with App Router
Firebase Authentication
Google Spreadsheet API
Google Gemini API for chatbot
FastAPI backend for solar calculations
Google Sheets integration
Responsive design with Tailwind CSS


Deployment:
Vercel Deployment:

Push your code to a GitHub repository
Create a new project in Vercel
Connect your GitHub repository
Add all environment variables
Deploy!