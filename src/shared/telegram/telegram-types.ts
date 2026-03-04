export type TelegramInsets = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

export type TelegramAdapter = {
  isAvailable(): boolean;
  ready(): void;
  expand(): void;
  requestFullscreen?(): void;
  getInitData(): string | null;
  getSafeAreaInsets(): TelegramInsets;
  getViewportHeight?(): number | null;
  onViewportChanged?(callback: () => void): () => void;
  disableVerticalSwipes(): void;
  enableClosingConfirmation(enabled: boolean): void;
};

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        ready: () => void;
        expand: () => void;
        requestFullscreen?: () => void;
        initData: string;
        viewportHeight?: number;
        viewportStableHeight?: number;
        safeAreaInset?: TelegramInsets;
        contentSafeAreaInset?: TelegramInsets;
        onEvent?: (event: "viewportChanged", callback: () => void) => void;
        offEvent?: (event: "viewportChanged", callback: () => void) => void;
        disableVerticalSwipes?: () => void;
        enableClosingConfirmation?: () => void;
        disableClosingConfirmation?: () => void;
      };
    };
  }
}
