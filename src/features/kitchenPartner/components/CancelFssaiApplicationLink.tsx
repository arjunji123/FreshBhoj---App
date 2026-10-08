import React from 'react';
import { Alert, StyleSheet } from 'react-native';
import { Button } from '@components/ui';
import { theme } from '@app/theme/index';
import { KitchenApiError } from '../api/kitchenClient';
import { useCancelFssaiAssistance } from '../hooks/useKitchenPortal';

/**
 * "Cancel application" — the escape hatch the website offers on the documents
 * and payment steps. Only valid before payment is confirmed on the backend, so
 * callers render it on those two steps only. Asks first because it discards the
 * request (a fresh one can be started any time).
 */
const CancelFssaiApplicationLink: React.FC = () => {
  const cancel = useCancelFssaiAssistance();

  const handlePress = () => {
    Alert.alert('Cancel this FSSAI application?', 'You can start a new one any time.', [
      { text: 'Keep it', style: 'cancel' },
      {
        text: 'Cancel application',
        style: 'destructive',
        onPress: () =>
          cancel.mutate(undefined, {
            onError: (error) =>
              Alert.alert('Could not cancel', error instanceof KitchenApiError ? error.message : 'Please try again.'),
          }),
      },
    ]);
  };

  return (
    <Button
      title={cancel.isPending ? 'Cancelling…' : 'Cancel application'}
      variant="ghost"
      size="sm"
      fullWidth={false}
      loading={cancel.isPending}
      onPress={handlePress}
      style={styles.link}
    />
  );
};

export default CancelFssaiApplicationLink;

const styles = StyleSheet.create({
  link: { marginTop: theme.spacing.paddings.md },
});
