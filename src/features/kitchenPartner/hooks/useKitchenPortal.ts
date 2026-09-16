import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  kitchenDashboardApi,
  kitchenMenuApi,
  kitchenOnboardingApi,
  kitchenOrdersApi,
  kitchenProfileApi,
  kitchenStoriesApi,
  kitchenUploadApi,
  UpsertMealInput,
} from '../api/kitchenPortal.api';
import type { OrderStatus } from '../kitchenPartner.types';
import { useKitchenAuthStore } from '../store/kitchenAuthStore';

const kitchenKeys = {
  onboarding: ['kitchen', 'onboarding'] as const,
  dashboard: ['kitchen', 'dashboard'] as const,
  profile: ['kitchen', 'profile'] as const,
  orders: ['kitchen', 'orders'] as const,
  ordersHistory: (params: unknown) => ['kitchen', 'orders', 'history', params] as const,
  menu: ['kitchen', 'menu'] as const,
  stories: ['kitchen', 'stories'] as const,
};

function useKitchenAuthed() {
  return useKitchenAuthStore((s) => s.isAuthenticated);
}

export function useKitchenOnboardingStatus() {
  const enabled = useKitchenAuthed();
  return useQuery({ queryKey: kitchenKeys.onboarding, queryFn: kitchenOnboardingApi.status, enabled });
}

export function useKitchenDashboard() {
  const enabled = useKitchenAuthed();
  return useQuery({ queryKey: kitchenKeys.dashboard, queryFn: kitchenDashboardApi.summary, enabled, refetchInterval: 30_000 });
}

export function useKitchenProfile() {
  const enabled = useKitchenAuthed();
  return useQuery({ queryKey: kitchenKeys.profile, queryFn: kitchenProfileApi.get, enabled });
}

export function useSetAcceptingOrders() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (isAcceptingOrders: boolean) => kitchenProfileApi.setAcceptingOrders(isAcceptingOrders),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: kitchenKeys.profile });
      queryClient.invalidateQueries({ queryKey: kitchenKeys.dashboard });
    },
  });
}

export function useKitchenIncomingOrders() {
  const enabled = useKitchenAuthed();
  return useQuery({
    queryKey: kitchenKeys.orders,
    queryFn: kitchenOrdersApi.incoming,
    enabled,
    refetchInterval: 15_000,
  });
}

export function useKitchenOrderHistory(params: { page: number; dateFrom?: string; dateTo?: string }) {
  const enabled = useKitchenAuthed();
  return useQuery({
    queryKey: kitchenKeys.ordersHistory(params),
    queryFn: () => kitchenOrdersApi.list({ ...params, limit: 20 }),
    enabled,
  });
}

export function useAdvanceOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) => kitchenOrdersApi.advanceStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: kitchenKeys.orders });
      queryClient.invalidateQueries({ queryKey: kitchenKeys.dashboard });
    },
  });
}

export function useKitchenMenu() {
  const enabled = useKitchenAuthed();
  return useQuery({ queryKey: kitchenKeys.menu, queryFn: () => kitchenMenuApi.list(true), enabled });
}

export function useSetMealAvailability() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isAvailable }: { id: string; isAvailable: boolean }) => kitchenMenuApi.setAvailability(id, isAvailable),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: kitchenKeys.menu }),
  });
}

export function useCreateMeal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpsertMealInput) => kitchenMenuApi.create(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: kitchenKeys.menu }),
  });
}

export function useUpdateMeal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<UpsertMealInput> }) => kitchenMenuApi.update(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: kitchenKeys.menu }),
  });
}

export function useAnalyzeMeal() {
  return useMutation({ mutationFn: kitchenMenuApi.analyze });
}

export function useKitchenStories() {
  const enabled = useKitchenAuthed();
  return useQuery({ queryKey: kitchenKeys.stories, queryFn: kitchenStoriesApi.list, enabled });
}

export function usePublishStory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: kitchenStoriesApi.publish,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: kitchenKeys.stories }),
  });
}

export function useDeactivateStory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => kitchenStoriesApi.deactivate(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: kitchenKeys.stories }),
  });
}

export function useUpdateStoryCaption() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, caption }: { id: string; caption: string }) => kitchenStoriesApi.updateCaption(id, caption),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: kitchenKeys.stories }),
  });
}

export function useKitchenUpload() {
  return useMutation({
    mutationFn: ({ asset, purpose }: { asset: { uri: string; type?: string; fileName?: string }; purpose: string }) =>
      kitchenUploadApi.upload(asset, purpose),
  });
}
