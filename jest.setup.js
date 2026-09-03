/**
 * Jest setup.
 *
 * The app depends on several native modules that have no JS implementation in
 * the test environment. Mocking them here is what lets the render smoke test
 * (and any future component test) run under plain Node.
 */
// Reanimated 4 runs on the Worklets native runtime, which does not exist under
// Jest — both ship pure-JS mocks for exactly this case.
jest.mock('react-native-worklets', () =>
  require('react-native-worklets/lib/module/mock'),
);
jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));

jest.mock('react-native-keyboard-controller', () =>
  require('react-native-keyboard-controller/jest'),
);

jest.mock('react-native-mmkv', () => {
  const store = new Map();
  return {
    createMMKV: () => ({
      getString: (key) => store.get(key),
      set: (key, value) => store.set(key, value),
      remove: (key) => store.delete(key),
      clearAll: () => store.clear(),
    }),
  };
});

jest.mock('react-native-config', () => ({
  APP_ENV: 'test',
  APP_NAME: 'FreshBhoj',
  API_BASE_URL: 'http://localhost:3000/api/v1',
}));

jest.mock('react-native-linear-gradient', () => 'LinearGradient');

jest.mock('@react-native-masked-view/masked-view', () => 'MaskedView');

jest.mock('react-native-raw-bottom-sheet', () => 'RBSheet');

jest.mock('react-native-otp-entry', () => ({ OtpInput: 'OtpInput' }));

jest.mock('@react-native-community/checkbox', () => 'CheckBox');

// Silence the reanimated layout-animation warning that fires on every render.
jest.spyOn(global.console, 'warn').mockImplementation((message, ...rest) => {
  if (typeof message === 'string' && message.includes('Reanimated')) return;
  console.info(message, ...rest);
});
