# WeatherWiseCampsites

A Node.js + Express application that integrates Supabase, Geoapify, and weather APIs to help users find campsites with good weather conditions.

## Prerequisites
- [Node.js](https://nodejs.org/) (v18+ recommended)  
- npm (comes with Node)

## Installation
Clone the repository and install dependencies:

```bash
git clone https://github.com/fjc-22233580/WeatherWiseCampsites.git
cd WeatherWiseCampsites
npm install
```

### Core Dependencies
- express - Web framework for building APIs.
- cors - Enable cross-origin requests.
- dotenv - Load environment variables from `.env`.
- axios - Prise-based HTTP cient for API calls.
- `@supabase/supabase-js` - Supabase client library.

### Dev Dependency
- nodemon - Auto-restart server during development.

### Environment Variables

Create a `.env` file in the project root based on the shared in the project report.

### Running the App

Start the development server with hot reload:

```bash
npm run dev
```

or, in production mode:

```bash
npm start
```
