export type CatalogType = {
  id: number;
  slug: string;
  name: string;
  is_active: boolean;
  sort_order: number;
};

export type Category = {
  id: number;
  catalog_type_id: number;
  slug: string;
  name: string;
  sort_order: number;
};

export type MenuItem = {
  id: number;
  category_id: number;
  name: string;
  price: number;
  image_url: string | null;
  is_active: boolean;
  sort_order: number;
};

export type CartItem = {
  id: number;
  name: string;
  price: number;
  image_url: string | null;
  quantity: number;
};

export type SettingsMap = {
  delivery_phone: string;
  bank_name: string;
  bank_account: string;
  bank_holder: string;
  free_delivery_min: string;
  delivery_fee: string;
};

export type OrderItemJson = {
  id: number;
  name: string;
  price: number;
  qty: number;
};

export type TelegramUser = {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  photo_url?: string;
};

declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        ready: () => void;
        expand: () => void;
        close: () => void;
        initData: string;
        initDataUnsafe: {
          user?: TelegramUser;
        };
        MainButton?: {
          show: () => void;
          hide: () => void;
        };
        HapticFeedback?: {
          impactOccurred: (style: 'light' | 'medium' | 'heavy') => void;
          notificationOccurred: (type: 'success' | 'warning' | 'error') => void;
        };
      };
    };
  }
}
