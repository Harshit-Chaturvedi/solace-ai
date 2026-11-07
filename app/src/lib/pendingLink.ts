let pendingUrl: string | null = null;
let splashActive = true;

export const pendingLink = {
  get: (): string | null => pendingUrl,
  set: (url: string | null): void => {
    pendingUrl = url;
  },
  clear: (): string | null => {
    const prev = pendingUrl;
    pendingUrl = null;
    return prev;
  },
  setSplashActive: (active: boolean): void => {
    splashActive = active;
  },
  isSplashActive: (): boolean => splashActive,
};
