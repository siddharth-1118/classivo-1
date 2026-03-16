export interface PaymentType {
  email: string;
  created_at: number;
  payload: Payload;
}

export interface Payload {
  amount: number;
  contact: string;
  email: string;
  method: string;
  id: string;
}

export interface PaymentUserInfo {
  name: string;
  email: string;
  contact: string;
}
