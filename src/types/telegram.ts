interface BackButton {
  isVisible: boolean;

  onClick: (callback: () => void) => BackButton;
  offClick: (callback: () => void) => BackButton;

  show: () => BackButton;
  hide: () => BackButton;
}

interface SettingsButton {
  isVisible: boolean;

  onClick: (callback: () => void) => SettingsButton;
  offClick: (callback: () => void) => SettingsButton;

  show: () => SettingsButton;
  hide: () => SettingsButton;
}

interface HapticFeedback {
  impactOccurred: (
    style: "light" | "medium" | "heavy" | "rigid" | "soft",
  ) => HapticFeedback;

  notificationOccurred: (
    type: "error" | "success" | "warning",
  ) => HapticFeedback;

  selectionChanged: () => HapticFeedback;
}

type TelegramStorageError = unknown;

type StorageBooleanCallback = (
  error: TelegramStorageError | null,
  success?: boolean,
) => void;

type StorageValueCallback = (
  error: TelegramStorageError | null,
  value?: string | null,
  canRestore?: boolean,
) => void;

interface DeviceStorage {
  setItem: (
    key: string,
    value: string,
    callback?: StorageBooleanCallback,
  ) => DeviceStorage;

  getItem: (
    key: string,
    callback: (error: TelegramStorageError | null, value?: string) => void,
  ) => DeviceStorage;

  removeItem: (key: string, callback?: StorageBooleanCallback) => DeviceStorage;

  clear: (callback?: StorageBooleanCallback) => DeviceStorage;
}

interface SecureStorage {
  setItem: (
    key: string,
    value: string,
    callback?: StorageBooleanCallback,
  ) => SecureStorage;

  getItem: (key: string, callback: StorageValueCallback) => SecureStorage;

  restoreItem: (
    key: string,
    callback?: (error: TelegramStorageError | null, value?: string) => void,
  ) => SecureStorage;

  removeItem: (key: string, callback?: StorageBooleanCallback) => SecureStorage;

  clear: (callback?: StorageBooleanCallback) => SecureStorage;
}

export interface TelegramWebApp {
  initData: string;

  initDataUnsafe?: {
    user?: WebAppUser;
  };

  version: string;

  platform: string;

  isExpanded: boolean;

  isActive: boolean;

  isClosingConfirmationEnabled: boolean;

  isVerticalSwipesEnabled: boolean;

  isFullscreen: boolean;

  BackButton: BackButton;

  SettingsButton: SettingsButton;

  HapticFeedback: HapticFeedback;

  DeviceStorage: DeviceStorage;

  SecureStorage: SecureStorage;

  isVersionAtLeast(version: string): boolean;

  enableClosingConfirmation(): void;
  disableClosingConfirmation(): void;

  enableVerticalSwipes(): void;
  disableVerticalSwipes(): void;

  requestFullscreen(): void;
  exitFullscreen(): void;

  downloadFile: (
    params: {
      url: string;
      file_name: string;
    },
    callback?: (accepted: boolean) => void,
  ) => void;

  openLink: (
    url: string,
    options?: {
      try_instant_view?: boolean;
    },
  ) => void;

  openTelegramLink: (url: string) => void;

  expand: () => void;

  ready: () => void;

  close: () => void;
}

export type WebAppUser = {
  id: number;
  is_bot?: boolean;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: true;
  added_to_attachment_menu?: true;
  allows_write_to_pm?: true;
  photo_url?: string;
};

declare global {
  interface Window {
    Telegram?: {
      WebApp?: TelegramWebApp;
    };
  }
}

export {};
