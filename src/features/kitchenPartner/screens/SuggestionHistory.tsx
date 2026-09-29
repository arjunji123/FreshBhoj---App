import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, TextInput, View } from 'react-native';
import { Search, Sparkles } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { theme } from '@app/theme/index';
import { AppBar, Badge, Button, Card, ChipRow, Chip, EmptyState, Screen, Skeleton, Text } from '@components/ui';
import type { BadgeTone } from '@components/ui';
import type { KitchenPartnerNavigation } from '@app/navigation/navigation.types';
import { useSuggestions } from '../hooks/useKitchenPortal';
import type { CampaignSuggestion, CampaignSuggestionEffort, CampaignSuggestionStatus } from '../kitchenPartner.types';

type HistoryTab = 'APPLIED' | 'DISMISSED';

const TAB_LABEL: Record<HistoryTab, string> = {
  APPLIED: 'Applied',
  DISMISSED: 'Dismissed',
};

const STATUS_TONE: Record<CampaignSuggestionStatus, BadgeTone> = {
  NEW: 'brand',
  APPLIED: 'accent',
  DISMISSED: 'neutral',
};

const EFFORT_TONE: Record<CampaignSuggestionEffort, BadgeTone> = {
  LOW: 'accent',
  MEDIUM: 'warning',
  HIGH: 'danger',
};

const TYPE_LABEL: Record<string, string> = {
  BUDGET_INCREASE: 'Budget Increase',
  DELIVERY_RADIUS: 'Delivery Radius',
  TARGET_CUISINE: 'Target Cuisine',
  CREATIVE_REFRESH: 'Creative Refresh',
};

const SuggestionHistory = () => {
  const navigation = useNavigation<KitchenPartnerNavigation>();
  const [tab, setTab] = useState<HistoryTab>('APPLIED');
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagesMap, setPagesMap] = useState<Record<number, CampaignSuggestion[]>>({});

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchInput.trim()), 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
    setPagesMap({});
  }, [tab, debouncedSearch]);

  const query = useSuggestions({ status: tab, q: debouncedSearch || undefined, page });

  useEffect(() => {
    if (!query.data) return;
    setPagesMap((prev) => ({ ...prev, [page]: query.data!.items }));
  }, [query.data, page]);

  const items = useMemo(() => {
    const pageNumbers = Object.keys(pagesMap)
      .map(Number)
      .sort((a, b) => a - b);
    return pageNumbers.flatMap((p) => pagesMap[p] ?? []);
  }, [pagesMap]);

  return (
    <Screen background="page">
      <AppBar title="Suggestion History" onBack={() => navigation.goBack()} />

      <View style={styles.searchWrap}>
        <Search size={16} color={theme.colors.text.tertiary} />
        <TextInput
          value={searchInput}
          onChangeText={setSearchInput}
          placeholder="Search suggestions…"
          placeholderTextColor={theme.colors.text.tertiary}
          style={styles.searchInput}
        />
      </View>

      <ChipRow style={styles.tabRow}>
        {(Object.keys(TAB_LABEL) as HistoryTab[]).map((key) => (
          <Chip key={key} label={TAB_LABEL[key]} selected={tab === key} onPress={() => setTab(key)} />
        ))}
      </ChipRow>

      {query.isError ? (
        <View style={styles.emptyPadding}>
          <EmptyState title="Something went wrong" description="We couldn't load your suggestion history." actionLabel="Retry" onAction={() => query.refetch()} />
        </View>
      ) : query.isLoading && page === 1 ? (
        <View style={styles.listPadding}>
          {[0, 1].map((i) => (
            <Skeleton key={i} height={90} radius={theme.radius.card} style={{ marginBottom: theme.spacing.paddings.sm }} />
          ))}
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={items.length ? styles.listPadding : styles.emptyPadding}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState
              icon={<Sparkles size={28} color={theme.colors.text.tertiary} />}
              title={`No ${TAB_LABEL[tab].toLowerCase()} suggestions`}
              description="Suggestions you apply or dismiss will show up here."
            />
          }
          renderItem={({ item }) => (
            <Card style={styles.row} onPress={() => navigation.navigate('SuggestionDetail', { suggestionId: item.id })}>
              <View style={styles.rowTopLine}>
                <Badge label={TYPE_LABEL[item.type] ?? item.type} tone="brand" size="sm" />
                <Badge label={item.status} tone={STATUS_TONE[item.status]} size="sm" />
              </View>
              <Text variant="bodyMedium" numberOfLines={1} style={styles.rowTitle}>
                {item.title}
              </Text>
              <View style={styles.rowMetaLine}>
                <Badge label={item.impact.effort} tone={EFFORT_TONE[item.impact.effort]} size="sm" />
                <Text variant="caption" color="tertiary">
                  {new Date(item.appliedAt ?? item.dismissedAt ?? item.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </Text>
              </View>
            </Card>
          )}
          ListFooterComponent={
            query.data?.meta.hasNextPage ? (
              <View style={styles.loadMoreWrap}>
                {query.isFetching && page > 1 ? (
                  <ActivityIndicator color={theme.colors.brand.primary} />
                ) : (
                  <Button title="Load more" variant="outline" size="sm" fullWidth={false} onPress={() => setPage((p) => p + 1)} />
                )}
              </View>
            ) : null
          }
        />
      )}
    </Screen>
  );
};

export default SuggestionHistory;

const styles = StyleSheet.create({
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.paddings.sm,
    marginHorizontal: theme.layout.screenPadding,
    marginBottom: theme.spacing.paddings.sm,
    paddingHorizontal: theme.spacing.paddings.md,
    height: 44,
    borderRadius: theme.radius.control,
    borderWidth: 1.5,
    borderColor: theme.colors.borders.subtle,
    backgroundColor: theme.colors.neutral[50],
  },
  searchInput: { flex: 1, ...theme.text.bodySmall, color: theme.colors.text.primary, padding: 0 },
  tabRow: { marginBottom: theme.spacing.paddings.sm },
  listPadding: { paddingHorizontal: theme.layout.screenPadding, paddingBottom: theme.spacing.paddings.xxl },
  emptyPadding: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: theme.layout.screenPadding },
  row: { marginBottom: theme.spacing.paddings.sm },
  rowTopLine: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowTitle: { marginTop: theme.spacing.paddings.xs },
  rowMetaLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: theme.spacing.paddings.sm,
    paddingTop: theme.spacing.paddings.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.borders.subtle,
  },
  loadMoreWrap: { alignItems: 'center', paddingVertical: theme.spacing.paddings.lg },
});
