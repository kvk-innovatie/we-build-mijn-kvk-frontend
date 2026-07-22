// Submitted permit applications, persisted in localStorage so the municipality
// admin view can pick them up. This demo has no backend for the permit flow.

import type { CompanyInfo, RepresentativeInfo } from "./attributes";

export interface ApplicationFormData {
  email: string;
  phone: string;
  market: string;
  location: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  pitchSize: string;
  goods: string;
  traderName: string;
  traderBirthdate: string;
  assignment: string;
  assignmentNr: string;
}

export type ApplicationStatus = "pending" | "approved" | "rejected";

export interface StoredApplication {
  reference: string;
  submittedAt: string;
  decidedAt?: string;
  status: ApplicationStatus;
  form: ApplicationFormData;
  company: CompanyInfo | null;
  representative: RepresentativeInfo | null;
  /** Attributes released by the business wallet, captured at submission time. */
  walletFields: Array<[string, string]>;
}

const STORAGE_KEY = "fictive-municipality.applications";

export function generateReference(): string {
  const year = new Date().getFullYear();
  return `MSP-${year}-${Math.floor(1e5 + Math.random() * 9e5)}`;
}

export function listApplications(): StoredApplication[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as StoredApplication[];
  } catch {
    return [];
  }
}

function persist(applications: StoredApplication[]): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(applications));
  } catch {
    // Storage unavailable or full — the demo keeps working without persistence.
  }
}

export function saveApplication(application: StoredApplication): void {
  persist([application, ...listApplications()]);
}

export function setApplicationStatus(
  reference: string,
  status: ApplicationStatus
): StoredApplication[] {
  const updated = listApplications().map((application) =>
    application.reference === reference
      ? { ...application, status, decidedAt: new Date().toISOString() }
      : application
  );
  persist(updated);
  return updated;
}

export function clearApplications(): void {
  persist([]);
}
