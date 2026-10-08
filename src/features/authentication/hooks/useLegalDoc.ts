import { useQuery } from '@tanstack/react-query';
import { legalApi, qk } from '@api';
import { LEGAL_DOCS, type LegalDoc, type LegalDocKey } from '../constants/legalContent';

/**
 * Terms / Privacy / Content Policy, served by the backend so a wording change
 * ships without an app release. Public (the signup sheet reads it signed out).
 * The bundled copy renders instantly and stays as the fallback if the request
 * fails, so a legal page is never blank.
 */
export function useLegalDoc(key: LegalDocKey): LegalDoc {
  const { data } = useQuery({
    queryKey: qk.legal.doc(key),
    queryFn: () => legalApi.get(key),
    staleTime: 6 * 60 * 60_000,
  });

  const local = LEGAL_DOCS[key];
  return data ? { ...local, title: data.title, sections: data.sections, updatedAt: data.updatedAt } : local;
}

/** "2026-09-01" -> "September 2026". */
export function formatLegalUpdatedAt(updatedAt?: string): string {
  if (!updatedAt) return '';
  const date = new Date(`${updatedAt}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric', timeZone: 'UTC' });
}
