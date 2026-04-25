import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import {
  MapPin,
  ChevronRight,
  Bell,
  Shield,
  HelpCircle,
  LogOut,
  Heart,
  Package,
  Star,
  Camera,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '@app/theme/index';
import AppGradient from '@components/AppGradient';
import GradientText from '@components/GradientText';
import { useAuthStore } from '@features/authentication/store/authStore';

interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  sublabel?: string;
  rightText?: string;
  danger?: boolean;
  onPress?: () => void;
}

const MenuItem: React.FC<MenuItemProps> = ({ icon, label, sublabel, rightText, danger, onPress }) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
    <View style={[styles.menuIconWrapper, danger && styles.menuIconWrapperDanger]}>
      {icon}
    </View>
    <View style={styles.menuTextBlock}>
      <Text style={[styles.menuLabel, danger && styles.menuLabelDanger]}>{label}</Text>
      {sublabel ? <Text style={styles.menuSublabel}>{sublabel}</Text> : null}
    </View>
    {rightText ? (
      <View style={styles.menuRightBadge}>
        <Text style={styles.menuRightText}>{rightText}</Text>
      </View>
    ) : (
      <ChevronRight size={16} color={danger ? '#EF4444' : '#CBD5E1'} strokeWidth={2} />
    )}
  </TouchableOpacity>
);

const Profile = () => {
  const insets = useSafeAreaInsets();
  const fullName = useAuthStore((s) => s.fullName);
  const email = useAuthStore((s) => s.email);
  const profileImageUri = useAuthStore((s) => s.profileImageUri);
  const address = useAuthStore((s) => s.location.address);
  const reset = useAuthStore((s) => s.reset);

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: () => {
          reset();
        },
      },
    ]);
  };

  const displayName = fullName || 'Foodie Explorer';
  const displayEmail = email || 'Not provided';

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
      >
        {/* Header Banner */}
        <AppGradient
          colors={theme.colors.defaultColor}
          locations={theme.colors.defaultLocations}
          direction="diagonal"
          style={styles.headerBanner}
        >
          <View style={styles.avatarWrapper}>
            {profileImageUri ? (
              <Image source={{ uri: profileImageUri }} style={styles.avatar} resizeMode="cover" />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitial}>{displayName[0]?.toUpperCase() || '?'}</Text>
              </View>
            )}
            <TouchableOpacity style={styles.cameraButton} activeOpacity={0.85}>
              <Camera size={14} color="#FFFFFF" strokeWidth={2} />
            </TouchableOpacity>
          </View>

          <Text style={styles.profileName}>{displayName}</Text>
          <Text style={styles.profileEmail}>{displayEmail}</Text>

          {address ? (
            <View style={styles.locationRow}>
              <MapPin size={13} color="rgba(255,255,255,0.8)" strokeWidth={2} />
              <Text style={styles.locationText} numberOfLines={1}>{address}</Text>
            </View>
          ) : null}
        </AppGradient>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          {[
            { label: 'Orders', value: '24' },
            { label: 'Saved', value: '8' },
            { label: 'Reviews', value: '12' },
          ].map((stat) => (
            <View key={stat.label} style={styles.statItem}>
              <GradientText
                colors={theme.colors.defaultColor}
                direction="diagonal"
                style={styles.statValue}
              >
                {stat.value}
              </GradientText>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Menu Sections */}
        <View style={styles.menuSection}>
          <Text style={styles.menuSectionTitle}>MY ACTIVITY</Text>
          <View style={styles.menuCard}>
            <MenuItem
              icon={<Package size={18} color={theme.colors.gradient2} strokeWidth={1.5} />}
              label="My Orders"
              sublabel="View order history"
              onPress={() => {}}
            />
            <View style={styles.menuDivider} />
            <MenuItem
              icon={<Heart size={18} color={theme.colors.gradient2} strokeWidth={1.5} />}
              label="Favourites"
              sublabel="Saved kitchens & dishes"
              onPress={() => {}}
            />
            <View style={styles.menuDivider} />
            <MenuItem
              icon={<Star size={18} color={theme.colors.gradient2} strokeWidth={1.5} />}
              label="My Reviews"
              sublabel="Ratings you've given"
              rightText="12"
              onPress={() => {}}
            />
          </View>
        </View>

        <View style={styles.menuSection}>
          <Text style={styles.menuSectionTitle}>PREFERENCES</Text>
          <View style={styles.menuCard}>
            <MenuItem
              icon={<Bell size={18} color="#3B82F6" strokeWidth={1.5} />}
              label="Notifications"
              sublabel="Manage alerts"
              onPress={() => {}}
            />
            <View style={styles.menuDivider} />
            <MenuItem
              icon={<MapPin size={18} color="#10B981" strokeWidth={1.5} />}
              label="Saved Addresses"
              sublabel="Manage delivery locations"
              onPress={() => {}}
            />
          </View>
        </View>

        <View style={styles.menuSection}>
          <Text style={styles.menuSectionTitle}>SUPPORT</Text>
          <View style={styles.menuCard}>
            <MenuItem
              icon={<HelpCircle size={18} color="#F59E0B" strokeWidth={1.5} />}
              label="Help & Support"
              onPress={() => {}}
            />
            <View style={styles.menuDivider} />
            <MenuItem
              icon={<Shield size={18} color="#8B5CF6" strokeWidth={1.5} />}
              label="Privacy Policy"
              onPress={() => {}}
            />
          </View>
        </View>

        <View style={styles.menuSection}>
          <View style={styles.menuCard}>
            <MenuItem
              icon={<LogOut size={18} color="#EF4444" strokeWidth={1.5} />}
              label="Log Out"
              danger
              onPress={handleLogout}
            />
          </View>
        </View>

        <Text style={styles.version}>FreshBhoj v1.0.0</Text>
      </ScrollView>
    </View>
  );
};

export default Profile;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  headerBanner: {
    paddingTop: 30,
    paddingBottom: 28,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 14,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  avatarPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    fontSize: 36,
    fontFamily: theme.typography.fontFamilies.plusJakartaSans.bold,
    color: '#FFFFFF',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  profileName: {
    fontSize: theme.typography.fontSizes.xxl,
    fontFamily: theme.typography.fontFamilies.plusJakartaSans.bold,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: theme.typography.fontSizes.md,
    fontFamily: theme.typography.fontFamilies.plusJakartaSans.regular,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: theme.typography.fontSizes.sm,
    fontFamily: theme.typography.fontFamilies.plusJakartaSans.medium,
    color: 'rgba(255,255,255,0.75)',
  },
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: -1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 16,
    marginBottom: 20,
    shadowColor: 'rgba(0,0,0,0.1)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 5,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: theme.typography.fontSizes.xxl,
    fontFamily: theme.typography.fontFamilies.plusJakartaSans.bold,
  },
  statLabel: {
    fontSize: theme.typography.fontSizes.sm,
    fontFamily: theme.typography.fontFamilies.plusJakartaSans.regular,
    color: '#94A3B8',
    marginTop: 2,
  },
  menuSection: {
    marginHorizontal: 20,
    marginBottom: 16,
  },
  menuSectionTitle: {
    fontSize: theme.typography.fontSizes.xs,
    fontFamily: theme.typography.fontFamilies.plusJakartaSans.semibold,
    color: '#94A3B8',
    letterSpacing: 1,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  menuCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: 'rgba(0,0,0,0.06)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 14,
  },
  menuIconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#FFF5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuIconWrapperDanger: {
    backgroundColor: '#FEF2F2',
  },
  menuTextBlock: {
    flex: 1,
  },
  menuLabel: {
    fontSize: theme.typography.fontSizes.md,
    fontFamily: theme.typography.fontFamilies.plusJakartaSans.semibold,
    color: '#1E293B',
  },
  menuLabelDanger: {
    color: '#EF4444',
  },
  menuSublabel: {
    fontSize: theme.typography.fontSizes.xs,
    fontFamily: theme.typography.fontFamilies.plusJakartaSans.regular,
    color: '#94A3B8',
    marginTop: 2,
  },
  menuRightBadge: {
    backgroundColor: theme.colors.gradient1,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  menuRightText: {
    fontSize: theme.typography.fontSizes.xs,
    fontFamily: theme.typography.fontFamilies.plusJakartaSans.bold,
    color: '#FFFFFF',
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginLeft: 68,
  },
  version: {
    textAlign: 'center',
    fontSize: theme.typography.fontSizes.xs,
    fontFamily: theme.typography.fontFamilies.plusJakartaSans.regular,
    color: '#CBD5E1',
    marginTop: 8,
    marginBottom: 4,
  },
});
