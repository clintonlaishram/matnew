export interface Order {
  id: number;
  vendor_id: string;
  product_name: string;
  quantity: number;
  price: number;
  status: string;
  created_at: string;
  updated_at: string;
  date: string;
  team: string;
  pickup_name: string;
  pickup_address: string;
  pickup_phone: string;
  drop_name: string;
  drop_address: string;
  drop_phone: string;
  orderType: string;
  pb: string;
  dc: string;
  pbAmt: number;
  dcAmt: number;
  cid: string;
  tsb: string;
  type: string;
  vendor: string;
  user_email?: string; // Mark as optional if not fetched from the database
}
