
import React from 'react';
import { ScrollView, View, Text, StyleSheet, Platform, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@react-navigation/native';
import { colors, commonStyles, getTranslation, Language } from '@/styles/commonStyles';
import { useWidget } from '@/contexts/WidgetContext';
import { IconSymbol } from '@/components/IconSymbol';
import { router } from 'expo-router';

export default function AchievementsScreen() {
  const theme = useTheme();
  const { userStats, userProfile } = useWidget();
  const currentLanguage: Language = userProfile?.language || 'en';

  if (!userStats) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
        <Text style={commonStyles.text}>Loading...</Text>
      </SafeAreaView>
    );
  }

  const achievementTiers = {
    consecutive_days: [5, 15, 30, 50, 100],
    todos_completed: [10, 25, 50, 100, 500, 1000],
    recipes_created: [2, 5, 7, 10, 15, 20],
    shopping_items: [30, 80, 150, 200, 500],
  };

  const getAchievementProgress = (type: string, value: number) => {
    const tiers = achievementTiers[type as keyof typeof achievementTiers] || [];
    return tiers.filter(tier => value >= tier).length;
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={24} color={colors.text} />
        </Pressable>
        <Text style={commonStyles.subtitle}>{getTranslation('achievements.title', currentLanguage)}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.contentContainer,
          Platform.OS !== 'ios' && styles.contentContainerWithTabBar
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[commonStyles.card, styles.levelCard]}>
          <View style={styles.levelContent}>
            <View style={styles.levelInfo}>
              <Text style={styles.levelNumber}>{userStats.level}</Text>
              <Text style={commonStyles.textSecondary}>{getTranslation('achievements.level', currentLanguage)}</Text>
            </View>
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${userStats.levelProgress * 100}%`,
                      backgroundColor: colors.primary,
                    },
                  ]}
                />
              </View>
              <Text style={commonStyles.textSecondary}>
                {Math.round(userStats.levelProgress * 100)}%
              </Text>
            </View>
          </View>
          <View style={styles.pointsInfo}>
            <IconSymbol name="star.fill" size={24} color={colors.accent} />
            <Text style={styles.pointsText}>{userStats.totalPoints}</Text>
            <Text style={commonStyles.textSecondary}>{getTranslation('achievements.points', currentLanguage)}</Text>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <View style={[commonStyles.card, styles.statCard]}>
            <IconSymbol name="calendar" size={32} color={colors.primary} />
            <Text style={styles.statValue}>{userStats.consecutiveDays}</Text>
            <Text style={commonStyles.textSecondary}>
              {getTranslation('achievements.consecutiveDays', currentLanguage)}
            </Text>
          </View>

          <View style={[commonStyles.card, styles.statCard]}>
            <IconSymbol name="checkmark.circle.fill" size={32} color={colors.secondary} />
            <Text style={styles.statValue}>{userStats.todosCompleted}</Text>
            <Text style={commonStyles.textSecondary}>
              {getTranslation('achievements.todosCompleted', currentLanguage)}
            </Text>
          </View>

          <View style={[commonStyles.card, styles.statCard]}>
            <IconSymbol name="book.fill" size={32} color={colors.accent} />
            <Text style={styles.statValue}>{userStats.recipesCreated}</Text>
            <Text style={commonStyles.textSecondary}>
              {getTranslation('achievements.recipesCreated', currentLanguage)}
            </Text>
          </View>

          <View style={[commonStyles.card, styles.statCard]}>
            <IconSymbol name="cart.fill" size={32} color={colors.warning} />
            <Text style={styles.statValue}>{userStats.shoppingItemsAdded}</Text>
            <Text style={commonStyles.textSecondary}>
              {getTranslation('achievements.shoppingItems', currentLanguage)}
            </Text>
          </View>
        </View>

        <Text style={[commonStyles.subtitle, { marginTop: 24 }]}>
          {getTranslation('achievements.badge', currentLanguage)}s
        </Text>

        <View style={styles.badgesContainer}>
          <View style={styles.badgeRow}>
            <View style={[commonStyles.card, styles.badgeCard]}>
              <IconSymbol
                name="calendar"
                size={32}
                color={getAchievementProgress('consecutive_days', userStats.consecutiveDays) > 0 ? colors.primary : colors.lightGray}
              />
              <Text style={commonStyles.textSecondary}>5 Days</Text>
              <Text style={commonStyles.textSecondary}>
                {getAchievementProgress('consecutive_days', userStats.consecutiveDays) > 0
                  ? getTranslation('achievements.unlocked', currentLanguage)
                  : getTranslation('achievements.locked', currentLanguage)}
              </Text>
            </View>

            <View style={[commonStyles.card, styles.badgeCard]}>
              <IconSymbol
                name="checkmark.circle.fill"
                size={32}
                color={getAchievementProgress('todos_completed', userStats.todosCompleted) > 0 ? colors.secondary : colors.lightGray}
              />
              <Text style={commonStyles.textSecondary}>10 To-Dos</Text>
              <Text style={commonStyles.textSecondary}>
                {getAchievementProgress('todos_completed', userStats.todosCompleted) > 0
                  ? getTranslation('achievements.unlocked', currentLanguage)
                  : getTranslation('achievements.locked', currentLanguage)}
              </Text>
            </View>
          </View>

          <View style={styles.badgeRow}>
            <View style={[commonStyles.card, styles.badgeCard]}>
              <IconSymbol
                name="book.fill"
                size={32}
                color={getAchievementProgress('recipes_created', userStats.recipesCreated) > 0 ? colors.accent : colors.lightGray}
              />
              <Text style={commonStyles.textSecondary}>2 Recipes</Text>
              <Text style={commonStyles.textSecondary}>
                {getAchievementProgress('recipes_created', userStats.recipesCreated) > 0
                  ? getTranslation('achievements.unlocked', currentLanguage)
                  : getTranslation('achievements.locked', currentLanguage)}
              </Text>
            </View>

            <View style={[commonStyles.card, styles.badgeCard]}>
              <IconSymbol
                name="cart.fill"
                size={32}
                color={getAchievementProgress('shopping_items', userStats.shoppingItemsAdded) > 0 ? colors.warning : colors.lightGray}
              />
              <Text style={commonStyles.textSecondary}>30 Items</Text>
              <Text style={commonStyles.textSecondary}>
                {getAchievementProgress('shopping_items', userStats.shoppingItemsAdded) > 0
                  ? getTranslation('achievements.unlocked', currentLanguage)
                  : getTranslation('achievements.locked', currentLanguage)}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  contentContainerWithTabBar: {
    paddingBottom: 100,
  },
  levelCard: {
    marginBottom: 24,
  },
  levelContent: {
    marginBottom: 16,
  },
  levelInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  levelNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.primary,
  },
  progressContainer: {
    gap: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.lightGray,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  pointsInfo: {
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
  },
  pointsText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    width: '48%',
    alignItems: 'center',
    paddingVertical: 16,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 8,
  },
  badgesContainer: {
    gap: 12,
    marginBottom: 24,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  badgeCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
  },
});
