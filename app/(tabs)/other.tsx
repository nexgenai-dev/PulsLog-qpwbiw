
import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Platform, Pressable, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { IconSymbol } from "@/components/IconSymbol";
import { useTheme } from "@react-navigation/native";
import { colors, commonStyles } from "@/styles/commonStyles";
import { useWidget } from "@/contexts/WidgetContext";
import { router } from "expo-router";

export default function OtherScreen() {
  const theme = useTheme();
  const { todoLists, shoppingLists, notes } = useWidget();

  const menuItems = [
    {
      title: "✓ To-Do Lists",
      description: `${todoLists.length} list${todoLists.length !== 1 ? 's' : ''}`,
      route: "/other/todos",
      icon: "checkmark.circle.fill",
      color: colors.primary,
    },
    {
      title: "🛒 Shopping Lists",
      description: `${shoppingLists.length} list${shoppingLists.length !== 1 ? 's' : ''}`,
      route: "/other/shopping",
      icon: "cart.fill",
      color: colors.secondary,
    },
    {
      title: "📝 Notes",
      description: `${notes.length} note${notes.length !== 1 ? 's' : ''}`,
      route: "/other/notes",
      icon: "note.text",
      color: colors.accent,
    },
  ];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.contentContainer,
          Platform.OS !== 'ios' && styles.contentContainerWithTabBar
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={commonStyles.title}>Organizer</Text>
          <Text style={commonStyles.textSecondary}>
            Manage your tasks, shopping, and notes
          </Text>
        </View>

        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <Pressable
              key={index}
              onPress={() => router.push(item.route as any)}
              style={({ pressed }) => [
                commonStyles.card,
                styles.menuItem,
                pressed && styles.menuItemPressed,
              ]}
            >
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
          ))}
        </View>

        <View style={styles.footer}>
          <Text style={commonStyles.textSecondary}>
            All your data is saved locally on your device
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  contentContainerWithTabBar: {
    paddingBottom: 100,
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
