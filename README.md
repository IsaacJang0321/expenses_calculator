# Trip Expenses Calculator

A Next.js web application for calculating work trip expenses with route selection, vehicle details, and cost breakdown.

## Features

- 🗺️ Route selection using Naver Map API
- 🚗 Vehicle selection with auto-filled fuel efficiency
- ⛽ Real-time fuel price display
- 💰 Cost calculation (fuel, tolls, additional expenses)
- 🌙 Dark mode support
- 📱 Responsive design

## Setup

1. Install dependencies:
```bash
npm install
```

2. **Optional - For real route data**: Set up Naver Map API credentials:
   - Copy `.env.local.example` to `.env.local`
   - Add your Naver Map API credentials:
     ```
     NEXT_PUBLIC_NAVER_CLIENT_ID=your_client_id
     NEXT_PUBLIC_NAVER_CLIENT_SECRET=your_client_secret
     ```
   - Get credentials from [Naver Cloud Platform](https://www.ncloud.com/)
   - Enable "Directions API" service
   - **Note**: The app works with mock data if credentials are not set up, so you can test it without API keys!

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. Enter departure and destination locations
2. Select a recommended route
3. Choose your vehicle (brand and model)
4. Add any additional expenses (parking, meals, etc.)
5. View the cost breakdown

## Tech Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS
- Naver Map API

## Notes

- Fuel prices are currently using mock data. Replace with actual Korean fuel price API in `app/lib/fuelPrice.ts`
- Vehicle data includes common Korean vehicles. You can extend the list in `app/lib/vehicleData.ts`
