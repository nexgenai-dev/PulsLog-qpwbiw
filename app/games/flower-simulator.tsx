
import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Platform, Pressable, Alert, Modal, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { IconSymbol } from "@/components/IconSymbol";
import { useTheme } from "@react-navigation/native";
import { colors, commonStyles, getTranslation, Language } from "@/styles/commonStyles";
import { useWidget } from "@/contexts/WidgetContext";
import { router } from "expo-router";

const FLOWER_LEVELS = [
  { level: 1, name: 'games.bud', xpRequired: 0, emoji: '🌱' },
  { level: 2, name: 'games.bloom', xpRequired: 50, emoji: '🌸' },
  { level: 3, name: 'games.fullFlower', xpRequired: 120, emoji: '🌺' },
  { level: 4, name: 'games.exoticFlower', xpRequired: 250, emoji: '🌻' },
  { level: 5, name: 'games.futuristicFlower', xpRequired: 500, emoji: '✨' },
];

const SHOP_ITEMS = [
  { id: 'fertilizer', name: 'games.fertilizer', price: 5, xpBonus: 10 },
  { id: 'sunlamp', name: 'games.sunlamp', price: 10, xpBonus: 15 },
  { id: 'specialwater', name: 'games.specialWater', price: 20, xpBonus: 25 },
];

export default function FlowerSimulatorScreen() {
  const theme = useTheme();
  const { gameState, userProfile, waterFlower, addGameCoins, useGameItem, updateGameState } = useWidget();
  const currentLanguage: Language = userProfile?.language || 'en';
  const [activeTab, setActiveTab] = useState<'home' | 'collection' | 'shop' | 'challenges'>('home');
  const [selectedFlower, setSelectedFlower] = useState<string | null>(null);
  const [showLevelUpModal, setShowLevelUpModal] = useState(false);
  const [levelUpFlowerId, setLevelUpFlowerId] = useState<string | null>(null);
  const [showNewFlowerModal, setShowNewFlowerModal] = useState(false);
  const [newFlowerName, setNewFlowerName] = useState('');

  const currentFlower = selectedFlower && gameState ? gameState.flowers.find(f => f.id === selectedFlower) : gameState?.flowers[0];

  const handleUseGameItemPress = async (itemId: string) => {
    if (!currentFlower) {
      console.log('No current flower available');
      return;
    }
    try {
      await useGameItem(itemId, currentFlower.id);
    } catch (error) {
      console.log('Error using game item:', error);
    }
  };

  if (!gameState) {
    return null;
  }

  const getFlowerLevel = (xp: number) => {
    for (let i = FLOWER_LEVELS.length - 1; i >= 0; i--) {
      if (xp >= FLOWER_LEVELS[i].xpRequired) {
        return FLOWER_LEVELS[i];
      }
    }
    return FLOWER_LEVELS[0];
  };

  const getNextLevelXp = (currentXp: number) => {
    const currentLevel = getFlowerLevel(currentXp);
    const nextLevelIndex = FLOWER_LEVELS.findIndex(l => l.level === currentLevel.level) + 1;
    if (nextLevelIndex < FLOWER_LEVELS.length) {
      return FLOWER_LEVELS[nextLevelIndex].xpRequired;
    }
    return currentLevel.xpRequired + 500;
  };

  const handleWaterFlower = async () => {
    if (!currentFlower) return;

    const oldLevel = getFlowerLevel(currentFlower.xp).level;
    await waterFlower(currentFlower.id);

    const updatedFlower = gameState.flowers.find(f => f.id === currentFlower.id);
    if (updatedFlower) {
      const newLevel = getFlowerLevel(updatedFlower.xp).level;
      if (newLevel > oldLevel) {
        setLevelUpFlowerId(currentFlower.id);
        setShowLevelUpModal(true);
      }
    }
  };

  const handleClaimReward = async (rewardType: 'xp' | 'item' | 'coins') => {
    if (!gameState) return;

    let newState = { ...gameState };

    if (rewardType === 'xp') {
      const updatedFlowers = newState.flowers.map(f => {
        if (f.id === levelUpFlowerId) {
          return { ...f, xp: f.xp + 25 };
        }
        return f;
      });
      newState = { ...newState, flowers: updatedFlowers, totalXp: newState.totalXp + 25 };
    } else if (rewardType === 'item') {
      const randomItem = SHOP_ITEMS[Math.floor(Math.random() * SHOP_ITEMS.length)];
      const existingItem = newState.inventory.find(i => i.id === randomItem.id);
      if (existingItem) {
        newState.inventory = newState.inventory.map(i =>
          i.id === randomItem.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      } else {
        newState.inventory = [...newState.inventory, { ...randomItem, quantity: 1 }];
      }
    } else if (rewardType === 'coins') {
      newState = { ...newState, coins: newState.coins + 50 };
    }

    await updateGameState(newState);
    setShowLevelUpModal(false);
  };

  const handleBuyItem = async (itemId: string) => {
    const item = SHOP_ITEMS.find(i => i.id === itemId);
    if (!item) return;

    if (gameState.coins < item.price) {
      Alert.alert(getTranslation('games.insufficientCoins', currentLanguage));
      return;
    }

    const newState = { ...gameState };
    newState.coins -= item.price;

    const existingItem = newState.inventory.find(i => i.id === itemId);
    if (existingItem) {
      newState.inventory = newState.inventory.map(i =>
        i.id === itemId ? { ...i, quantity: i.quantity + 1 } : i
      );
    } else {
      newState.inventory = [...newState.inventory, { id: itemId, name: item.name, quantity: 1, xpBonus: item.xpBonus }];
    }

    await updateGameState(newState);
    Alert.alert(getTranslation('games.itemAdded', currentLanguage));
  };

  const handleCreateFlower = async () => {
    if (!newFlowerName.trim()) {
      Alert.alert('Error', getTranslation('games.enterFlowerName', currentLanguage));
      return;
    }

    const newFlower = {
      id: Date.now().toString(),
      name: newFlowerName,
      level: 1,
      xp: 0,
      lastWateredDate: new Date().toISOString().split('T')[0],
      wateredToday: false,
      rescuesUsed: 0,
      createdAt: new Date().toISOString(),
    };

    const newState = { ...gameState, flowers: [...gameState.flowers, newFlower] };
    await updateGameState(newState);
    setNewFlowerName('');
    setShowNewFlowerModal(false);
    Alert.alert('Success', `${newFlowerName} created!`);
  };

  const handleClaimChallenge = async (challengeId: string) => {
    const challenge = gameState.challenges.find(c => c.id === challengeId);
    if (!challenge || challenge.completed) return;

    const newState = { ...gameState };
    newState.coins += challenge.reward;
    newState.challenges = newState.challenges.map(c =>
      c.id === challengeId ? { ...c, completed: true, completedAt: new Date().toISOString() } : c
    );

    await updateGameState(newState);
    Alert.alert('Success', `+${challenge.reward} coins!`);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={24} color={colors.text} />
        </Pressable>
        <Text style={commonStyles.subtitle}>{getTranslation('games.flowerSimulator', currentLanguage)}</Text>
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
        {activeTab === 'home' && currentFlower && (
          <View>
            <View style={styles.flowerDisplay}>
              <Text style={styles.flowerEmoji}>{getFlowerLevel(currentFlower.xp).emoji}</Text>
              <Text style={[styles.flowerName, { color: colors.text }]}>{currentFlower.name}</Text>
              <Text style={[styles.flowerLevel, { color: colors.primary }]}>
                {getTranslation('games.level', currentLanguage)} {getFlowerLevel(currentFlower.xp).level}
              </Text>
            </View>

            <View style={styles.xpContainer}>
              <View style={styles.xpBar}>
                <View
                  style={[
                    styles.xpFill,
                    {
                      width: `${((currentFlower.xp % 50) / 50) * 100}%`,
                      backgroundColor: colors.primary,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.xpText, { color: colors.textSecondary }]}>
                {currentFlower.xp % 50} / 50 XP
              </Text>
            </View>

            <View style={styles.statusContainer}>
              <View style={[styles.statusBadge, { backgroundColor: currentFlower.wateredToday ? colors.secondary + '20' : colors.error + '20' }]}>
                <IconSymbol name="droplet.fill" size={16} color={currentFlower.wateredToday ? colors.secondary : colors.error} />
                <Text style={[styles.statusText, { color: currentFlower.wateredToday ? colors.secondary : colors.error }]}>
                  {currentFlower.wateredToday ? getTranslation('games.wateredToday', currentLanguage) : getTranslation('games.notWatered', currentLanguage)}
                </Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: colors.accent + '20' }]}>
                <IconSymbol name="heart.fill" size={16} color={colors.accent} />
                <Text style={[styles.statusText, { color: colors.accent }]}>
                  {getTranslation('games.rescuesRemaining', currentLanguage)}: {3 - currentFlower.rescuesUsed}
                </Text>
              </View>
            </View>

            <Pressable
              style={[styles.waterButton, { backgroundColor: colors.primary }]}
              onPress={handleWaterFlower}
            >
              <IconSymbol name="droplet.fill" size={24} color="#fff" />
              <Text style={[styles.waterButtonText, { color: '#fff' }]}>
                {getTranslation('games.water', currentLanguage)}
              </Text>
            </Pressable>

            <View style={styles.itemsContainer}>
              <Text style={[commonStyles.subtitle, { marginBottom: 12 }]}>
                {getTranslation('games.inventory', currentLanguage)}
              </Text>
              {gameState.inventory.length === 0 ? (
                <Text style={commonStyles.textSecondary}>No items yet</Text>
              ) : (
                gameState.inventory.map(item => (
                  <View key={item.id} style={[commonStyles.card, styles.inventoryItem]}>
                    <View style={styles.inventoryItemContent}>
                      <View>
                        <Text style={commonStyles.text}>{getTranslation(item.name, currentLanguage)}</Text>
                        <Text style={commonStyles.textSecondary}>+{item.xpBonus} XP</Text>
                      </View>
                      <Text style={[commonStyles.text, { fontWeight: 'bold' }]}>x{item.quantity}</Text>
                    </View>
                    <Pressable
                      style={[styles.useButton, { backgroundColor: colors.secondary }]}
                      onPress={() => handleUseGameItemPress(item.id)}
                    >
                      <Text style={[styles.useButtonText, { color: '#fff' }]}>
                        {getTranslation('games.use', currentLanguage)}
                      </Text>
                    </Pressable>
                  </View>
                ))
              )}
            </View>
          </View>
        )}

        {activeTab === 'collection' && (
          <View>
            <Pressable
              style={[commonStyles.card, styles.addFlowerButton]}
              onPress={() => setShowNewFlowerModal(true)}
            >
              <IconSymbol name="plus.circle.fill" size={24} color={colors.primary} />
              <Text style={[commonStyles.text, { color: colors.primary }]}>
                {getTranslation('games.create', currentLanguage)} {getTranslation('games.flowerSimulator', currentLanguage)}
              </Text>
            </Pressable>

            {gameState.flowers.map(flower => (
              <Pressable
                key={flower.id}
                style={[
                  commonStyles.card,
                  styles.collectionItem,
                  selectedFlower === flower.id && styles.collectionItemActive,
                ]}
                onPress={() => {
                  setSelectedFlower(flower.id);
                  setActiveTab('home');
                }}
              >
                <View style={styles.collectionItemContent}>
                  <Text style={styles.collectionItemEmoji}>{getFlowerLevel(flower.xp).emoji}</Text>
                  <View style={styles.collectionItemInfo}>
                    <Text style={commonStyles.text}>{flower.name}</Text>
                    <Text style={commonStyles.textSecondary}>
                      {getTranslation('games.level', currentLanguage)} {getFlowerLevel(flower.xp).level}
                    </Text>
                  </View>
                  <IconSymbol name="chevron.right" size={20} color={colors.textSecondary} />
                </View>
              </Pressable>
            ))}
          </View>
        )}

        {activeTab === 'shop' && (
          <View>
            <Text style={[commonStyles.subtitle, { marginBottom: 12 }]}>
              {getTranslation('games.coins', currentLanguage)}: {gameState.coins}
            </Text>
            {SHOP_ITEMS.map(item => (
              <View key={item.id} style={[commonStyles.card, styles.shopItem]}>
                <View style={styles.shopItemContent}>
                  <View>
                    <Text style={commonStyles.text}>{getTranslation(item.name, currentLanguage)}</Text>
                    <Text style={commonStyles.textSecondary}>+{item.xpBonus} XP</Text>
                  </View>
                  <Text style={[commonStyles.text, { fontWeight: 'bold', color: colors.accent }]}>
                    {item.price} {getTranslation('games.coins', currentLanguage)}
                  </Text>
                </View>
                <Pressable
                  style={[styles.buyButton, { backgroundColor: colors.primary }]}
                  onPress={() => handleBuyItem(item.id)}
                >
                  <Text style={[styles.buyButtonText, { color: '#fff' }]}>
                    {getTranslation('games.buy', currentLanguage)}
                  </Text>
                </Pressable>
              </View>
            ))}
          </View>
        )}

        {activeTab === 'challenges' && (
          <View>
            {gameState.challenges.map(challenge => (
              <View key={challenge.id} style={[commonStyles.card, styles.challengeItem]}>
                <View style={styles.challengeHeader}>
                  <Text style={commonStyles.subtitle}>{challenge.title}</Text>
                  {challenge.completed && (
                    <IconSymbol name="checkmark.circle.fill" size={20} color={colors.success} />
                  )}
                </View>
                <Text style={commonStyles.textSecondary}>{challenge.description}</Text>
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${(challenge.progress / challenge.target) * 100}%`,
                          backgroundColor: colors.primary,
                        },
                      ]}
                    />
                  </View>
                  <Text style={commonStyles.textSecondary}>
                    {challenge.progress} / {challenge.target}
                  </Text>
                </View>
                <View style={styles.rewardBadge}>
                  <IconSymbol name="dollarsign.circle.fill" size={16} color={colors.accent} />
                  <Text style={[styles.rewardText, { color: colors.accent }]}>
                    +{challenge.reward} {getTranslation('games.coins', currentLanguage)}
                  </Text>
                </View>
                {challenge.completed && !challenge.completedAt && (
                  <Pressable
                    style={[styles.claimButton, { backgroundColor: colors.secondary }]}
                    onPress={() => handleClaimChallenge(challenge.id)}
                  >
                    <Text style={[styles.claimButtonText, { color: '#fff' }]}>
                      {getTranslation('games.claimReward', currentLanguage)}
                    </Text>
                  </Pressable>
                )}
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <View style={styles.tabBar}>
        {(['home', 'collection', 'shop', 'challenges'] as const).map(tab => (
          <Pressable
            key={tab}
            style={[styles.tabItem, activeTab === tab && styles.tabItemActive]}
            onPress={() => setActiveTab(tab)}
          >
            <IconSymbol
              name={
                tab === 'home' ? 'house.fill' :
                tab === 'collection' ? 'leaf.fill' :
                tab === 'shop' ? 'cart.fill' :
                'checkmark.circle.fill'
              }
              size={24}
              color={activeTab === tab ? colors.primary : colors.textSecondary}
            />
            <Text style={[styles.tabLabel, { color: activeTab === tab ? colors.primary : colors.textSecondary }]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </Pressable>
        ))}
      </View>

      <Modal
        visible={showLevelUpModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLevelUpModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[commonStyles.title, { color: colors.text }]}>
              {getTranslation('games.levelUp', currentLanguage)}!
            </Text>
            <Text style={[commonStyles.textSecondary, { marginVertical: 16 }]}>
              {getTranslation('games.selectReward', currentLanguage)}
            </Text>

            <Pressable
              style={[styles.rewardOption, { backgroundColor: colors.primary + '20' }]}
              onPress={() => handleClaimReward('xp')}
            >
              <IconSymbol name="star.fill" size={24} color={colors.primary} />
              <Text style={[commonStyles.text, { color: colors.primary }]}>
                {getTranslation('games.xpReward', currentLanguage)} (+25 XP)
              </Text>
            </Pressable>

            <Pressable
              style={[styles.rewardOption, { backgroundColor: colors.secondary + '20' }]}
              onPress={() => handleClaimReward('item')}
            >
              <IconSymbol name="gift.fill" size={24} color={colors.secondary} />
              <Text style={[commonStyles.text, { color: colors.secondary }]}>
                {getTranslation('games.itemReward', currentLanguage)}
              </Text>
            </Pressable>

            <Pressable
              style={[styles.rewardOption, { backgroundColor: colors.accent + '20' }]}
              onPress={() => handleClaimReward('coins')}
            >
              <IconSymbol name="dollarsign.circle.fill" size={24} color={colors.accent} />
              <Text style={[commonStyles.text, { color: colors.accent }]}>
                {getTranslation('games.coinReward', currentLanguage)} (+50)
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showNewFlowerModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowNewFlowerModal(false)}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={styles.modalHeader}>
            <Pressable onPress={() => setShowNewFlowerModal(false)}>
              <IconSymbol name="xmark" size={24} color={colors.text} />
            </Pressable>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {getTranslation('games.create', currentLanguage)} {getTranslation('games.flowerSimulator', currentLanguage)}
            </Text>
            <View style={{ width: 24 }} />
          </View>

          <View style={styles.modalFormContainer}>
            <Text style={[commonStyles.text, { color: colors.text, marginBottom: 8 }]}>
              {getTranslation('games.flowerName', currentLanguage)}
            </Text>
            <TextInput
              style={[commonStyles.input, { color: colors.text }]}
              placeholder={getTranslation('games.enterFlowerName', currentLanguage)}
              placeholderTextColor={colors.textSecondary}
              value={newFlowerName}
              onChangeText={setNewFlowerName}
            />

            <View style={styles.modalButtonRow}>
              <Pressable
                style={[styles.modalButton, { backgroundColor: colors.lightGray, flex: 1 }]}
                onPress={() => setShowNewFlowerModal(false)}
              >
                <Text style={[styles.modalButtonText, { color: colors.text }]}>
                  {getTranslation('profile.cancel', currentLanguage)}
                </Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, { backgroundColor: colors.primary, flex: 1, marginLeft: 8 }]}
                onPress={handleCreateFlower}
              >
                <Text style={[styles.modalButtonText, { color: '#fff' }]}>
                  {getTranslation('games.create', currentLanguage)}
                </Text>
              </Pressable>
            </View>
          </View>
        </SafeAreaView>
      </Modal>
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
  flowerDisplay: {
    alignItems: 'center',
    paddingVertical: 32,
    marginBottom: 20,
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  flowerEmoji: {
    fontSize: 80,
    marginBottom: 12,
  },
  flowerName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  flowerLevel: {
    fontSize: 16,
    fontWeight: '600',
  },
  xpContainer: {
    marginBottom: 20,
  },
  xpBar: {
    height: 8,
    backgroundColor: colors.lightGray,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  xpFill: {
    height: '100%',
    borderRadius: 4,
  },
  xpText: {
    fontSize: 12,
    fontWeight: '500',
  },
  statusContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statusBadge: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  waterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  waterButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  itemsContainer: {
    marginBottom: 20,
  },
  inventoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
  },
  inventoryItemContent: {
    flex: 1,
  },
  useButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  useButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  addFlowerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    marginBottom: 16,
  },
  collectionItem: {
    marginVertical: 8,
  },
  collectionItemActive: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  collectionItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  collectionItemEmoji: {
    fontSize: 32,
  },
  collectionItemInfo: {
    flex: 1,
  },
  shopItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
  },
  shopItemContent: {
    flex: 1,
  },
  buyButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  buyButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  challengeItem: {
    marginVertical: 8,
  },
  challengeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressContainer: {
    marginVertical: 12,
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.lightGray,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  rewardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  rewardText: {
    fontSize: 12,
    fontWeight: '600',
  },
  claimButton: {
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 12,
  },
  claimButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
    backgroundColor: colors.card,
    paddingBottom: Platform.OS === 'android' ? 16 : 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  tabItemActive: {
    borderTopWidth: 3,
    borderTopColor: colors.primary,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  rewardOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginVertical: 8,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalFormContainer: {
    padding: 16,
  },
  modalButtonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  modalButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
