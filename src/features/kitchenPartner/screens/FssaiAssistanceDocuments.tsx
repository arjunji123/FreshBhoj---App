import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import DocumentPicker, { types as DocumentPickerTypes } from 'react-native-document-picker';
import { Camera, CreditCard, Home, UserSquare2 } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '@app/theme/index';
import { Badge, Button, Card, Screen } from '@components/ui';
import type { KitchenPartnerNavigation } from '@app/navigation/navigation.types';
import { KitchenApiError } from '../api/kitchenClient';
import { useFssaiAssistanceStatus, useKitchenUpload, useUploadFssaiAssistanceDocument } from '../hooks/useKitchenPortal';
import type { DocumentStatus, FssaiAssistanceDocument, FssaiAssistanceDocumentType } from '../kitchenPartner.types';

const STATUS_TONE: Record<DocumentStatus, 'info' | 'accent' | 'danger'> = {
  PENDING: 'info',
  VERIFIED: 'accent',
  REJECTED: 'danger',
};

const REQUIRED_TYPES: FssaiAssistanceDocumentType[] = ['IDENTITY_PROOF', 'ADDRESS_PROOF', 'KITCHEN_PHOTO', 'PASSPORT_PHOTO'];

interface Props {
  documents: FssaiAssistanceDocument[];
}

/** Step 4 — the 4 documents the government application needs. Mirrors `KitchenRegisterDocuments`'s pick-upload-register pattern. */
const FssaiAssistanceDocuments: React.FC<Props> = ({ documents }) => {
  const navigation = useNavigation<KitchenPartnerNavigation>();
  const insets = useSafeAreaInsets();
  const status = useFssaiAssistanceStatus();
  const upload = useKitchenUpload();
  const registerDocument = useUploadFssaiAssistanceDocument();

  const [pendingSlot, setPendingSlot] = useState<FssaiAssistanceDocumentType | null>(null);

  const findDoc = (type: FssaiAssistanceDocumentType) => documents.find((d) => d.type === type);
  const hasAllRequired = REQUIRED_TYPES.every((type) => findDoc(type));

  const registerAfterUpload = (type: FssaiAssistanceDocumentType, fileUrl: string) => {
    registerDocument.mutate(
      { type, fileUrl },
      {
        onError: (error) => Alert.alert('Could not save document', error instanceof KitchenApiError ? error.message : 'Please try again.'),
        onSettled: () => setPendingSlot(null),
      },
    );
  };

  const handlePickDocument = async (type: 'IDENTITY_PROOF' | 'ADDRESS_PROOF') => {
    try {
      const result = await DocumentPicker.pickSingle({ type: [DocumentPickerTypes.pdf, DocumentPickerTypes.images] });
      setPendingSlot(type);
      upload.mutate(
        {
          asset: { uri: result.uri, type: result.type ?? undefined, fileName: result.name ?? undefined },
          purpose: 'FSSAI_ASSISTANCE_DOCUMENT',
        },
        {
          onSuccess: (uploaded) => registerAfterUpload(type, uploaded.url),
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

  const handlePickPhoto = async (type: 'KITCHEN_PHOTO' | 'PASSPORT_PHOTO') => {
    const result = await launchImageLibrary({ mediaType: 'photo', quality: 0.8, selectionLimit: 1 });
    if (result.didCancel || !result.assets?.[0]?.uri) return;
    const asset = result.assets[0];
    setPendingSlot(type);
    upload.mutate(
      {
        asset: { uri: asset.uri!, type: asset.type, fileName: asset.fileName },
        purpose: 'FSSAI_ASSISTANCE_DOCUMENT',
        fallbackType: 'image/jpeg',
      },
      {
        onSuccess: (uploaded) => registerAfterUpload(type, uploaded.url),
        onError: (error) => {
          setPendingSlot(null);
          Alert.alert('Could not upload photo', error instanceof KitchenApiError ? error.message : 'Please try again.');
        },
      },
    );
  };

  const handleContinue = () => {
    if (!hasAllRequired) {
      Alert.alert('Almost there', 'Upload all 4 documents to continue.');
      return;
    }
    status.refetch();
  };

  return (
    <Screen background="page">
      <View style={styles.header}>
        <Button title="Back" variant="ghost" size="sm" fullWidth={false} onPress={() => navigation.goBack()} />
      </View>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: theme.spacing.paddings.xxl + Math.max(insets.bottom, 24) }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={theme.text.h2}>Upload your documents</Text>
        <Text style={styles.subtitle}>These go straight into the government application FreshBhoj files for you.</Text>

        <DocumentSlot
          icon={<CreditCard size={20} color={theme.colors.brand.primary} />}
          title="Identity proof"
          hint="Aadhaar, PAN, or voter ID"
          doc={findDoc('IDENTITY_PROOF')}
          isUploading={pendingSlot === 'IDENTITY_PROOF'}
          onPress={() => handlePickDocument('IDENTITY_PROOF')}
        />
        <DocumentSlot
          icon={<Home size={20} color={theme.colors.brand.primary} />}
          title="Address proof"
          hint="Utility bill, rent agreement, or similar"
          doc={findDoc('ADDRESS_PROOF')}
          isUploading={pendingSlot === 'ADDRESS_PROOF'}
          onPress={() => handlePickDocument('ADDRESS_PROOF')}
        />
        <DocumentSlot
          icon={<Camera size={20} color={theme.colors.brand.primary} />}
          title="Kitchen photo"
          hint="A clear photo of your kitchen"
          doc={findDoc('KITCHEN_PHOTO')}
          isUploading={pendingSlot === 'KITCHEN_PHOTO'}
          onPress={() => handlePickPhoto('KITCHEN_PHOTO')}
        />
        <DocumentSlot
          icon={<UserSquare2 size={20} color={theme.colors.brand.primary} />}
          title="Passport-size photo"
          hint="A recent photo of yourself"
          doc={findDoc('PASSPORT_PHOTO')}
          isUploading={pendingSlot === 'PASSPORT_PHOTO'}
          onPress={() => handlePickPhoto('PASSPORT_PHOTO')}
        />

        <Button
          title={status.isRefetching ? 'Checking…' : 'Continue'}
          onPress={handleContinue}
          loading={status.isRefetching}
          disabled={!hasAllRequired || status.isRefetching}
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
      {doc ? (
        <Badge label={doc.status === 'VERIFIED' ? 'Verified' : doc.status === 'REJECTED' ? 'Rejected' : 'Pending review'} tone={STATUS_TONE[doc.status]} size="sm" />
      ) : null}
    </Card>
  );
}

export default FssaiAssistanceDocuments;

const styles = StyleSheet.create({
  header: { paddingHorizontal: theme.layout.screenPadding, paddingTop: theme.spacing.paddings.sm },
  scroll: { paddingHorizontal: theme.layout.screenPadding, paddingTop: theme.spacing.paddings.sm },
  subtitle: { ...theme.text.bodySmall, color: theme.colors.text.secondary, marginTop: 4, marginBottom: theme.spacing.paddings.lg },
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
