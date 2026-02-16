import { useQuery } from "@tanstack/react-query";

const COINGECKO_API_URL = "https://api.coingecko.com/api/v3/simple/price?ids=the-open-network&vs_currencies=usd";

interface CoinGeckoResponse {
  "the-open-network": {
    usd: number;
  };
}

const fetchTonPrice = async (): Promise<number> => {
  const response = await fetch(COINGECKO_API_URL);
  if (!response.ok) {
    throw new Error("Failed to fetch TON price");
  }
  const data: CoinGeckoResponse = await response.json();
  return data["the-open-network"].usd;
};

export const useTonPrice = () => {
  return useQuery({
    queryKey: ["ton-price"],
    queryFn: fetchTonPrice,
    staleTime: Infinity, // Never mark as stale
    gcTime: Infinity, // Keep in cache forever
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 2,
  });
};

// Fallback rate if API fails
export const FALLBACK_TON_USD_RATE = 1.3;
