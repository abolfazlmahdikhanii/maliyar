import { useQuery } from "convex/react";
import { useMemo } from "react";
import { api } from "../../convex/_generated/api";
import { getRecentRange } from "../utils/recentRange";


export function useRecentTransactions(limit = 4) {
  const range = useMemo(() => getRecentRange(90), []);
  const transactions = useQuery(api.transactions.list, range);

  return {
    loading: transactions === undefined,
    items: (transactions ?? []).slice(0, limit),
  };
}