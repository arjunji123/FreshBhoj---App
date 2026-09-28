import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import DocumentPicker, { types as DocumentPickerTypes } from 'react-native-document-picker';
import { Camera, FileText, UtensilsCrossed } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '@app/theme/index';
import { Badge, Button, Card, Input, Screen } from '@components/ui';
import type { KitchenPartnerNavigation } from '@app/navigation/navigation.types';
import { KitchenApiError } from '../api/kitchenClient';
import { useKitchenLogout } from '../hooks/useKitchenAuth';
import {
  useKitchenOnboardingStatus,
  useKitchenUpload,
  useUploadFssaiLicenceDocument,
  useUploadOnboardingDocument,
} from '../hooks/useKitchenPortal';
import RegistrationProgressBar from '../components/RegistrationProgressBar';
import type { DocumentStatus, KitchenDocumentType } from '../kitchenPartner.types';

const STATUS_TONE: Record<DocumentStatus, 'info' | 'accent' | 'danger'> = {
  PENDING: 'info',
  VERIFIED: 'accent',
  REJECTED: 'danger',
};

const REQUIRED_TYPES: KitchenDocumentType[] = ['FSSAI', 'KITCHEN_PHOTO_FRONT', 'KITCHEN_PHOTO_MAIN'];

/** Step 4 of registration — FSSAI licence plus two kitchen photos. */
const KitchenRegisterDocuments = () => {
  const navigation = useNavigation<KitchenPartnerNavigation>();
  const insets = useSafeAreaInsets();
  const onboarding = useKitchenOnboardingStatus();
  const upload = useKitchenUpload();
  const registerDocument = useUploadOnboardingDocument();
  const fssaiUpload = useUploadFssaiLicenceDocument();
  const logout = useKitchenLogout();

  const [fssaiNumber, setFssaiNumber] = useState('');
  const [pendingSlot, setPendingSlot] = useState<KitchenDocumentType | null>(null);

  const documents = onboarding.data?.documents ?? [];
  const findDoc = (type: KitchenDocumentType) => documents.find((d) => d.type === type);
  const hasAllRequired = REQUIRED_TYPES.every((type) => findDoc(type));

  const registerAfterUpload = (type: KitchenDocumentType, fileUrl: string, number?: string) => {
    registerDocument.mutate(
      { type, fileUrl, number },
      {
        onError: (error) =>
          Alert.alert('Could not save document', error instanceof KitchenApiError ? error.message : 'Please try again.'),
        onSettled: () => setPendingSlot(null),
      },
    );
  };

  const handlePickFssai = async () => {
    try {
      const result = await DocumentPicker.pickSingle({ type: [DocumentPickerTypes.pdf, DocumentPickerTypes.images] });
      setPendingSlot('FSSAI');
      fssaiUpload.uploadAndRegister(
        { uri: result.uri, type: result.type ?? undefined, fileName: result.name ?? undefined },
        {
          number: fssaiNumber.trim() || undefined,
          onSuccess: () => setPendingSlot(null),
          onError: (error) => {
            setPendingSlot(null);
            Alert.alert('Could not upload file', error instanceof KitchenApiError ? error.message : 'Please try again.');
          },
        },
      );
    } catch (error) {
      if (DocumentPicker.isCancel(error)) return;
      Alert.alert('Could not select file', 'Please try again.');
    }
  };

  const handlePickPhoto = async (type: 'KITCHEN_PHOTO_FRONT' | 'KITCHEN_PHOTO_MAIN') => {
    const result = await launchImageLibrary({ mediaType: 'photo', quality: 0.8, selectionLimit: 1 });
    if (result.didCancel || !result.assets?.[0]?.uri) return;
    const asset = result.assets[0];
    setPendingSlot(type);
    upload.mutate(
      { asset: { uri: asset.uri!, type: asset.type, fileName: asset.fileName }, purpose: 'DOCUMENT', fallbackType: 'image/jpeg' },
      {
        onSuccess: (uploaded) => registerAfterUpload(type, uploaded.url),
        onError: (error) => {
          setPendingSlot(null);
          Alert.alert('Could not upload photo', error instanceof KitchenApiError ? error.message : 'Please try again.');
        },
      },
    );
  };

  const handleLogout = () => {
    Alert.alert('Log out?', 'You will need your phone number to sign back in.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: () => logout.mutate() },
    ]);
  };

  const handleContinue = () => {
    if (!hasAllRequired) {
      Alert.alert('Almost there', 'Upload your FSSAI licence and both kitchen photos to continue.');
      return;
    }
    onboarding.refetch();
  };

  return (
    <Screen background="page">
      <View style={styles.header}>
        <Text style={theme.text.h2}>Documents</Text>
        <Button title="Log out" variant="ghost" size="sm" fullWidth={false} onPress={handleLogout} />
      </View>
      <TouchableOpacity onPress={() => navigation.navigate('UploadGuide')} style={styles.uploadTipsLink}>
        <Text style={styles.uploadTipsText}>See upload tips</Text>
      </TouchableOpacity>

      {onboarding.data ? (
        <RegistrationProgressBar steps={onboarding.data.steps} progressPercent={onboarding.data.progressPercent} />
      ) : null}

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: theme.spacing.paddings.xxl + Math.max(insets.bottom, 24) }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <DocumentSlot
          icon={<FileText size={20} color={theme.colors.brand.primary} />}
          title="FSSAI licence"
          hint="PDF or photo of your FSSAI registration certificate"
          doc={findDoc('FSSAI')}
          isUploading={pendingSlot === 'FSSAI'}
          onPress={findDoc('FSSAI') ? handlePickFssai : () => navigation.navigate('FssaiAssistance')}
        />
        {!findDoc('FSSAI') ? (
          <Text style={styles.fssaiAssistHint}>
            Don&apos;t have an FSSAI licence yet? Tap above and FreshBhoj can register one for you.
          </Text>
        ) : null}
        <Input
          label="FSSAI licence number (optional)"
          value={fssaiNumber}
          onChangeText={setFssaiNumber}
          placeholder="14-digit licence number"
          keyboardType="numeric"
          containerStyle={styles.field}
        />

        <DocumentSlot
          icon={<Camera size={20} color={theme.colors.brand.primary} />}
          title="Kitchen photo — front"
          hint="A clear photo of your kitchen's entrance"
          doc={findDoc('KITCHEN_PHOTO_FRONT')}
          isUploading={pendingSlot === 'KITCHEN_PHOTO_FRONT'}
          onPress={() => handlePickPhoto('KITCHEN_PHOTO_FRONT')}
        />

        <DocumentSlot
          icon={<UtensilsCrossed size={20} color={theme.colors.brand.primary} />}
          title="Kitchen photo — cooking area"
          hint="A clear photo of where the food is prepared"
          doc={findDoc('KITCHEN_PHOTO_MAIN')}
          isUploading={pendingSlot === 'KITCHEN_PHOTO_MAIN'}
          onPress={() => handlePickPhoto('KITCHEN_PHOTO_MAIN')}
        />

        <Button
          title={onboarding.isRefetching ? 'Checking…' : 'Continue'}
          onPress={handleContinue}
          loading={onboarding.isRefetching}
          disabled={!hasAllRequired || onboarding.isRefetching}
          style={styles.continueButton}
        />
      </ScrollView>
    </Screen>
  );
};

function DocumentSlot({
  icon,
  title,
  hint,
  doc,
  isUploading,
  onPress,
}: {
  icon: React.ReactNode;
  title: string;
  hint: string;
  doc?: { status: DocumentStatus };
  isUploading: boolean;
  onPress: () => void;
}) {
  return (
    <Card style={styles.slotCard} onPress={isUploading ? undefined : onPress}>
      <View style={styles.slotIconWrap}>{icon}</View>
      <View style={styles.slotTextWrap}>
        <Text style={styles.slotTitle} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.slotHint} numberOfLines={2}>
          {isUploading ? 'Uploading…' : doc ? 'Uploaded — tap to replace' : hint}
        </Text>
      </View>
      {doc ? <Badge label={doc.status === 'VERIFIED' ? 'Verified' : doc.status === 'REJECTED' ? 'Rejected' : 'Pending review'} tone={STATUS_TONE[doc.status]} size="sm" /> : null}
    </Card>
  );
}

export default KitchenRegisterDocuments;

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.layout.screenPadding,
    paddingTop: theme.spacing.paddings.sm,
  },
  uploadTipsLink: { paddingHorizontal: theme.layout.screenPadding, marginTop: theme.spacing.paddings.xs },
  uploadTipsText: { ...theme.text.caption, color: theme.colors.text.brand, fontWeight: '700' as const },
  scroll: { paddingHorizontal: theme.layout.screenPadding, paddingTop: theme.spacing.paddings.sm },
  field: { marginBottom: theme.spacing.paddings.md },
  fssaiAssistHint: {
    ...theme.text.caption,
    color: theme.colors.text.brand,
    marginTop: -theme.spacing.paddings.sm,
    marginBottom: theme.spacing.paddings.md,
  },
  slotCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.paddings.sm,
    marginBottom: theme.spacing.paddings.md,
  },
  slotIconWrap: {
    width: 40,
    height: 40,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.brand.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotTextWrap: { flex: 1 },
  slotTitle: { ...theme.text.bodyMedium, color: theme.colors.text.primary, fontWeight: '700' as const },
  slotHint: { ...theme.text.caption, color: theme.colors.text.secondary, marginTop: 2 },
  continueButton: { marginTop: theme.spacing.paddings.sm },
});
