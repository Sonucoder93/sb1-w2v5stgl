export interface Stock {
  id: string;
  symbol: string;
  name: string;
  quantity: number;
  purchase_price: number;
  current_price: number;
  created_at: string;
  user_id: string;
}

export interface PortfolioMetrics {
  totalValue: number;
  totalGainLoss: number;
  topPerformer: Stock | null;
  worstPerformer: Stock | null;
}