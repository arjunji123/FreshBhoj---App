import { apiClient } from '../client';
import type { Address, AddressLabel } from '../types';

export interface AddressInput {
  label?: AddressLabel;
  customLabel?: string;
  receiverName?: string;
  receiverPhone?: string;
  line1: string;
  line2?: string;
  landmark?: string;
  locality?: string;
  city?: string;
  state?: string;
  pincode: string;
  latitude?: number;
  longitude?: number;
  isDefault?: boolean;
}

export const addressesApi = {
  list: () => apiClient.get<Address[]>('/customer/addresses'),

  getDefault: () => apiClient.get<Address | null>('/customer/addresses/default'),

  create: (input: AddressInput) => apiClient.post<Address>('/customer/addresses', input),

  update: (id: string, input: Partial<AddressInput>) =>
    apiClient.patch<Address>(`/customer/addresses/${id}`, input),

  setDefault: (id: string) => apiClient.patch<Address>(`/customer/addresses/${id}/default`),

  remove: (id: string) => apiClient.delete<{ id: string }>(`/customer/addresses/${id}`),
};
