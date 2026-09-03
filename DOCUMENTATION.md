# FreshBhoj - Technical Documentation

## 1. Project Overview

### IMPORTANT
This app has only been tested on Android due to limitation of hardware.
For IOS you would have to `pod install` and resolve linking of all native dependencies and node packages

### Description
FreshBhoj is a React Native food discovery and ordering application. The current implementation establishes app shell, navigation, theme system, and reusable components that will later connect to backend APIs.

### Current Status
Phase 1 MVP complete: design system, full customer journey (onboarding → discovery
→ meal detail → cart → checkout → tracking → history → kitchen profile → account),
a shoppable reels Food Feed, and end-to-end integration with the NestJS backend.

See [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) for tokens and the component library, and
`../freshbhoj backend/API.md` for the API contract.

### Primary Tech Stack
- React Native 0.84.0
- React 19.2.3
- React Navigation (native stack + bottom tabs)
- Styling with React Native StyleSheet + centralized theme tokens
- Zustand + MMKV (local persisted UI/auth state)
- TanStack Query (server state, caching, infinite lists, optimistic updates)
- Reanimated 4 (collapsing header, success animations, skeletons)
- Zod (input validation)

## 2. Prerequisites and Installation

### Prerequisites
- Node.js version 22.11.0 or newer
- npm
- React Native development environment:
  - Android Studio (Android builds)
  - Xcode and CocoaPods (iOS builds on macOS)
- Java JDK configured with JAVA_HOME (Android)
- Ruby 2.6.10+ and CocoaPods (for iOS dependency setup)

### Installation Steps
1. Clone the repository.
2. Install JavaScript dependencies:
   - npm install
3. Configure environment file(s):
   - Create and update .env, .env.dev, .env.stage, and .env.prod as needed.
4. iOS only (macOS):
   - bundle install
   - cd ios
   - bundle exec pod install
   - cd ..
5. Start Metro:
   - npm run start
6. Run Android (default dev flavor):
   - npm run android
7. Run iOS:
   - npm run ios

### Useful Scripts
- npm run start
- npm run start:remote
- npm run android
- npm run android:dev
- npm run android:stage
- npm run android:prod
- npm run android:dev:release
- npm run android:stage:release
- npm run android:prod:release
- npm run ios
- npm run lint
- npm run test

### Environment and Flavor Notes
- Base env variables are defined in .env:
  - APP_ENV
  - APP_NAME
  - API_BASE_URL — must include the `/api/v1` prefix.
    Android emulator: `http://10.0.2.2:3000/api/v1` (10.0.2.2 is the host machine).
    iOS simulator: `http://localhost:3000/api/v1`.
    Physical device: `http://<your-LAN-ip>:3000/api/v1`.
    If unset, `src/api/client.ts` falls back to the Android emulator URL.
- Android flavor to env mapping:
  - devDebug/devRelease -> .env.dev
  - stageDebug/stageRelease -> .env.stage
  - prodDebug/prodRelease -> .env.prod
- Product flavors configured: dev, stage, prod.

## 3. Folder Architecture

Top-level structure (important areas):
- android: Native Android project, build config, product flavors, signing, gradle setup.
- ios: Native iOS project, Podfile, Xcode project.
- assets: Static resources (fonts, images, icons).
- src: Main application source code.

Detailed src architecture:
- src/app
  - MainApp.tsx: App shell, splash gate, providers.
  - navigation: Route structure and stack/tab configuration.
  - theme: Global design tokens (colors, typography, spacing).
- src/components
  - Reusable cross-feature UI primitives (buttons, gradients, text, splash).
- src/features
  - Feature-first modules:
    - authentication
    - onboarding
    - home
- src/utils
  - Shared utilities such as MMKV storage adapter.

Architecture principle:
- Shared app infrastructure in src/app
- Shared presentational primitives in src/components
- Business/UI feature modules isolated in src/features

## 4. Screen Flow and Navigation

### App Entry Flow
1. index.js registers App.
2. App.tsx renders MainApp.
3. MainApp.tsx shows SplashScreen for 2500 ms.
4. After splash timeout, AppNavigator loads navigation container.

### Authentication Gate
- AppNavigator currently uses a temporary hardcoded flag:
  - isAuthenticated = false
- Result: app always enters PublicStack in current phase.

### Public Stack Flow
Screens in order:
1. Onboarding
2. Login
3. OTP

Transitions:
- Onboarding:
  - Next moves through slides.
  - Get Started navigates to Login.
- Login:
  - Continue navigates to OTP with phoneNumber parameter.
- OTP:
  - Displays verification UI and supports submit/resend handlers (currently placeholder logic).

### Private Stack Flow
- PrivateTabs currently contains:
  - Home tab
- Placeholder comment indicates future tabs:
  - Orders, Reels, Profile

## 5. Reusable Components (UI Library)

Core shared components in src/components:
- AppGradient
  - Wrapper around linear gradient with direction presets (vertical, horizontal, diagonal).
- GradientButton
  - Reusable CTA button with gradient background, icon slots, and disabled state.
- GradientText
  - Masked gradient text rendering for titles/highlights.
- GlassButton
  - Rounded translucent button style used for actions like Skip.
- AppButton
  - Generic button with optional right-side overlay image and right element slot.
- SplashScreen
  - Branded splash composition with gradient background and decorative plate imagery.

Primary feature component groups:
- Authentication components:
  - LoginTopSection, LoginTitle, LoginPhoneInput, SocialLogin, OTPHeader, OTPInputSection, LoginFooter
- Onboarding components:
  - OnboardingSlide, OnboardingPaginator

Theme system used by reusable components:
- colors.ts: palette, gradients, semantic colors
- typography.ts: role-based fonts and type scale
- spacing.ts: spacing scale, border radius, layout constants

## 6. Hardcoded Data Notes

The following data is currently hardcoded and should be externalized when backend integration starts.

### Hardcoded Copy and Validation Rules
- src/features/authentication/auth.constants.ts
  - Login/OTP strings
  - Country code
  - Validation messages
  - Numeric constraints (OTP length, phone length)
  - Layout ratios and offsets

### Hardcoded Onboarding Content
- src/features/onboarding/constants/onboardingData.ts
  - Slide titles, descriptions, CTA labels
  - Variant names and image references

### Hardcoded Navigation/Auth Placeholder
- src/app/navigation/AppNavigator.tsx
  - isAuthenticated is set to false as TEMP gate

### Hardcoded Splash Duration
- src/app/MainApp.tsx
  - Splash timeout is fixed at 2500 ms

### Hardcoded OTP Handler Behavior
- src/features/authentication/screens/OTPScreen.tsx
  - Submit/resend currently uses console logs only

### Hardcoded Social/Footer Actions
- src/features/authentication/components/SocialLogin.tsx
  - Social buttons are UI-only (no handler logic)
- src/features/authentication/components/LoginFooter.tsx
  - Terms/Privacy/Content Policy links are UI-only

## 7. State Management and Persistence

- Zustand store:
  - src/features/authentication/store/authStore.ts
- Persisted fields:
  - phoneNumber
  - rememberMe
- Storage backend:
  - MMKV via src/utils/mmkvStorage.ts
  - MMKV instance id: freshbhoj-storage

## 8. Assets Overview

Image assets used in current UI are stored in assets/images, including:
- onboarding plates/thali/reel artwork
- splash decorative plates
- login and OTP illustrations
- social icons (Google/Gmail)
- button overlay texture

Font assets are stored in assets/fonts and consumed through theme typography mapping.

## 9. Known UI-Phase Gaps

- API_BASE_URL is placeholder and no network layer is integrated.
- Auth gate is temporary and not connected to a real session/token state.
- OTP verification and resend are not connected to backend services.
- Social login and legal footer links are visual-only.
- Private area currently contains only Home tab; additional tabs are pending.

## 10. Next Implementation Priorities

1. Replace temporary auth gate with real authentication state from store/session.
2. Integrate API service layer and environment-aware base URL resolution.
3. Connect Login and OTP to real auth endpoints.
4. Add deep link / external navigation handlers for legal links.
5. Expand private tab screens and data-driven UI modules.

---

## 12. API Layer

All network access goes through `src/api`. Nothing else in the app calls `fetch`.

```
src/api/
  client.ts      fetch wrapper: base URL, bearer token, timeout, error normalisation,
                 and a single-flight refresh so parallel 401s don't race the
                 rotating refresh token
  tokenStore.ts  MMKV-backed tokens, kept out of Zustand so the client can read
                 and rotate them without a circular import
  queryClient.ts TanStack Query defaults (4xx never retried — it will stay wrong)
  queryKeys.ts   every cache key in one place, so invalidation cannot miss one
  types.ts       response shapes mirroring the backend DTOs
  endpoints/     one typed module per domain
```

Each feature wraps those in hooks (`useCart`, `useMealFeed`, `useOrderTracking`,
`useReelFeed`, …) that own caching, pagination and optimistic updates. Screens
consume hooks and never touch the client directly.

Behaviours worth knowing:

- **Session expiry.** When a refresh finally fails, the client calls the handler
  registered by `authStore`, which signs the user out and clears the query cache.
- **Optimistic updates.** Favourites, kitchen follows and reel likes flip
  instantly and revert on failure — a heart that waits for a round-trip feels broken.
- **Polling that stops.** `useOrderTracking` polls every 15s only while the order
  is moving; a delivered or cancelled order costs nothing.
- **Cart conflicts.** A cart holds one kitchen's food. The API answers `409
  CART_KITCHEN_CONFLICT`; `useAddToCartFlow` catches it, asks the user, and
  replays the add with `replaceCart`.

## 13. Screen Map

**Public stack** — Onboarding → Login → OTP → OTPSuccess → PersonalDetails
(profile step, then area selection).

**Tabs** — Home · Search · Food Feed · Orders · Profile.

**Private stack** — MealDetail, KitchenProfile, KitchenGallery, KitchenReviews,
ReelViewer, Favorites, FollowedKitchens, Cart, Checkout, PaymentProcessing,
OrderConfirmation, OrderTracking, OrderDetail, WriteReview, Addresses,
AddressForm, Support, Settings, EditProfile.

Route params are typed in [src/app/navigation/navigation.types.ts](src/app/navigation/navigation.types.ts).

## 14. Testing

`npm test` runs the Jest suite. `jest.setup.js` mocks the native modules that
have no JS implementation under Node (Worklets/Reanimated, keyboard-controller,
MMKV, config, gradients, masked view, bottom sheet, OTP entry, checkbox), and
`jest.config.js` maps the `@app` / `@components` / `@features` / `@utils` / `@api`
path aliases so tests resolve imports the same way Metro does.
