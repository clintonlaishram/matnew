// types/message.ts
export interface Message {
  id: number;
  name: string;
  address: string;
  mobile_number: string;
  message: string;
  created_at: string;  // Or `Date`, depending on how you want to handle it
  email: string;
  status?: string; // Add the status property (optional)
  sender_email: string;
}
