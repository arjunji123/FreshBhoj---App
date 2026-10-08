import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { theme } from '@app/theme/index';
import { Text } from '@components/ui';
import type { CampaignDailyStat } from '../kitchenPartner.types';

/** `YYYY-MM-DD` -> short label without letting the device time zone move it to another day. */
function shortDate(date: string): string {
  const [y, m, d] = date.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

/**
 * Impressions + clicks per day — the same two series the website plots on its
 * campaign trend / compare charts. `dailyStats` carries no per-day spend.
 */
export default function CampaignDailyChart({ dailyStats, height = 140 }: { dailyStats: CampaignDailyStat[]; height?: number }) {
  const hasData = dailyStats.some((d) => d.impressions > 0 || d.clicks > 0);

  if (!hasData) {
    return (
      <View style={[styles.empty, { height }]}>
        <Text variant="caption" color="tertiary">
          No activity yet
        </Text>
      </View>
    );
  }

  return (
    <View>
      <LineChart
        data={dailyStats.map((d) => ({ value: d.impressions, label: shortDate(d.date) }))}
        data2={dailyStats.map((d) => ({ value: d.clicks }))}
        height={height}
        thickness={3}
        thickness2={2}
        color={theme.colors.brand.primary}
        color2={theme.colors.text.tertiary}
        dataPointsColor={theme.colors.brand.primary}
        dataPointsColor2={theme.colors.text.tertiary}
        curved
        hideRules
        hideYAxisText
        xAxisColor={theme.colors.borders.subtle}
        xAxisLabelTextStyle={styles.axisLabel}
        noOfSections={3}
        spacing={40}
        initialSpacing={12}
        endSpacing={8}
        adjustToWidth
      />
      <View style={styles.legend}>
        <View style={[styles.dot, { backgroundColor: theme.colors.brand.primary }]} />
        <Text variant="caption" color="secondary">
          Impressions
        </Text>
        <View style={[styles.dot, { backgroundColor: theme.colors.text.tertiary }]} />
        <Text variant="caption" color="secondary">
          Clicks
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  empty: { alignItems: 'center', justifyContent: 'center' },
  axisLabel: { color: theme.colors.text.tertiary, fontSize: 10 },
  legend: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.paddings.xs, marginTop: theme.spacing.paddings.xs },
  dot: { width: 8, height: 8, borderRadius: 4 },
});
