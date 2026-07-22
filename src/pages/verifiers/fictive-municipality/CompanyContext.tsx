import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import {
  flattenAttributes,
  extractCompany,
  extractRepresentative,
  type CompanyInfo,
  type FlatAttributes,
  type RepresentativeInfo,
  type WalletAttributes,
} from "./attributes";

interface CompanyContextValue {
  attributes: WalletAttributes;
  flat: FlatAttributes;
  company: CompanyInfo | null;
  representative: RepresentativeInfo | null;
  setAttributes: (attributes: WalletAttributes) => void;
  logout: () => void;
}

const CompanyContext = createContext<CompanyContextValue | null>(null);

export function CompanyProvider({ children }: { children: ReactNode }) {
  const [attributes, setAttributes] = useState<WalletAttributes>(null);

  const value = useMemo<CompanyContextValue>(() => {
    const flat = attributes ? flattenAttributes(attributes) : {};
    return {
      attributes,
      flat,
      company: attributes ? extractCompany(flat) : null,
      representative: attributes ? extractRepresentative(flat) : null,
      setAttributes,
      logout: () => setAttributes(null),
    };
  }, [attributes]);

  return <CompanyContext.Provider value={value}>{children}</CompanyContext.Provider>;
}

export function useCompany(): CompanyContextValue {
  const ctx = useContext(CompanyContext);
  if (!ctx) throw new Error("useCompany must be used within CompanyProvider");
  return ctx;
}
