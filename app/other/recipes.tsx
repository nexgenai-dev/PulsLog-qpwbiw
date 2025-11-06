
import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Platform, Pressable, Alert, TextInput, Modal, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { IconSymbol } from "@/components/IconSymbol";
import { useTheme } from "@react-navigation/native";
import { colors, commonStyles, getTranslation, Language } from "@/styles/commonStyles";
import { useWidget } from "@/contexts/WidgetContext";
import { router } from "expo-router";
import { Recipe } from "@/contexts/WidgetContext";
import * as ImagePicker from 'expo-image-picker';

export default function RecipesScreen() {
  const theme = useTheme();
  const { recipes, addRecipe, updateRecipe, deleteRecipe, userProfile, shoppingLists, updateShoppingList } = useWidget();
  const currentLanguage: Language = userProfile?.language || 'en';
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);
  const [recipeTitle, setRecipeTitle] = useState('');
  const [recipeImage, setRecipeImage] = useState<string | undefined>();
  const [ingredients, setIngredients] = useState<{ id: string; name: string; quantity: number; unit: string }[]>([]);
  const [instructions, setInstructions] = useState('');
  const [newIngredientName, setNewIngredientName] = useState('');
  const [newIngredientQuantity, setNewIngredientQuantity] = useState('');
  const [newIngredientUnit, setNewIngredientUnit] = useState('');
  const [isAddingIngredient, setIsAddingIngredient] = useState(false);
  const [selectedShoppingListId, setSelectedShoppingListId] = useState<string | null>(null);

  const selectedRecipe = recipes.find(r => r.id === selectedRecipeId);

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setRecipeImage(result.assets[0].uri);
    }
  };

  const handleAddIngredient = () => {
    if (!newIngredientName.trim() || !newIngredientQuantity.trim()) {
      Alert.alert('Error', 'Please fill in all ingredient fields');
      return;
    }

    const newIngredient = {
      id: Date.now().toString(),
      name: newIngredientName,
      quantity: parseFloat(newIngredientQuantity),
      unit: newIngredientUnit || 'unit',
    };

    setIngredients([...ingredients, newIngredient]);
    setNewIngredientName('');
    setNewIngredientQuantity('');
    setNewIngredientUnit('');
    setIsAddingIngredient(false);
  };

  const handleRemoveIngredient = (ingredientId: string) => {
    setIngredients(ingredients.filter(i => i.id !== ingredientId));
  };

  const handleCreateRecipe = async () => {
    if (!recipeTitle.trim() || ingredients.length === 0 || !instructions.trim()) {
      Alert.alert('Error', 'Please fill in all recipe fields');
      return;
    }

    const newRecipe: Recipe = {
      id: Date.now().toString(),
      title: recipeTitle,
      imageUri: recipeImage,
      ingredients,
      instructions,
      createdAt: new Date().toISOString(),
    };

    await addRecipe(newRecipe);
    setRecipeTitle('');
    setRecipeImage(undefined);
    setIngredients([]);
    setInstructions('');
    setIsCreateModalVisible(false);
    Alert.alert('Success', 'Recipe created successfully');
  };

  const handleDeleteRecipe = (id: string) => {
    Alert.alert(
      getTranslation('recipes.deleteRecipe', currentLanguage),
      getTranslation('recipes.deleteConfirm', currentLanguage),
      [
        { text: getTranslation('profile.cancel', currentLanguage), style: 'cancel' },
        {
          text: getTranslation('recipes.deleteRecipe', currentLanguage),
          onPress: async () => {
            await deleteRecipe(id);
            if (selectedRecipeId === id) {
              setSelectedRecipeId(null);
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const handleAddToShopping = async () => {
    if (!selectedRecipe || !selectedShoppingListId) {
      Alert.alert('Error', 'Please select a shopping list');
      return;
    }

    const shoppingList = shoppingLists.find(l => l.id === selectedShoppingListId);
    if (!shoppingList) return;

    const newItems = selectedRecipe.ingredients.map(ing => ({
      id: Date.now().toString() + Math.random(),
      name: ing.name,
      quantity: Math.ceil(ing.quantity).toString(),
      category: 'Other',
      checked: false,
      listId: selectedShoppingListId,
    }));

    await updateShoppingList({
      ...shoppingList,
      items: [...shoppingList.items, ...newItems],
    });

    Alert.alert('Success', 'Ingredients added to shopping list');
    setSelectedShoppingListId(null);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={24} color={colors.text} />
        </Pressable>
        <Text style={commonStyles.subtitle}>{getTranslation('recipes.title', currentLanguage)}</Text>
        <Pressable onPress={() => setIsCreateModalVisible(true)}>
          <IconSymbol name="plus" size={24} color={colors.primary} />
        </Pressable>
      </View>

      {!selectedRecipe ? (
        <ScrollView
          style={styles.container}
          contentContainerStyle={[
            styles.contentContainer,
            Platform.OS !== 'ios' && styles.contentContainerWithTabBar
          ]}
          showsVerticalScrollIndicator={false}
        >
          {recipes.length === 0 ? (
            <View style={styles.emptyState}>
              <IconSymbol name="book" size={64} color={colors.lightGray} />
              <Text style={commonStyles.subtitle}>{getTranslation('recipes.noRecipes', currentLanguage)}</Text>
              <Text style={commonStyles.textSecondary}>{getTranslation('recipes.createFirst', currentLanguage)}</Text>
            </View>
          ) : (
            <View style={styles.listContainer}>
              {recipes.map((recipe) => (
                <Pressable
                  key={recipe.id}
                  onPress={() => setSelectedRecipeId(recipe.id)}
                  style={({ pressed }) => [
                    commonStyles.card,
                    styles.recipeItem,
                    pressed && styles.recipeItemPressed,
                  ]}
                >
                  <View style={styles.recipeItemContent}>
                    {recipe.imageUri && (
                      <Image
                        source={{ uri: recipe.imageUri }}
                        style={styles.recipeImage}
                      />
                    )}
                    <View style={styles.recipeInfo}>
                      <Text style={commonStyles.subtitle}>{recipe.title}</Text>
                      <Text style={commonStyles.textSecondary}>
                        {recipe.ingredients.length} {getTranslation('recipes.ingredients', currentLanguage)}
                      </Text>
                    </View>
                    <Pressable
                      onPress={() => handleDeleteRecipe(recipe.id)}
                      style={({ pressed }) => pressed && { opacity: 0.6 }}
                    >
                      <IconSymbol name="trash" size={20} color={colors.error} />
                    </Pressable>
                  </View>
                </Pressable>
              ))}
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
          <View style={styles.recipeHeader}>
            <Pressable onPress={() => setSelectedRecipeId(null)}>
              <IconSymbol name="chevron.left" size={20} color={colors.primary} />
            </Pressable>
            <Text style={commonStyles.subtitle}>{selectedRecipe.title}</Text>
            <View style={{ width: 20 }} />
          </View>

          {selectedRecipe.imageUri && (
            <Image
              source={{ uri: selectedRecipe.imageUri }}
              style={styles.recipeDetailImage}
            />
          )}

          <View style={commonStyles.card}>
            <Text style={commonStyles.subtitle}>{getTranslation('recipes.ingredients', currentLanguage)}</Text>
            {selectedRecipe.ingredients.map((ing) => (
              <View key={ing.id} style={styles.ingredientItem}>
                <Text style={commonStyles.text}>
                  {ing.quantity} {ing.unit} {ing.name}
                </Text>
              </View>
            ))}
          </View>

          <View style={commonStyles.card}>
            <Text style={commonStyles.subtitle}>{getTranslation('recipes.instructions', currentLanguage)}</Text>
            <Text style={commonStyles.textSecondary}>{selectedRecipe.instructions}</Text>
          </View>

          <Pressable
            style={[styles.addToShoppingButton, { backgroundColor: colors.secondary }]}
            onPress={() => {
              if (shoppingLists.length === 0) {
                Alert.alert('Error', 'Please create a shopping list first');
                return;
              }
              setSelectedShoppingListId(shoppingLists[0].id);
            }}
          >
            <IconSymbol name="cart.fill" size={20} color="#fff" />
            <Text style={styles.addToShoppingButtonText}>
              {getTranslation('recipes.addToShopping', currentLanguage)}
            </Text>
          </Pressable>
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
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {getTranslation('recipes.newRecipe', currentLanguage)}
            </Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView
            style={styles.modalContent}
            contentContainerStyle={styles.modalContentContainer}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.editSection}>
              <Text style={[styles.editLabel, { color: colors.text }]}>
                {getTranslation('recipes.recipeTitle', currentLanguage)}
              </Text>
              <TextInput
                style={[commonStyles.input, { color: colors.text }]}
                placeholder={getTranslation('recipes.enterTitle', currentLanguage)}
                placeholderTextColor={colors.textSecondary}
                value={recipeTitle}
                onChangeText={setRecipeTitle}
              />
            </View>

            <View style={styles.editSection}>
              <Text style={[styles.editLabel, { color: colors.text }]}>
                {getTranslation('recipes.image', currentLanguage)}
              </Text>
              <Pressable
                style={[commonStyles.card, styles.imagePickerButton]}
                onPress={handlePickImage}
              >
                {recipeImage ? (
                  <Image source={{ uri: recipeImage }} style={styles.selectedImage} />
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <IconSymbol name="photo" size={40} color={colors.lightGray} />
                    <Text style={commonStyles.textSecondary}>
                      {getTranslation('recipes.selectImage', currentLanguage)}
                    </Text>
                  </View>
                )}
              </Pressable>
            </View>

            <View style={styles.editSection}>
              <View style={styles.ingredientHeader}>
                <Text style={[styles.editLabel, { color: colors.text }]}>
                  {getTranslation('recipes.ingredients', currentLanguage)}
                </Text>
                <Pressable onPress={() => setIsAddingIngredient(!isAddingIngredient)}>
                  <IconSymbol name="plus.circle.fill" size={24} color={colors.primary} />
                </Pressable>
              </View>

              {isAddingIngredient && (
                <View style={[commonStyles.card, styles.ingredientForm]}>
                  <TextInput
                    style={[commonStyles.input, { color: colors.text }]}
                    placeholder={getTranslation('recipes.ingredientName', currentLanguage)}
                    placeholderTextColor={colors.textSecondary}
                    value={newIngredientName}
                    onChangeText={setNewIngredientName}
                  />
                  <View style={styles.quantityRow}>
                    <TextInput
                      style={[commonStyles.input, { color: colors.text, flex: 1 }]}
                      placeholder={getTranslation('recipes.quantity', currentLanguage)}
                      placeholderTextColor={colors.textSecondary}
                      value={newIngredientQuantity}
                      onChangeText={setNewIngredientQuantity}
                      keyboardType="decimal-pad"
                    />
                    <TextInput
                      style={[commonStyles.input, { color: colors.text, flex: 1, marginLeft: 8 }]}
                      placeholder={getTranslation('recipes.unit', currentLanguage)}
                      placeholderTextColor={colors.textSecondary}
                      value={newIngredientUnit}
                      onChangeText={setNewIngredientUnit}
                    />
                  </View>
                  <Pressable
                    style={[styles.addIngredientButton, { backgroundColor: colors.secondary }]}
                    onPress={handleAddIngredient}
                  >
                    <Text style={styles.addIngredientButtonText}>
                      {getTranslation('recipes.addIngredient', currentLanguage)}
                    </Text>
                  </Pressable>
                </View>
              )}

              {ingredients.map((ing) => (
                <View key={ing.id} style={[commonStyles.card, styles.ingredientListItem]}>
                  <Text style={commonStyles.text}>
                    {ing.quantity} {ing.unit} {ing.name}
                  </Text>
                  <Pressable onPress={() => handleRemoveIngredient(ing.id)}>
                    <IconSymbol name="xmark.circle.fill" size={20} color={colors.error} />
                  </Pressable>
                </View>
              ))}
            </View>

            <View style={styles.editSection}>
              <Text style={[styles.editLabel, { color: colors.text }]}>
                {getTranslation('recipes.instructions', currentLanguage)}
              </Text>
              <TextInput
                style={[commonStyles.input, { color: colors.text, minHeight: 120, textAlignVertical: 'top' }]}
                placeholder={getTranslation('recipes.enterInstructions', currentLanguage)}
                placeholderTextColor={colors.textSecondary}
                value={instructions}
                onChangeText={setInstructions}
                multiline
              />
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <Pressable
              style={[styles.modalButton, { backgroundColor: colors.lightGray }]}
              onPress={() => setIsCreateModalVisible(false)}
            >
              <Text style={[styles.modalButtonText, { color: colors.text }]}>
                {getTranslation('profile.cancel', currentLanguage)}
              </Text>
            </Pressable>
            <Pressable
              style={[styles.modalButton, { backgroundColor: colors.primary }]}
              onPress={handleCreateRecipe}
            >
              <Text style={[styles.modalButtonText, { color: '#fff' }]}>
                {getTranslation('profile.save', currentLanguage)}
              </Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </Modal>

      <Modal
        visible={selectedShoppingListId !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedShoppingListId(null)}
      >
        <View style={styles.shoppingListModal}>
          <View style={[commonStyles.card, styles.shoppingListModalContent]}>
            <Text style={commonStyles.subtitle}>
              {getTranslation('recipes.addToShopping', currentLanguage)}
            </Text>
            <ScrollView style={styles.shoppingListOptions}>
              {shoppingLists.map((list) => (
                <Pressable
                  key={list.id}
                  style={[commonStyles.card, styles.shoppingListOption]}
                  onPress={async () => {
                    setSelectedShoppingListId(list.id);
                    await handleAddToShopping();
                  }}
                >
                  <Text style={commonStyles.text}>{list.name}</Text>
                </Pressable>
              ))}
            </ScrollView>
            <Pressable
              style={[styles.modalButton, { backgroundColor: colors.lightGray }]}
              onPress={() => setSelectedShoppingListId(null)}
            >
              <Text style={[styles.modalButtonText, { color: colors.text }]}>
                {getTranslation('profile.cancel', currentLanguage)}
              </Text>
            </Pressable>
          </View>
        </View>
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
  recipeItem: {
    marginVertical: 4,
  },
  recipeItemPressed: {
    opacity: 0.7,
  },
  recipeItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  recipeImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  recipeInfo: {
    flex: 1,
  },
  recipeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  recipeDetailImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
  },
  ingredientItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  addToShoppingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  addToShoppingButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
  imagePickerButton: {
    minHeight: 150,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholder: {
    alignItems: 'center',
    gap: 8,
  },
  selectedImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
  },
  ingredientHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  ingredientForm: {
    marginBottom: 12,
  },
  quantityRow: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 8,
  },
  addIngredientButton: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 8,
  },
  addIngredientButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  ingredientListItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
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
  shoppingListModal: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 16,
  },
  shoppingListModalContent: {
    maxHeight: '80%',
    width: '100%',
  },
  shoppingListOptions: {
    maxHeight: 300,
    marginVertical: 16,
  },
  shoppingListOption: {
    marginVertical: 4,
  },
});
