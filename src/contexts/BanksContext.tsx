"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, ReactNode } from "react";
import { fetchVietQrBanks, VietQrBank } from "@/services/bank.service";

interface BanksContextType {
  banks: VietQrBank[];
  isLoading: boolean;
  error: string | null;
  findBankByBin: (bin: string) => VietQrBank | undefined;
}

const BanksContext = createContext<BanksContextType | undefined>(undefined);

export function BanksProvider({ children }: { children: ReactNode }) {
  const [banks, setBanks] = useState<VietQrBank[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasLoadedRef = useRef(false);

  const loadBanks = useCallback(async () => {
    if (hasLoadedRef.current) return;

    try {
      setIsLoading(true);
      setError(null);
      const bankList = await fetchVietQrBanks();
      setBanks(bankList);
      hasLoadedRef.current = true;
    } catch (err) {
      console.error("Error loading banks:", err);
      setError("Không thể tải danh sách ngân hàng.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadBanks();
  }, [loadBanks]);

  const findBankByBin = useCallback(
    (bin: string) => banks.find((bank) => bank.bin === bin),
    [banks],
  );

  const value = useMemo(
    () => ({
      banks,
      isLoading,
      error,
      findBankByBin,
    }),
    [banks, error, findBankByBin, isLoading],
  );

  return <BanksContext.Provider value={value}>{children}</BanksContext.Provider>;
}

export function useBanks() {
  const context = useContext(BanksContext);

  if (context === undefined) {
    throw new Error("useBanks must be used within a BanksProvider");
  }

  return context;
}
