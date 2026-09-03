import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { theme } from '@app/theme/index';
import { formatCompact } from '@utils/format';
import { Card } from '@components/ui';
import { StarRow } from '@components/ui/Rating';
import type { ReviewSummary } from '@api/types';

interface RatingSummaryProps {
  summary: ReviewSummary;
}

/** Average, count and the 5→1 histogram above a kitchen's review list. */
const RatingSummary: React.FC<RatingSummaryProps> = ({ summary }) => (
  <Card padding="lg" elevation="xs" style={styles.card}>
    <View style={styles.row}>
      <View style={styles.scoreBlock}>
        <Text style={theme.text.displayMedium}>{summary.average.toFixed(1)}</Text>
        <StarRow value={summary.average} size={14} />
        <Text style={[theme.text.caption, styles.count]}>
          {formatCompact(summary.total)} reviews
        </Text>
      </View>

      <View style={styles.bars}>
        {summary.distribution.map((row) => (
          <View key={row.star} style={styles.barRow}>
            <Text style={[theme.text.caption, styles.starLabel]}>{row.star}</Text>
            <View style={styles.track}>
              <View style={[styles.fill, { width: `${row.percent}%` }]} />
            </View>
            <Text style={[theme.text.caption, styles.percent]}>{row.percent}%</Text>
          </View>
        ))}
      </View>
    </View>
  </Card>
);

export default RatingSummary;

const styles = StyleSheet.create({
  card: {
    marginHorizontal: theme.layout.screenPadding,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xl,
  },
  scoreBlock: {
    alignItems: 'center',
    gap: 4,
  },
  count: {
    color: theme.colors.text.tertiary,
  },
  bars: {
    flex: 1,
    gap: 6,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  starLabel: {
    width: 10,
    color: theme.colors.text.tertiary,
  },
  track: {
    flex: 1,
    height: 6,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.neutral[100],
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primary[500],
  },
  percent: {
    width: 34,
    textAlign: 'right',
    color: theme.colors.text.tertiary,
  },
});
