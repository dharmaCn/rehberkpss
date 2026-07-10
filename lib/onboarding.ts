import { createContext, useContext } from 'react';

export const ONBOARDING_SEEN_KEY = 'onboardingSeen';

export const OnboardingContext = createContext<{
  seen: boolean | null;
  markSeen: () => void;
}>({ seen: null, markSeen: () => {} });

export function useOnboarding() {
  return useContext(OnboardingContext);
}
