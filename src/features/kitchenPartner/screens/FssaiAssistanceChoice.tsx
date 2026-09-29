import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import DocumentPicker, { types as DocumentPickerTypes } from 'react-native-document-picker';
import { useNavigation } from '@react-navigation/native';
import { FileCheck2, ShieldCheck } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '@app/theme/index';
import { AppBar, Card, Screen } from '@components/ui';
import type { KitchenPartnerNavigation } from '@app/navigation/navigation.types';
import { KitchenApiError } from '../api/kitchenClient';
import { useUploadFssaiLicenceDocument } from '../hooks/useKitchenPortal';
import type { FssaiAssistanceRequest } from '../kitchenPartner.types';

interface Props {
  previousRequest: FssaiAssistanceRequest | null;
  onGetAssistance: () => void;
}

/** Entry screen of the FSSAI Assistance flow — either start the concierge flow, or upload an existing licence directly. */
const FssaiAssistanceChoice: React.FC<Props> = ({ previousRequest, onGetAssistance }) => {
  const navigation = useNavigation<KitchenPartnerNavigation>();
  const insets = useSafeAreaInsets();
  const fssaiUpload = useUploadFssaiLicenceDocument();
  const [isPicking, setIsPicking] = useState(false);

  const handleAlreadyHaveFssai = async () => {
    try {
      setIsPicking(true);
      const result = await DocumentPicker.pickSingle({ type: [DocumentPickerTypes.pdf, DocumentPickerTypes.images] });
      fssaiUpload.uploadAndRegister(
        { uri: result.uri, type: result.type ?? undefined, fileName: result.name ?? undefined },
        {
          onSuccess: () => {
            setIsPicking(false);
            Alert.alert('Uploaded', 'Your FSSAI licence was submitted for verification.', [{ text: 'OK', onPress: () => navigation.goBack() }]);
          },
          onError: (error) => {
            setIsPicking(false);
            Alert.alert('Could not upload file', error instanceof KitchenApiError ? error.message : 'Please try again.');
          },
        },
      );
    } catch (error) {
      setIsPicking(false);
      if (DocumentPicker.isCancel(error)) return;
      Alert.alert('Could not select file', 'Please try again.');
    }
  };

  const isBusy = isPicking || fssaiUpload.isPending;

  return (
    <Screen background="page">
      <AppBar onBack={() => navigation.goBack()} />
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: theme.spacing.paddings.xxl + Math.max(insets.bottom, 24) }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.iconWrap}>
          <ShieldCheck size={28} color={theme.colors.brand.primary} />
        </View>
        <Text style={styles.title}>FSSAI licence</Text>
        <Text style={styles.body}>
          Every food business in India needs a valid FSSAI food-safety licence. Already have one, or want FreshBhoj to handle the
          registration for you?
        </Text>

        {previousRequest?.status === 'REJECTED' ? (
          <Card style={styles.noticeCard}>
            <Text style={styles.noticeTitle}>Your last application needs changes</Text>
            <Text style={styles.noticeBody}>{previousRequest.rejectionReason ?? 'Please try again with updated documents.'}</Text>
          </Card>
        ) : null}

        <Card style={styles.optionCard} onPress={onGetAssistance}>
          <View style={styles.optionRow}>
            <ShieldCheck size={18} color={theme.colors.brand.primary} />
            <View style={styles.optionTextWrap}>
              <Text style={styles.optionTitle}>Get FSSAI assistance</Text>
              <Text style={styles.optionSubtitle}>FreshBhoj handles the government registration for you — ₹1,500 all-in.</Text>
            </View>
          </View>
        </Card>

        <Card style={styles.optionCard} onPress={isBusy ? undefined : handleAlreadyHaveFssai}>
          <View style={styles.optionRow}>
            <FileCheck2 size={18} color={theme.colors.brand.primary} />
            <View style={styles.optionTextWrap}>
              <Text style={styles.optionTitle}>I already have FSSAI</Text>
              <Text style={styles.optionSubtitle}>{isBusy ? 'Uploading…' : 'Upload your existing licence certificate'}</Text>
            </View>
          </View>
        </Card>
      </ScrollView>
    </Screen>
  );
};

export default FssaiAssistanceChoice;

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: theme.layout.screenPadding, paddingTop: theme.spacing.paddings.sm, alignItems: 'center' },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: theme.radius.round,
    backgroundColor: theme.colors.brand.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.paddings.lg,
  },
  title: { ...theme.text.h2, color: theme.colors.text.primary, textAlign: 'center' },
  body: { ...theme.text.bodySmall, color: theme.colors.text.secondary, textAlign: 'center', marginTop: theme.spacing.paddings.sm },
  noticeCard: { width: '100%', marginTop: theme.spacing.paddings.lg, backgroundColor: theme.colors.state.errorBg },
  noticeTitle: { ...theme.text.label, color: theme.colors.state.error, marginBottom: 4 },
  noticeBody: { ...theme.text.bodySmall, color: theme.colors.text.secondary },
  optionCard: { width: '100%', marginTop: theme.spacing.paddings.lg },
  optionRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.paddings.sm },
  optionTextWrap: { flex: 1 },
  optionTitle: { ...theme.text.h4, color: theme.colors.text.primary },
  optionSubtitle: { ...theme.text.bodySmall, color: theme.colors.text.secondary, marginTop: 2 },
});
