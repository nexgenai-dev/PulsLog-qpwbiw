
import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Platform, Pressable, Alert, TextInput, Modal, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { IconSymbol } from "@/components/IconSymbol";
import { useTheme } from "@react-navigation/native";
import { colors, commonStyles, getTranslation, Language } from "@/styles/commonStyles";
import { useWidget } from "@/contexts/WidgetContext";
import { router } from "expo-router";
import { ShoppingList, ShoppingItem, Recipe } from "@/contexts/WidgetContext";
import * as ImagePicker from 'expo-image-picker';

const CATEGORIES = ['Fruits', 'Vegetables', 'Dairy', 'Meat', 'Drinks', 'Bakery', 'Other'];

export default function ShoppingScreen() {
  const theme = useTheme();
  const { shoppingLists, addShoppingList, updateShoppingList, deleteShoppingList, userProfile, addPoints } = useWidget();
  const currentLanguage: Language = userProfile?.language || 'en';
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [isItemModalVisible, setIsItemModalVisible] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('Other');
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  const selectedList = shoppingLists.find(l => l.id === selectedListId);

  const handleCreateList = async () => {
    if (!newListName.trim()) {
      Alert.alert('Error', getTranslation('shopping.errorList', currentLanguage));
      return;
    }

    const newList: ShoppingList = {
      id: Date.now().toString(),
      name: newListName,
      createdAt: new Date().toISOString(),
      items: [],
    };

    await addShoppingList(newList);
    setNewListName('');
    setIsCreateModalVisible(false);
  };

  const handleDeleteList = (id: string) => {
    Alert.alert(
      getTranslation('shopping.deleteList', currentLanguage),
      getTranslation('shopping.deleteListConfirm', currentLanguage),
      [
        { text: getTranslation('profile.cancel', currentLanguage), style: 'cancel' },
        {
          text: getTranslation('shopping.deleteList', currentLanguage),
          onPress: async () => {
            await deleteShoppingList(id);
            if (selectedListId === id) {
              setSelectedListId(null);
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const handleAddItem = async () => {
    if (!newItemName.trim() || !selectedList) {
      Alert.alert('Error', getTranslation('shopping.error', currentLanguage));
      return;
    }

    const newItem: ShoppingItem = {
      id: Date.now().toString(),
      name: newItemName,
      quantity: newItemQuantity || undefined,
      category: newItemCategory,
      checked: false,
      listId: selectedList.id,
    };

    const updatedList = {
      ...selectedList,
      items: [...selectedList.items, newItem],
    };

    await updateShoppingList(updatedList);
    await addPoints(5);
    setNewItemName('');
    setNewItemQuantity('');
    setNewItemCategory('Other');
    setIsItemModalVisible(false);
  };

  const handleToggleItem = async (itemId: string) => {
    if (!selectedList) return;

    const updatedItems = selectedList.items.map(i =>
      i.id === itemId ? { ...i, checked: !i.checked } : i
    );

    await updateShoppingList({
      ...selectedList,
      items: updatedItems,
    });
  };

  const handleDeleteItem = (itemId: string) => {
    if (!selectedList) return;

    Alert.alert(
      getTranslation('shopping.deleteItem', currentLanguage),
      getTranslation('shopping.deleteItemConfirm', currentLanguage),
      [
        { text: getTranslation('profile.cancel', currentLanguage), style: 'cancel' },
        {
          text: getTranslation('shopping.deleteItem', currentLanguage),
          onPress: async () => {
            const updatedItems = selectedList.items.filter(i => i.id !== itemId);
            await updateShoppingList({
              ...selectedList,
              items: updatedItems,
            });
          },
          style: 'destructive',
        },
      ]
    );
  };

  const sortedItems = selectedList
    ? [...selectedList.items].sort((a, b) => {
        if (a.checked !== b.checked) return a.checked ? 1 : -1;
        return a.category.localeCompare(b.category);
      })
    : [];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={24} color={colors.text} />
        </Pressable>
        <Text style={commonStyles.subtitle}>{getTranslation('shopping.title', currentLanguage)}</Text>
        <Pressable onPress={() => setIsCreateModalVisible(true)}>
          <IconSymbol name="plus" size={24} color={colors.primary} />
        </Pressable>
      </View>

      {!selectedList ? (
        <ScrollView
          style={styles.container}
          contentContainerStyle={[
            styles.contentContainer,
            Platform.OS !== 'ios' && styles.contentContainerWithTabBar
          ]}
          showsVerticalScrollIndicator={false}
        >
          {shoppingLists.length === 0 ? (
            <View style={styles.emptyState}>
              <IconSymbol name="cart" size={64} color={colors.lightGray} />
              <Text style={commonStyles.subtitle}>{getTranslation('shopping.noLists', currentLanguage)}</Text>
              <Text style={commonStyles.textSecondary}>{getTranslation('shopping.createFirst', currentLanguage)}</Text>
            </View>
          ) : (
            <View style={styles.listContainer}>
              {shoppingLists.map((list) => {
                const checkedCount = list.items.filter(i => i.checked).length;
                return (
                  <Pressable
                    key={list.id}
                    onPress={() => setSelectedListId(list.id)}
                    style={({ pressed }) => [
                      commonStyles.card,
                      styles.listItem,
                      pressed && styles.listItemPressed,
                    ]}
                  >
                    <View style={styles.listItemContent}>
                      <View>
                        <Text style={commonStyles.subtitle}>{list.name}</Text>
                        <Text style={commonStyles.textSecondary}>
                          {checkedCount}/{list.items.length} {getTranslation('shopping.items', currentLanguage)}
                        </Text>
                      </View>
                      <Pressable
                        onPress={() => handleDeleteList(list.id)}
                        style={({ pressed }) => pressed && { opacity: 0.6 }}
                      >
                        <IconSymbol name="trash" size={20} color={colors.error} />
                      </Pressable>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          )}
        </ScrollView>
      ) : (
        <ScrollView
          style={styles.container}
          contentContainerStyle={[
            styles.contentContainer,
            Platform.OS !== 'ios' && styles.contentContainerWithTabBar
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.listHeader}>
            <Pressable onPress={() => setSelectedListId(null)}>
              <IconSymbol name="chevron.left" size={20} color={colors.primary} />
            </Pressable>
            <Text style={commonStyles.subtitle}>{selectedList.name}</Text>
            <Pressable onPress={() => setIsItemModalVisible(true)}>
              <IconSymbol name="plus" size={20} color={colors.primary} />
            </Pressable>
          </View>

          {sortedItems.length === 0 ? (
            <View style={styles.emptyState}>
              <IconSymbol name="cart" size={64} color={colors.lightGray} />
              <Text style={commonStyles.subtitle}>{getTranslation('shopping.noItems', currentLanguage)}</Text>
              <Text style={commonStyles.textSecondary}>{getTranslation('shopping.addItem', currentLanguage)}</Text>
            </View>
          ) : (
            <View style={styles.itemsContainer}>
              {sortedItems.map((item) => (
                <View key={item.id} style={commonStyles.card}>
                  <View style={styles.itemRow}>
                    <Pressable
                      onPress={() => handleToggleItem(item.id)}
                      style={styles.itemCheckbox}
                    >
                      <IconSymbol
                        name={item.checked ? "checkmark.circle.fill" : "circle"}
                        size={24}
                        color={item.checked ? colors.secondary : colors.lightGray}
                      />
                    </Pressable>
                    <View style={styles.itemContent}>
                      <Text
                        style={[
                          commonStyles.text,
                          item.checked && styles.checkedItem,
                        ]}
                      >
                        {item.name}
                      </Text>
                      <View style={styles.itemMeta}>
                        {item.quantity && (
                          <Text style={commonStyles.textSecondary}>
                            {getTranslation('shopping.qty', currentLanguage)}: {item.quantity}
                          </Text>
                        )}
                        <Text style={commonStyles.textSecondary}>
                          {item.category}
                        </Text>
                      </View>
                    </View>
                    <Pressable
                      onPress={() => handleDeleteItem(item.id)}
                      style={({ pressed }) => pressed && { opacity: 0.6 }}
                    >
                      <IconSymbol name="trash" size={20} color={colors.error} />
                    </Pressable>
                  </View>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      )}

      <Modal
        visible={isCreateModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsCreateModalVisible(false)}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={styles.modalHeader}>
            <Pressable onPress={() => setIsCreateModalVisible(false)}>
              <IconSymbol name="xmark" size={24} color={colors.text} />
            </Pressable>
            <Text style={[styles.modalTitle, { color: colors.text }]}>{getTranslation('shopping.newList', currentLanguage)}</Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView
            style={styles.modalContent}
            contentContainerStyle={styles.modalContentContainer}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.editSection}>
              <Text style={[styles.editLabel, { color: colors.text }]}>{getTranslation('shopping.listName', currentLanguage)}</Text>
              <TextInput
                style={[commonStyles.input, { color: colors.text }]}
                placeholder={getTranslation('shopping.enterListName', currentLanguage)}
                placeholderTextColor={colors.textSecondary}
                value={newListName}
                onChangeText={setNewListName}
              />
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <Pressable
              style={[styles.modalButton, { backgroundColor: colors.lightGray }]}
              onPress={() => setIsCreateModalVisible(false)}
            >
              <Text style={[styles.modalButtonText, { color: colors.text }]}>{getTranslation('profile.cancel', currentLanguage)}</Text>
            </Pressable>
            <Pressable
              style={[styles.modalButton, { backgroundColor: colors.primary }]}
              onPress={handleCreateList}
            >
              <Text style={[styles.modalButtonText, { color: '#fff' }]}>{getTranslation('shopping.create', currentLanguage)}</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </Modal>

      <Modal
        visible={isItemModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsItemModalVisible(false)}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={styles.modalHeader}>
            <Pressable onPress={() => setIsItemModalVisible(false)}>
              <IconSymbol name="xmark" size={24} color={colors.text} />
            </Pressable>
            <Text style={[styles.modalTitle, { color: colors.text }]}>{getTranslation('shopping.newItem', currentLanguage)}</Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView
            style={styles.modalContent}
            contentContainerStyle={styles.modalContentContainer}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.editSection}>
              <Text style={[styles.editLabel, { color: colors.text }]}>{getTranslation('shopping.itemName', currentLanguage)}</Text>
              <TextInput
                style={[commonStyles.input, { color: colors.text }]}
                placeholder={getTranslation('shopping.enterItemName', currentLanguage)}
                placeholderTextColor={colors.textSecondary}
                value={newItemName}
                onChangeText={setNewItemName}
              />
            </View>

            <View style={styles.editSection}>
              <Text style={[styles.editLabel, { color: colors.text }]}>{getTranslation('shopping.quantity', currentLanguage)}</Text>
              <TextInput
                style={[commonStyles.input, { color: colors.text }]}
                placeholder={getTranslation('shopping.quantityPlaceholder', currentLanguage)}
                placeholderTextColor={colors.textSecondary}
                value={newItemQuantity}
                onChangeText={setNewItemQuantity}
              />
            </View>

            <View style={styles.editSection}>
              <Text style={[styles.editLabel, { color: colors.text }]}>{getTranslation('shopping.category', currentLanguage)}</Text>
              <Pressable
                style={[commonStyles.input, { justifyContent: 'center' }]}
                onPress={() => setShowCategoryPicker(!showCategoryPicker)}
              >
                <Text style={{ color: colors.text }}>{newItemCategory}</Text>
              </Pressable>
              {showCategoryPicker && (
                <View style={styles.categoryPicker}>
                  {CATEGORIES.map((cat) => (
                    <Pressable
                      key={cat}
                      onPress={() => {
                        setNewItemCategory(cat);
                        setShowCategoryPicker(false);
                      }}
                      style={[
                        styles.categoryOption,
                        newItemCategory === cat && styles.categoryOptionSelected,
                      ]}
                    >
                      <Text
                        style={[
                          styles.categoryOptionText,
                          newItemCategory === cat && styles.categoryOptionTextSelected,
                        ]}
                      >
                        {cat}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <Pressable
              style={[styles.modalButton, { backgroundColor: colors.lightGray }]}
              onPress={() => setIsItemModalVisible(false)}
            >
              <Text style={[styles.modalButtonText, { color: colors.text }]}>{getTranslation('profile.cancel', currentLanguage)}</Text>
            </Pressable>
            <Pressable
              style={[styles.modalButton, { backgroundColor: colors.primary }]}
              onPress={handleAddItem}
            >
              <Text style={[styles.modalButtonText, { color: '#fff' }]}>{getTranslation('shopping.addItem', currentLanguage)}</Text>
            </Pressable>
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
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  listContainer: {
    gap: 8,
  },
  listItem: {
    marginVertical: 4,
  },
  listItemPressed: {
    opacity: 0.7,
  },
  listItemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  itemsContainer: {
    gap: 8,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  itemCheckbox: {
    padding: 4,
  },
  itemContent: {
    flex: 1,
  },
  itemMeta: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  checkedItem: {
    textDecorationLine: 'line-through',
    color: colors.textSecondary,
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
  modalContent: {
    flex: 1,
  },
  modalContentContainer: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  editSection: {
    marginBottom: 20,
  },
  editLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  categoryPicker: {
    marginTop: 8,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  categoryOption: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  categoryOptionSelected: {
    backgroundColor: colors.primary + '20',
  },
  categoryOptionText: {
    fontSize: 16,
    color: colors.text,
  },
  categoryOptionTextSelected: {
    fontWeight: '600',
    color: colors.primary,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: Platform.OS === 'android' ? 24 : 16,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
