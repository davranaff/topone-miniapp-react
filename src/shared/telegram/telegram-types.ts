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
  getInitData(): string | null;
  getSafeAreaInsets(): TelegramInsets;
  disableVerticalSwipes(): void;
  enableClosingConfirmation(enabled: boolean): void;
};

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        ready: () => void;
        expand: () => void;
        initData: string;
        safeAreaInset?: TelegramInsets;
        contentSafeAreaInset?: TelegramInsets;
        disableVerticalSwipes?: () => void;
        enableClosingConfirmation?: () => void;
        disableClosingConfirmation?: () => void;
      };
    };
  }
}
