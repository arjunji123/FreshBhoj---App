import { useEffect } from 'react';
import { Linking } from 'react-native';
import { pendingReferralStore } from './pendingReferralStore';

/**
 * Matches both the custom scheme (`freshbhoj://refer/CODE`, for when the app
 * is already installed and a link is tapped) and the web fallback
 * (`https://freshbhoj.com/refer/CODE`, shared everywhere else). Requires the
 * native intent-filter / URL type to be registered — see AndroidManifest.xml
 * and Info.plist — and a native rebuild to take effect on-device.
 */
const REFERRAL_LINK_PATTERN = /\/refer\/([A-Za-z0-9]{4,12})(?:[/?#]|$)/;

function extractCode(url: string | null): string | null {
  if (!url) return null;
  const match = url.match(REFERRAL_LINK_PATTERN);
  return match ? match[1].toUpperCase() : null;
}

/**
 * Captures a referral code from whatever link opened (or re-activated) the
 * app and stashes it for the "were you referred?" onboarding step — which
 * may not run until well after this fires, if the person hasn't signed up
 * yet. Mount once, near the app root.
 */
export function useCaptureReferralLink() {
  useEffect(() => {
    Linking.getInitialURL().then((url) => {
      const code = extractCode(url);
      if (code) pendingReferralStore.set(code);
    });

    const subscription = Linking.addEventListener('url', ({ url }) => {
      const code = extractCode(url);
      if (code) pendingReferralStore.set(code);
    });

    return () => subscription.remove();
  }, []);
}
