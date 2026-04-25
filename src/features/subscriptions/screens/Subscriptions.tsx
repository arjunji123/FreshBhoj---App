import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Check, Star, Zap, Crown, ChevronRight, Calendar, Package } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '@app/theme/index';
import AppGradient from '@components/AppGradient';
import GradientText from '@components/GradientText';

type PlanId = 'daily' | 'weekly' | 'monthly';

interface Plan {
  id: PlanId;
  name: string;
  emoji: string;
  price: number;
  period: string;
  meals: number;
  savings: string | null;
  features: string[];
  popular: boolean;
}

const PLANS: Plan[] = [
  {
    id: 'daily',
    name: 'Taste it',
    emoji: '🥣',
    price: 99,
    period: 'per day',
    meals: 2,
    savings: null,
    features: ['2 meals/day', 'Veg or Non-Veg', 'Free delivery', 'Skip anytime'],
    popular: false,
  },
  {
    id: 'weekly',
    name: 'Weekly Feast',
    emoji: '🍱',
    price: 599,
    period: 'per week',
    meals: 14,
    savings: 'Save ₹94',
    features: ['14 meals/week', 'Choose cuisine daily', 'Priority delivery', 'Pause anytime', 'Free dessert on weekends'],
    popular: true,
  },
  {
    id: 'monthly',
    name: 'Full Month',
    emoji: '👑',
    price: 1999,
    period: 'per month',
    meals: 60,
    savings: 'Save ₹580',
    features: ['60 meals/month', 'Personalized menu', 'Express delivery', 'Pause + skip + change', 'Free snack box monthly', 'Dedicated kitchen chef'],
    popular: false,
  },
];

const ACTIVE_ORDER = {
  plan: 'Weekly Feast',
  mealsLeft: 9,
  totalMeals: 14,
  nextDelivery: 'Today, 1:00 PM',
  kitchen: 'Mama\'s Kitchen',
};

const Subscriptions = () => {
  const insets = useSafeAreaInsets();
  const [selectedPlan, setSelectedPlan] = useState<PlanId>('weekly');

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
      >
        {/* Header */}
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>Subscriptions</Text>
          <Text style={styles.headerSubtitle}>Fresh meals delivered daily — your way</Text>
        </View>

        {/* Active Subscription Card */}
        <AppGradient
          colors={theme.colors.defaultColor}
          locations={theme.colors.defaultLocations}
          direction="diagonal"
          style={styles.activeCard}
        >
          <View style={styles.activeCardHeader}>
            <View>
              <Text style={styles.activeCardLabel}>ACTIVE PLAN</Text>
              <Text style={styles.activeCardPlan}>{ACTIVE_ORDER.plan}</Text>
            </View>
            <View style={styles.activeCardBadge}>
              <Zap size={12} color={theme.colors.gradient1} fill={theme.colors.gradient1} />
              <Text style={styles.activeCardBadgeText}>Active</Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${(ACTIVE_ORDER.mealsLeft / ACTIVE_ORDER.totalMeals) * 100}%` },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {ACTIVE_ORDER.mealsLeft}/{ACTIVE_ORDER.totalMeals} meals left
            </Text>
          </View>

          <View style={styles.activeCardFooter}>
            <View style={styles.activeCardInfo}>
              <Calendar size={14} color="rgba(255,255,255,0.8)" strokeWidth={2} />
              <Text style={styles.activeCardInfoText}>{ACTIVE_ORDER.nextDelivery}</Text>
            </View>
            <View style={styles.activeCardInfo}>
              <Package size={14} color="rgba(255,255,255,0.8)" strokeWidth={2} />
              <Text style={styles.activeCardInfoText}>{ACTIVE_ORDER.kitchen}</Text>
            </View>
          </View>
        </AppGradient>

        {/* Plan Selection */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Choose a Plan</Text>

          {PLANS.map((plan) => {
            const isSelected = selectedPlan === plan.id;

            return (
              <TouchableOpacity
                key={plan.id}
                activeOpacity={0.85}
                onPress={() => setSelectedPlan(plan.id)}
                style={[styles.planCard, isSelected && styles.planCardSelected]}
              >
                {plan.popular && (
                  <AppGradient
                    colors={theme.colors.defaultColor}
                    locations={theme.colors.defaultLocations}
                    direction="diagonal"
                    style={styles.popularBadge}
                  >
                    <Star size={10} color="#FFFFFF" fill="#FFFFFF" />
                    <Text style={styles.popularBadgeText}>Most Popular</Text>
                  </AppGradient>
                )}

                <View style={styles.planHeader}>
                  <View style={styles.planLeft}>
                    <Text style={styles.planEmoji}>{plan.emoji}</Text>
                    <View>
                      <Text style={styles.planName}>{plan.name}</Text>
                      <Text style={styles.planMeals}>{plan.meals} meals included</Text>
                    </View>
                  </View>
                  <View style={styles.planRight}>
                    <GradientText
                      colors={isSelected ? theme.colors.defaultColor : ['#0F172A', '#0F172A', '#0F172A']}
                      direction="diagonal"
                      style={styles.planPrice}
                    >
                      ₹{plan.price}
                    </GradientText>
                    <Text style={styles.planPeriod}>{plan.period}</Text>
                    {plan.savings && (
                      <View style={styles.savingsBadge}>
                        <Text style={styles.savingsText}>{plan.savings}</Text>
                      </View>
                    )}
                  </View>
                </View>

                {/* Features */}
                <View style={styles.featuresList}>
                  {plan.features.map((feature) => (
                    <View key={feature} style={styles.featureItem}>
                      <Check size={13} color={isSelected ? theme.colors.gradient2 : '#94A3B8'} strokeWidth={2.5} />
                      <Text style={[styles.featureText, isSelected && styles.featureTextActive]}>
                        {feature}
                      </Text>
                    </View>
                  ))}
                </View>

                {/* Selection dot */}
                <View style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}>
                  {isSelected && <View style={styles.radioInner} />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* CTA Button */}
        <View style={styles.ctaContainer}>
          <TouchableOpacity activeOpacity={0.85}>
            <AppGradient
              colors={theme.colors.defaultColor}
              locations={theme.colors.defaultLocations}
              direction="diagonal"
              style={styles.ctaButton}
            >
              <Crown size={18} color="#FFFFFF" strokeWidth={2} />
              <Text style={styles.ctaButtonText}>Subscribe Now</Text>
              <ChevronRight size={18} color="#FFFFFF" strokeWidth={2.5} />
            </AppGradient>
          </TouchableOpacity>
          <Text style={styles.ctaNote}>Cancel anytime · No hidden charges</Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default Subscriptions;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingTop: 4,
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: theme.typography.fontSizes.display2,
    fontFamily: theme.typography.fontFamilies.plusJakartaSans.bold,
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: theme.typography.fontSizes.md,
    fontFamily: theme.typography.fontFamilies.plusJakartaSans.regular,
    color: '#94A3B8',
    marginTop: 2,
  },
  activeCard: {
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 20,
    marginBottom: 28,
  },
  activeCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  activeCardLabel: {
    fontSize: theme.typography.fontSizes.xs,
    fontFamily: theme.typography.fontFamilies.plusJakartaSans.semibold,
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 1,
    marginBottom: 4,
  },
  activeCardPlan: {
    fontSize: theme.typography.fontSizes.xxl,
    fontFamily: theme.typography.fontFamilies.plusJakartaSans.bold,
    color: '#FFFFFF',
  },
  activeCardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  activeCardBadgeText: {
    fontSize: theme.typography.fontSizes.sm,
    fontFamily: theme.typography.fontFamilies.plusJakartaSans.semibold,
    color: theme.colors.gradient2,
  },
  progressContainer: {
    marginBottom: 14,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 3,
    marginBottom: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 3,
  },
  progressText: {
    fontSize: theme.typography.fontSizes.sm,
    fontFamily: theme.typography.fontFamilies.plusJakartaSans.medium,
    color: 'rgba(255,255,255,0.9)',
  },
  activeCardFooter: {
    flexDirection: 'row',
    gap: 20,
  },
  activeCardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  activeCardInfoText: {
    fontSize: theme.typography.fontSizes.sm,
    fontFamily: theme.typography.fontFamilies.plusJakartaSans.medium,
    color: 'rgba(255,255,255,0.85)',
  },
  sectionContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSizes.xl,
    fontFamily: theme.typography.fontFamilies.plusJakartaSans.bold,
    color: '#0F172A',
    marginBottom: 16,
  },
  planCard: {
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    padding: 16,
    marginBottom: 16,
    backgroundColor: '#FAFAFA',
    position: 'relative',
    overflow: 'hidden',
  },
  planCardSelected: {
    borderColor: theme.colors.gradient2,
    backgroundColor: '#FFF5F5',
  },
  popularBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderBottomLeftRadius: 12,
    borderTopRightRadius: 18,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  popularBadgeText: {
    fontSize: theme.typography.fontSizes.xs,
    fontFamily: theme.typography.fontFamilies.plusJakartaSans.bold,
    color: '#FFFFFF',
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  planLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  planEmoji: {
    fontSize: 32,
  },
  planName: {
    fontSize: theme.typography.fontSizes.lg,
    fontFamily: theme.typography.fontFamilies.plusJakartaSans.bold,
    color: '#0F172A',
  },
  planMeals: {
    fontSize: theme.typography.fontSizes.sm,
    fontFamily: theme.typography.fontFamilies.plusJakartaSans.regular,
    color: '#94A3B8',
    marginTop: 2,
  },
  planRight: {
    alignItems: 'flex-end',
  },
  planPrice: {
    fontSize: theme.typography.fontSizes.xxl,
    fontFamily: theme.typography.fontFamilies.plusJakartaSans.bold,
    color: '#0F172A',
  },
  planPeriod: {
    fontSize: theme.typography.fontSizes.xs,
    fontFamily: theme.typography.fontFamilies.plusJakartaSans.regular,
    color: '#94A3B8',
    marginTop: 2,
  },
  savingsBadge: {
    marginTop: 4,
    backgroundColor: '#DCFCE7',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  savingsText: {
    fontSize: theme.typography.fontSizes.xs,
    fontFamily: theme.typography.fontFamilies.plusJakartaSans.semibold,
    color: '#16A34A',
  },
  featuresList: {
    gap: 6,
    paddingRight: 32,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureText: {
    fontSize: theme.typography.fontSizes.sm,
    fontFamily: theme.typography.fontFamilies.plusJakartaSans.regular,
    color: '#64748B',
  },
  featureTextActive: {
    color: '#334155',
  },
  radioOuter: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOuterSelected: {
    borderColor: theme.colors.gradient2,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.gradient2,
  },
  ctaContainer: {
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 12,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderRadius: 24,
    paddingVertical: 18,
    paddingHorizontal: 48,
    width: '100%',
  },
  ctaButtonText: {
    fontSize: theme.typography.fontSizes.xl,
    fontFamily: theme.typography.fontFamilies.plusJakartaSans.bold,
    color: '#FFFFFF',
  },
  ctaNote: {
    fontSize: theme.typography.fontSizes.sm,
    fontFamily: theme.typography.fontFamilies.plusJakartaSans.regular,
    color: '#94A3B8',
    marginTop: 10,
  },
});
