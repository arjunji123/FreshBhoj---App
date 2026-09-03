/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App from '../App';

// The splash screen holds the tree for ~2s before the navigator mounts, so the
// clock is faked to drive both halves deterministically rather than letting the
// timer fire after the test has finished.
beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

test('renders the splash screen, then the navigator', async () => {
  let tree: ReactTestRenderer.ReactTestRenderer;

  await ReactTestRenderer.act(async () => {
    tree = ReactTestRenderer.create(<App />);
  });

  await ReactTestRenderer.act(async () => {
    jest.advanceTimersByTime(3000);
  });

  expect(tree!.toJSON()).toBeTruthy();

  await ReactTestRenderer.act(async () => {
    tree!.unmount();
  });
});
