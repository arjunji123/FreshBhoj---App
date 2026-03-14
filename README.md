# FreshBhoj

## App Structure

```bash
src/
├── app/                  # App-wide configuration (routes, providers)
│   ├── MainApp.tsx       # Main App Component
│   ├── navigation/       # Root navigators (Stacks, Tabs)
│   │   ├── AppNavigator.tsx
│   │   ├── private/      # Protected routes
│   │   └── public/       # Public routes (Auth, Onboarding)
│   └── theme/            # Colors, typography, spacing
│       ├── colors.ts
│       ├── index.ts
│       ├── spacing.ts
│       └── typography.ts
├── components/           # Global reusable UI (Buttons, Inputs, Cards)
│   ├── AppGradient.tsx
│   ├── GlassButton.tsx
│   └── SplashScreen.tsx
├── features/             # The core of your app. Group code by "business logic"
│   ├── authentication/   # Authentication feature
│   │   ├── screens/      # Login, OTPScreen
│   │   ├── components/
│   │   └── hooks/
│   ├── home/             # Home feature
│   │   └── screens/      # Home Screen
│   └── onboarding/       # Onboarding feature
│       ├── screens/      # OnboardingScreen
│       ├── components/   # OnboardingSlide, OnboardingPaginator
│       └── constants/    # onboardingData
└── utils/                # Helper functions
```

## Getting Started

### Prerequisites

- Node.js and npm installed
- Android SDK (for Android development)
- Xcode (for iOS development)

### Installation

```bash
npm install
```

### Connect Your Device or Emulator

```bash
adb devices # shows all connected devices
```

```bash
adb pair IP:PORT # connect own device
```

```bash
adb reverse tcp:8081 tcp:8081 # reverse port for metro server fast refresh | for personal device only
```

## Run the App

### Android

```bash
npm run android:dev
```

### Android Flavors

FreshBhoj now uses `react-native-config` with three Android product flavors:

- `dev` -> `.env.dev`
- `stage` -> `.env.stage`
- `prod` -> `.env.prod`

Available commands:

```bash
npm run android:dev
npm run android:stage
npm run android:prod
npm run android:dev:release
npm run android:stage:release
npm run android:prod:release
```

Update the `.env.*` files in the project root with your actual values before building.

Example JS usage:

```ts
import Config from 'react-native-config';

console.log(Config.APP_ENV);
console.log(Config.API_BASE_URL);
```

### iOS

```bash
npx react-native run-ios
```
