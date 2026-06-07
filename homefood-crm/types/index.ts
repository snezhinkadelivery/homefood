export type OrderStatus = 'accepted' | 'on_way' | 'completed';

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

export type OrderItemJson = {
  id: number;
  name: string;
  price: number;
  qty: number;
};

export type Order = {
  id: number;
  order_number: string;
  user_tg_id: number | null;
  customer_name: string;
  phone: string;
  address_text: string | null;
  address_photo_url: string | null;
  comment: string | null;
  items_json: OrderItemJson[];
  subtotal: number;
  delivery_fee: number;
  total: number;
  status: OrderStatus;
  created_at: string;
  updated_at: string;
};

export type Review = {
  id: number;
  order_id: number;
  user_tg_id: number;
  rating: number | null;
  requested_at: string | null;
  reminded_at: string | null;
  submitted_at: string | null;
  created_at: string;
};

export type Period = 'today' | 'month' | 'all';

export type DashboardMetrics = {
  revenue: number;
  ordersCount: number;
  avgCheck: number;
  newCustomers: number;
  returningCustomers: number;
  returningPercent: number;
  topItems: { name: string; qty: number }[];
};
