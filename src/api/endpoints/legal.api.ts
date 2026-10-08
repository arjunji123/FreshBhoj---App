import { apiClient } from '../client';
import type { LegalDocumentData, LegalDocumentKey } from '../types';

/** Public — the signup consent sheet reads these before anyone has an account. */
export const legalApi = {
  get: (key: LegalDocumentKey) =>
    apiClient.get<LegalDocumentData>(`/legal/${key}`, { skipAuth: true }),
};
