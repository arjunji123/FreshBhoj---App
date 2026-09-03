module.exports = {
  preset: 'react-native',
  setupFiles: ['<rootDir>/jest.setup.js'],
  // These ship untranspiled ESM/Flow and must go through Babel.
  transformIgnorePatterns: [
    'node_modules/(?!(?:@react-native|react-native|react-native-.*|@react-navigation|@shopify/flash-list|lucide-react-native)/)',
  ],
  moduleNameMapper: {
    '^@app/(.*)$': '<rootDir>/src/app/$1',
    '^@components/(.*)$': '<rootDir>/src/components/$1',
    '^@features/(.*)$': '<rootDir>/src/features/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@animations/(.*)$': '<rootDir>/src/animations/$1',
    '^@assets/(.*)$': '<rootDir>/assets/$1',
    '^@api$': '<rootDir>/src/api/index',
    '^@api/(.*)$': '<rootDir>/src/api/$1',
  },
};
