# Beverage Tracker App

A cross-platform mobile application (Android & iOS) built with React Native and Expo for tracking your beverage consumption throughout the day with statistics and multilingual support.

## Features

✨ **Core Features:**
- **Easy Logging**: One-tap beverage consumption logging with instant counters
- **Time Tracking**: Automatic timestamp recording for each consumption
- **Smart Statistics**: View daily, weekly, monthly, and yearly consumption data
- **Progress Bars**: Visual representation of consumption patterns
- **Bilingual Support**: English and Portuguese language options
- **Local Storage**: All data stored securely on your device using AsyncStorage
- **No Internet Required**: Works completely offline

## Tech Stack

- **React Native 0.81.5** - Cross-platform mobile development framework
- **Expo 54** - Development platform and build service
- **Expo Router** - File-based navigation
- **TypeScript** - Type-safe code
- **AsyncStorage** - Local data persistence
- **i18n-js** - Multilingual support

## Getting Started

### Prerequisites
- Node.js 18 or higher
- npm or yarn package manager
- (Optional) Android Studio for Android development
- (Optional) Xcode for iOS development (macOS only)

### Installation

1. Clone or navigate to the project directory:
```bash
cd beverage-app
```

2. Install dependencies:
```bash
npm install
```

### Running the App

#### Web (Recommended for testing)
```bash
npm run web
```
Opens the app in your web browser at `http://localhost:19006`

#### Android
```bash
npm run android
```
Requires Android Studio and a connected device or emulator

#### iOS
```bash
npm run ios
```
Requires macOS, Xcode, and a connected device or simulator

#### Expo Go (Quick testing)
```bash
npm start
```
Then use the Expo Go app on your device to scan the QR code

## Available Scripts

- `npm start` - Start the Expo development server
- `npm run web` - Run on web browser
- `npm run android` - Run on Android device/emulator
- `npm run ios` - Run on iOS device/simulator
- `npm run lint` - Run ESLint to check code quality
- `npm run reset-project` - Reset to a fresh project state

## Project Structure

```
app/
├── (tabs)/
│   ├── _layout.tsx        # Tab navigation configuration
│   ├── index.tsx          # Beverage tracker home screen
│   ├── explore.tsx        # Statistics screen
│   └── settings.tsx       # Settings & language selection
├── _layout.tsx            # Root layout
└── modal.tsx              # Modal screen

components/
├── BeverageTracker.tsx    # Main tracker component
├── Statistics.tsx         # Statistics display component
└── Settings.tsx           # Settings component

constants/
├── localization.ts        # i18n translations (EN, PT)
├── storage.ts             # AsyncStorage service & types
└── theme.ts               # Color and theme configuration
```

## How to Use

1. **Add Beverages**: Click "Add Beverage" to create new beverage types
2. **Log Consumption**: Tap any beverage button to log consumption (count increments)
3. **Remove Beverages**: Long-press a beverage button to delete it
4. **View Statistics**: Switch to the Statistics tab to see usage data
5. **Change Language**: Go to Settings and select your preferred language

## Data Storage

All data is stored locally on your device:
- Beverage list
- Consumption logs with exact timestamps
- Language preference
- No data is sent to any server

## Multilingual Support

Currently supports:
- **English** (en)
- **Portuguese** (pt)

To add more languages:
1. Edit `constants/localization.ts`
2. Add translations for new language
3. Update language options in `components/Settings.tsx`

## Future Enhancements

- 📊 Advanced analytics and charts
- 📱 Push notifications for consumption reminders
- 💾 Data export functionality (CSV, PDF)
- ☁️ Cloud sync across devices
- 🎯 Consumption goals and achievements
- 📸 Photo logging capabilities

## Development Tips

- Use `npm start` for interactive Expo menu
- Press `a` in terminal to open Android emulator
- Press `i` in terminal to open iOS simulator
- Press `w` in terminal to open web version
- Enable Fast Refresh in Expo settings for faster development

## Troubleshooting

### App won't start
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Port already in use
```bash
# Kill process on port 19006
npx kill-port 19006
```

### TypeScript errors
```bash
# Check for type errors
npx tsc --noEmit
```

## License

MIT License - feel free to use this project as a base for your own apps!

## Support

For issues or questions, please refer to:
- [Expo Documentation](https://docs.expo.dev)
- [React Native Documentation](https://reactnative.dev)
- [TypeScript Documentation](https://www.typescriptlang.org)

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
