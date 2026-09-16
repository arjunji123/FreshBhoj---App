import { kitchenClient } from './kitchenClient';
import type {
  DashboardSummary,
  KitchenAccount,
  KitchenOrderCard,
  KitchenProfile,
  KitchenStory,
  KitchenTokenPair,
  MealDetail,
  NutritionAnalysisResult,
  OnboardingStatus,
  OrderStatus,
  Paginated,
} from '../kitchenPartner.types';

// ── Auth ──────────────────────────────────────────────────────────────────

export const kitchenAuthApi = {
  sendOtp: (phone: string) =>
    kitchenClient.post<{ expiresInMinutes: number; devOtp?: string }>('/partner/auth/otp/send', { phone }, { skipAuth: true }),

  verifyOtp: (phone: string, otp: string) =>
    kitchenClient.post<{ isNewAccount: boolean; account: KitchenAccount; tokens: KitchenTokenPair }>(
      '/partner/auth/otp/verify',
      { phone, otp },
      { skipAuth: true },
    ),

  logout: () => kitchenClient.post<null>('/partner/auth/logout'),
};

// ── Onboarding ────────────────────────────────────────────────────────────

export const kitchenOnboardingApi = {
  status: () => kitchenClient.get<OnboardingStatus>('/partner/onboarding/status'),
  simulateApprove: () => kitchenClient.post<OnboardingStatus>('/partner/onboarding/simulate/approve'),
};

// ── Profile ───────────────────────────────────────────────────────────────

export const kitchenProfileApi = {
  get: () => kitchenClient.get<KitchenProfile>('/partner/kitchen'),
  update: (input: Partial<KitchenProfile>) => kitchenClient.patch<KitchenProfile>('/partner/kitchen', input),
  setAcceptingOrders: (isAcceptingOrders: boolean) =>
    kitchenClient.patch<KitchenProfile>('/partner/kitchen/accepting-orders', { isAcceptingOrders }),
};

// ── Menu ──────────────────────────────────────────────────────────────────

export interface UpsertMealInput {
  name: string;
  description?: string;
  images: string[];
  price: number;
  mrp?: number;
  foodType: string;
  slots?: string[];
  goalTags?: string[];
  calories: number;
  proteinG: number;
  carbsG?: number;
  fatG?: number;
  fiberG?: number;
  isAvailable?: boolean;
}

export const kitchenMenuApi = {
  list: (includeUnavailable = true) => kitchenClient.get<MealDetail[]>(`/partner/menu?includeUnavailable=${includeUnavailable}`),
  get: (id: string) => kitchenClient.get<MealDetail>(`/partner/menu/${id}`),
  create: (input: UpsertMealInput) => kitchenClient.post<MealDetail>('/partner/menu', input),
  update: (id: string, input: Partial<UpsertMealInput>) => kitchenClient.patch<MealDetail>(`/partner/menu/${id}`, input),
  setAvailability: (id: string, isAvailable: boolean) =>
    kitchenClient.patch<{ id: string; isAvailable: boolean }>(`/partner/menu/${id}/availability`, { isAvailable }),
  remove: (id: string) => kitchenClient.delete<{ id: string }>(`/partner/menu/${id}`),
  analyze: (input: { name: string; description?: string; ingredients?: string[] }) =>
    kitchenClient.post<NutritionAnalysisResult>('/partner/menu/analyze', input),
};

// ── Orders ────────────────────────────────────────────────────────────────

export const kitchenOrdersApi = {
  incoming: () => kitchenClient.get<KitchenOrderCard[]>('/partner/orders/incoming'),
  advanceStatus: (id: string, status: OrderStatus, note?: string) =>
    kitchenClient.post<KitchenOrderCard>(`/partner/orders/${id}/status`, { status, note }),
  list: (params: { page?: number; limit?: number; status?: OrderStatus[]; dateFrom?: string; dateTo?: string }) =>
    kitchenClient.get<Paginated<KitchenOrderCard>>('/partner/orders', { query: params }),
};

// ── Stories ───────────────────────────────────────────────────────────────

export const kitchenStoriesApi = {
  list: () => kitchenClient.get<KitchenStory[]>('/partner/stories'),
  publish: (input: {
    mediaType: string;
    mediaUrl: string;
    thumbnailUrl?: string;
    caption?: string;
    mealId?: string;
    durationSec?: number;
  }) => kitchenClient.post<KitchenStory>('/partner/stories', input),
  deactivate: (id: string) => kitchenClient.delete<{ id: string }>(`/partner/stories/${id}`),
  updateCaption: (id: string, caption: string) => kitchenClient.patch<KitchenStory>(`/partner/stories/${id}`, { caption }),
};

// ── Dashboard ─────────────────────────────────────────────────────────────

export const kitchenDashboardApi = {
  summary: () => kitchenClient.get<DashboardSummary>('/partner/dashboard/summary'),
};

// ── Upload ────────────────────────────────────────────────────────────────

export const kitchenUploadApi = {
  /** `asset` is a react-native-image-picker result — `{uri, type, fileName}`. */
  upload: (asset: { uri: string; type?: string; fileName?: string }, purpose: string) => {
    const form = new FormData();
    form.append('file', {
      uri: asset.uri,
      type: asset.type ?? 'image/jpeg',
      name: asset.fileName ?? `upload-${Date.now()}.jpg`,
    } as any);
    form.append('purpose', purpose);
    return kitchenClient.post<{ url: string }>('/partner/upload', form);
  },
};
