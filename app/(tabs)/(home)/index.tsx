
import React, { useEffect, useState } from "react";
import { Stack, Link, Redirect } from "expo-router";
import { ScrollView, Pressable, StyleSheet, View, Text, Platform } from "react-native";
import { IconSymbol } from "@/components/IconSymbol";
import { useTheme } from "@react-navigation/native";
import { colors, commonStyles, getTranslation, Language } from "@/styles/commonStyles";
import { useWidget } from "@/contexts/WidgetContext";
import { DailyOverview, DrinkTracker } from "@/components/BodyScrollView";

export default function HomeScreen() {
  const theme = useTheme();
  const { userProfile, isLoading } = useWidget();
  const currentLanguage: Language = userProfile?.language || 'en';
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setIsInitialized(true);
    }
  }, [isLoading]);

  if (isLoading) {
    return (
      <View style={[commonStyles.container, { backgroundColor: colors.background }]}>
        <Text style={commonStyles.title}>Loading...</Text>
      </View>
    );
  }

  if (!userProfile) {
    return <Redirect href="/onboarding" />;
  }

  const menuItems = [
    {
      title: "📅 " + getTranslation('home.calendar', currentLanguage),
      description: getTranslation('home.calendarDesc', currentLanguage),
      route: "/calendar",
      icon: "calendar",
      color: colors.primary,
    },
    {
      title: "📝 " + getTranslation('home.addEntry', currentLanguage),
      description: getTranslation('home.addEntryDesc', currentLanguage),
      route: "/add-entry",
      icon: "plus.circle.fill",
      color: colors.secondary,
    },
    {
      title: "⌚ " + getTranslation('home.samsungHealth', currentLanguage),
      description: getTranslation('home.samsungHealthDesc', currentLanguage),
      route: "/samsung-health",
      icon: "heart.circle.fill",
      color: colors.error,
    },
    {
      title: "ℹ️ " + getTranslation('home.healthInfo', currentLanguage),
      description: getTranslation('home.healthInfoDesc', currentLanguage),
      route: "/health-info",
      icon: "info.circle.fill",
      color: colors.accent,
    },
    {
      title: "🔔 " + getTranslation('home.reminders', currentLanguage),
      description: getTranslation('home.remindersDesc', currentLanguage),
      route: "/formsheet",
      icon: "bell.fill",
      color: colors.primary,
    },
    {
      title: "💬 " + getTranslation('home.forum', currentLanguage),
      description: getTranslation('home.forumDesc', currentLanguage),
      route: "/modal",
      icon: "bubble.right.fill",
      color: colors.secondary,
    },
  ];

  return (
    <>
      {Platform.OS === 'ios' && (
        <Stack.Screen
          options={{
            title: "PulsLog",
            headerLargeTitle: true,
          }}
        />
      )}
      <ScrollView
        style={[commonStyles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={commonStyles.title}>{getTranslation('home.welcome', currentLanguage)}, {userProfile.name || 'User'}!</Text>
          <Text style={commonStyles.textSecondary}>
            {getTranslation('home.trackHealth', currentLanguage)}
          </Text>
        </View>

        <DailyOverview />

        <DrinkTracker />

        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <Link href={item.route as any} key={index} asChild>
              <Pressable style={({ pressed }) => [
                commonStyles.card,
                styles.menuItem,
                pressed && styles.menuItemPressed,
              ]}>
                <View style={styles.menuItemContent}>
                  <View style={[styles.menuIcon, { backgroundColor: item.color + '20' }]}>
                    <IconSymbol name={item.icon as any} color={item.color} size={24} />
                  </View>
                  <View style={styles.menuTextContainer}>
                    <Text style={commonStyles.subtitle}>{item.title}</Text>
                    <Text style={commonStyles.textSecondary}>{item.description}</Text>
                  </View>
                  <IconSymbol name="chevron.right" color={colors.textSecondary} size={20} />
                </View>
              </Pressable>
            </Link>
          ))}
        </View>

        <View style={styles.footer}>
          <Text style={commonStyles.textSecondary}>
            {getTranslation('home.lastUpdated', currentLanguage)}: {new Date().toLocaleDateString()}
          </Text>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    paddingBottom: Platform.OS === 'android' ? 100 : 20,
  },
  header: {
    marginBottom: 24,
  },
  menuContainer: {
    marginBottom: 24,
  },
  menuItem: {
    marginVertical: 8,
  },
  menuItemPressed: {
    opacity: 0.7,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuTextContainer: {
    flex: 1,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
});
