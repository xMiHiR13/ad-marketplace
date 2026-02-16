export interface Payment {
  userId: number;
  type: "received" | "sent";
  amount: number;
  from: string;
  to: string;
  label: string;
  date: Date;
  txHash: string;
}
