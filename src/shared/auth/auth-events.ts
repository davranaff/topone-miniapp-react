export const AUTH_EVENTS = {
  sessionExpired: "auth:session-expired",
  loggedOut: "auth:logged-out",
} as const;

const target = new EventTarget();

export const authEvents = {
  emit(name: string) {
    target.dispatchEvent(new Event(name));
  },
  subscribe(name: string, listener: () => void) {
    const handler = () => listener();
    target.addEventListener(name, handler);
    return () => target.removeEventListener(name, handler);
  },
};
