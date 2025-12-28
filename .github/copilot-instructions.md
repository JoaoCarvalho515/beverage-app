# Beverage Tracker App - Project Instructions

## Project Overview
A cross-platform mobile app (Android & iOS) built with React Native and Expo for tracking beverage consumption with multilingual support (English & Portuguese), daily statistics, and timestamp logging.

## Key Features
- Multiple beverage buttons with click counters
- Daily, weekly, monthly, and yearly statistics
- Timestamp logging for each consumption
- Bilingual support (English & Portuguese)
- Local data persistence using AsyncStorage
- Progress visualization for consumption tracking

## Project Structure
```
app/
  (tabs)/
    _layout.tsx       - Tab navigator configuration
    index.tsx         - Beverage tracker screen
    explore.tsx       - Statistics screen
    settings.tsx      - Settings screen
components/
  BeverageTracker.tsx - Main beverage logging component
  Statistics.tsx      - Statistics display component
  Settings.tsx        - Language settings component
constants/
  localization.ts     - i18n configuration and translations
  storage.ts          - AsyncStorage service for data persistence
  theme.ts            - Theme configuration
```

## Setup Status

- [x] Verify copilot-instructions.md creation
- [x] Scaffold the React Native Expo project
- [x] Create app structure and components
- [x] Install required dependencies
- [x] Compile and test the project
- [x] Update documentation

## Development Guidelines
- Use Expo for cross-platform development
- Use AsyncStorage for local data persistence
- Implement i18n for multilingual support
- Follow React Native best practices

## Running the App

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Installation
```bash
npm install
```

### Development Server
```bash
# Web
npm run web

# Android
npm run android

# iOS
npm run ios
```

### Available Scripts
- `npm start` - Start the development server
- `npm run web` - Run on web browser
- `npm run android` - Run on Android device/emulator
- `npm run ios` - Run on iOS device/simulator (requires macOS)
- `npm run lint` - Run ESLint

## Technologies Used
- **React Native 0.81.5** - Cross-platform mobile framework
- **Expo 54** - Development platform
- **Expo Router 6** - File-based routing
- **AsyncStorage 2.1** - Local data persistence
- **i18n-js 4.4** - Multilingual support
- **TypeScript 5.9** - Type safety

## Data Storage
The app uses AsyncStorage to persist:
- List of beverages
- Consumption logs with timestamps
- User preferences (language selection)

## Multilingual Support
Currently supports:
- **English** (en)
- **Portuguese** (pt)

Add new languages by updating `constants/localization.ts`

## Next Steps
- Test on actual devices
- Add more beverages to default list
- Implement data export functionality
- Add charts and graphs for better visualization
- Implement backup/sync functionality

