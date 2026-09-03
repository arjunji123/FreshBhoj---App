import React, { useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { Briefcase, Home, MapPin } from 'lucide-react-native';
import { theme } from '@app/theme/index';
import { ApiError } from '@api';
import type { AddressLabel } from '@api/types';
import { AppBar, Button, Chip, Input, StickyBar } from '@components/ui';
import type { PrivateNavigation, PrivateStackParamList } from '@app/navigation/navigation.types';
import { useAddresses, useCreateAddress, useUpdateAddress } from '../hooks/useProfile';

type Route = RouteProp<PrivateStackParamList, 'AddressForm'>;

const LABELS: Array<{ key: AddressLabel; label: string; Icon: any }> = [
  { key: 'HOME', label: 'Home', Icon: Home },
  { key: 'WORK', label: 'Work', Icon: Briefcase },
  { key: 'OTHER', label: 'Other', Icon: MapPin },
];

const AddressForm = () => {
  const navigation = useNavigation<PrivateNavigation>();
  const { params } = useRoute<Route>();

  const { data: addresses } = useAddresses();
  const existing = useMemo(
    () => addresses?.find((address) => address.id === params?.addressId),
    [addresses, params?.addressId],
  );

  const [label, setLabel] = useState<AddressLabel>(existing?.label ?? 'HOME');
  const [line1, setLine1] = useState(existing?.line1 ?? '');
  const [line2, setLine2] = useState(existing?.line2 ?? '');
  const [landmark, setLandmark] = useState(existing?.landmark ?? '');
  const [locality, setLocality] = useState(existing?.locality ?? '');
  const [pincode, setPincode] = useState(existing?.pincode ?? '');
  const [receiverName, setReceiverName] = useState(existing?.receiverName ?? '');
  const [receiverPhone, setReceiverPhone] = useState(existing?.receiverPhone ?? '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const create = useCreateAddress();
  const update = useUpdateAddress();
  const isSaving = create.isPending || update.isPending;

  const validate = () => {
    const next: Record<string, string> = {};
    if (line1.trim().length < 5) next.line1 = 'Enter at least 5 characters';
    if (!/^\d{6}$/.test(pincode)) next.pincode = 'Pincode must be 6 digits';
    if (receiverPhone && !/^[6-9]\d{9}$/.test(receiverPhone)) {
      next.receiverPhone = 'Enter a valid 10-digit number';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;

    const payload = {
      label,
      line1: line1.trim(),
      line2: line2.trim() || undefined,
      landmark: landmark.trim() || undefined,
      locality: locality.trim() || undefined,
      pincode,
      receiverName: receiverName.trim() || undefined,
      receiverPhone: receiverPhone.trim() || undefined,
      city: 'Jaipur',
      state: 'Rajasthan',
    };

    const onError = (error: unknown) =>
      Alert.alert(
        'Could not save address',
        error instanceof ApiError ? error.message : 'Please try again.',
      );

    if (existing) {
      update.mutate(
        { id: existing.id, input: payload },
        { onSuccess: () => navigation.goBack(), onError },
      );
    } else {
      create.mutate(payload, { onSuccess: () => navigation.goBack(), onError });
    }
  };

  return (
    <View style={styles.screen}>
      <AppBar
        title={existing ? 'Edit address' : 'Add address'}
        onBack={navigation.goBack}
      />

      <KeyboardAwareScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        bottomOffset={24}
      >
        <Text style={[theme.text.overline, styles.sectionLabel]}>SAVE AS</Text>
        <View style={styles.labelRow}>
          {LABELS.map(({ key, label: text, Icon }) => (
            <Chip
              key={key}
              label={text}
              selected={label === key}
              onPress={() => setLabel(key)}
              icon={
                <Icon
                  size={14}
                  color={label === key ? theme.colors.text.inverse : theme.colors.accent[600]}
                  strokeWidth={2.4}
                />
              }
            />
          ))}
        </View>

        <Input
          label="Flat / House / Building"
          value={line1}
          onChangeText={setLine1}
          placeholder="Flat 402, Green Valley Apartments"
          error={errors.line1}
          containerStyle={styles.field}
        />
        <Input
          label="Street / Area"
          value={line2}
          onChangeText={setLine2}
          placeholder="Sector 2, Main Road"
          containerStyle={styles.field}
        />
        <Input
          label="Landmark (optional)"
          value={landmark}
          onChangeText={setLandmark}
          placeholder="Opposite Central Park"
          containerStyle={styles.field}
        />
        <Input
          label="Locality"
          value={locality}
          onChangeText={setLocality}
          placeholder="Malviya Nagar"
          containerStyle={styles.field}
        />
        <Input
          label="Pincode"
          value={pincode}
          onChangeText={(value) => setPincode(value.replace(/\D/g, '').slice(0, 6))}
          placeholder="302017"
          keyboardType="number-pad"
          maxLength={6}
          error={errors.pincode}
          containerStyle={styles.field}
        />

        <Text style={[theme.text.overline, styles.sectionLabel]}>RECEIVER (OPTIONAL)</Text>
        <Input
          label="Name"
          value={receiverName}
          onChangeText={setReceiverName}
          placeholder="Who should we hand it to?"
          containerStyle={styles.field}
        />
        <Input
          label="Phone"
          value={receiverPhone}
          onChangeText={(value) => setReceiverPhone(value.replace(/\D/g, '').slice(0, 10))}
          placeholder="9876543210"
          keyboardType="phone-pad"
          prefix="+91"
          maxLength={10}
          error={errors.receiverPhone}
          containerStyle={styles.field}
        />
      </KeyboardAwareScrollView>

      <StickyBar>
        <Button
          title={existing ? 'Save changes' : 'Save address'}
          onPress={handleSave}
          loading={isSaving}
        />
      </StickyBar>
    </View>
  );
};

export default AddressForm;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.surface.page,
  },
  scroll: {
    padding: theme.layout.screenPadding,
    paddingBottom: theme.spacing.xxl,
  },
  sectionLabel: {
    color: theme.colors.text.tertiary,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  labelRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  field: {
    marginTop: theme.spacing.lg,
  },
});
