
import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Platform, Pressable, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { IconSymbol } from "@/components/IconSymbol";
import { useTheme } from "@react-navigation/native";
import { colors, commonStyles, getTranslation, Language } from "@/styles/commonStyles";
import { useWidget } from "@/contexts/WidgetContext";
import { router } from "expo-router";

export default function GamesScreen() {
  const theme = useTheme();
  const { gameState, userProfile } = useWidget();
  const currentLanguage: Language = userProfile?.language || 'en';

  const games = [
    {
      title: getTranslation('games.flowerSimulator', currentLanguage),
      description: getTranslation('games.flowerSimulatorDesc', currentLanguage),
      route: "/games/flower-simulator",
      icon: "leaf.fill",
      color: colors.secondary,
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
          <Text style={commonStyles.title}>{getTranslation('games.title', currentLanguage)}</Text>
          <Text style={commonStyles.textSecondary}>
            {getTranslation('games.flowerSimulatorDesc', currentLanguage)}
          </Text>
        </View>

        {gameState && (
          <View style={styles.statsContainer}>
            <View style={[styles.statCard, { backgroundColor: colors.accent + '20' }]}>
              <IconSymbol name="dollarsign.circle.fill" size={24} color={colors.accent} />
              <View style={styles.statContent}>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  {getTranslation('games.coins', currentLanguage)}
                </Text>
                <Text style={[styles.statValue, { color: colors.accent }]}>
                  {gameState.coins}
                </Text>
              </View>
            </View>
            <View style={[styles.statCard, { backgroundColor: colors.primary + '20' }]}>
              <IconSymbol name="star.fill" size={24} color={colors.primary} />
              <View style={styles.statContent}>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  {getTranslation('games.xp', currentLanguage)}
                </Text>
                <Text style={[styles.statValue, { color: colors.primary }]}>
                  {gameState.totalXp}
                </Text>
              </View>
            </View>
          </View>
        )}

        <View style={styles.gamesContainer}>
          {games.map((game, index) => (
            <Pressable
              key={index}
              onPress={() => router.push(game.route as any)}
              style={({ pressed }) => [
                commonStyles.card,
                styles.gameItem,
                pressed && styles.gameItemPressed,
              ]}
            >
              <View style={styles.gameItemContent}>
                <View style={[styles.gameIcon, { backgroundColor: game.color + '20' }]}>
                  <IconSymbol name={game.icon as any} color={game.color} size={32} />
                </View>
                <View style={styles.gameTextContainer}>
                  <Text style={commonStyles.subtitle}>{game.title}</Text>
                  <Text style={commonStyles.textSecondary}>{game.description}</Text>
                </View>
                <IconSymbol name="chevron.right" color={colors.textSecondary} size={20} />
              </View>
            </Pressable>
          ))}
        </View>

        <View style={styles.footer}>
          <Text style={commonStyles.textSecondary}>
            Earn coins and items by completing challenges and caring for your flowers!
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
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  statContent: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 4,
  },
  gamesContainer: {
    marginBottom: 24,
  },
  gameItem: {
    marginVertical: 8,
  },
  gameItemPressed: {
    opacity: 0.7,
  },
  gameItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  gameIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gameTextContainer: {
    flex: 1,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
});
