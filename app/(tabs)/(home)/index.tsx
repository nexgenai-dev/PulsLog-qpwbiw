
import React, { useEffect, useState } from "react";
import { Stack, Link, Redirect } from "expo-router";
import { ScrollView, Pressable, StyleSheet, View, Text, Platform } from "react-native";
import { IconSymbol } from "@/components/IconSymbol";
import { useTheme } from "@react-navigation/native";
import { colors, commonStyles } from "@/styles/commonStyles";
import { useWidget } from "@/contexts/WidgetContext";
import { DailyOverview, DrinkTracker } from "@/components/BodyScrollView";

export default function HomeScreen() {
  const theme = useTheme();
  const { userProfile, isLoading } = useWidget();
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
      title: "📅 Calendar",
      description: "View your health records by date",
      route: "/calendar",
      icon: "calendar",
      color: colors.primary,
    },
    {
      title: "📝 Add Entry",
      description: "Record pulse, blood pressure & medication",
      route: "/add-entry",
      icon: "plus.circle.fill",
      color: colors.secondary,
    },
    {
      title: "⌚ Samsung Health",
      description: "Sync data from your Galaxy Watch 7",
      route: "/samsung-health",
      icon: "heart.circle.fill",
      color: colors.error,
    },
    {
      title: "ℹ️ Health Info",
      description: "Learn about POTS and circulatory disorders",
      route: "/health-info",
      icon: "info.circle.fill",
      color: colors.accent,
    },
    {
      title: "🔔 Reminders",
      description: "Set reminders for measurements & medication",
      route: "/formsheet",
      icon: "bell.fill",
      color: colors.primary,
    },
    {
      title: "💬 Forum",
      description: "Connect with community members",
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
          <Text style={commonStyles.title}>Welcome, {userProfile.name || 'User'}!</Text>
          <Text style={commonStyles.textSecondary}>
            Track your health metrics and stay informed
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
            Last updated: {new Date().toLocaleDateString()}
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
