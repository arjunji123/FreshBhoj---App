# FreshBhoj

## App Structure

```
src/
├── app/                  # App-wide configuration (routes, providers)
│   ├── App.tsx           # Entry point
│   ├── navigation/       # Root navigators (Stacks, Tabs)
│   └── theme/            # Colors, typography, spacing
├── components/           # Global reusable UI (Buttons, Inputs, Cards)
│   ├── Button/
│   │   ├── Button.tsx
│   │   └── Button.styles.ts
│   └── Typography.tsx
├── features/             # The core of your app. Group code by "business logic"
│   ├── auth/             # Authentication feature
│   │   ├── screens/      # Screens specific to Auth (Login, Register)
│   │   ├── components/   # Components specific to Auth (LoginForm)
│   │   ├── hooks/        # Auth logic hooks (useLogin)
│   │   └── authStore.ts  # State management for this feature
│   └── dashboard/
│       ├── screens/
│       └── ...
├── hooks/                # Global hooks (useTheme, useOnlineStatus)
├── services/             # API configuration and external services
│   ├── api.ts            # Axios instance or fetch wrapper
│   └── storage.ts        # Wrappers for MMKV/Keychain
├── utils/                # Helper functions (date formatting, validation)
└── assets/               # Images, fonts, SVGs
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

## Run the App

### Android
```bash
npx react-native run-android
```

### iOS
```bash
npx react-native run-ios
```