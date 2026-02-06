export type AppMode = 'demo' | 'live';

export const APP_MODE: AppMode =
  (import.meta.env.VITE_APP_MODE as AppMode) || 'demo';

export const isLiveMode = APP_MODE === 'live';
export const isDemoMode = APP_MODE === 'demo';
