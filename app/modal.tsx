import { StyleSheet, Text, View, Pressable, ScrollView, TextInput, Platform, Alert } from 'react-native';
import { router } from 'expo-router';
import { useTheme } from '@react-navigation/native';
import { colors, commonStyles } from '@/styles/commonStyles';
import { useWidget } from '@/contexts/WidgetContext';
import { useState } from 'react';
import { IconSymbol } from '@/components/IconSymbol';
import { ForumMessage } from '@/contexts/WidgetContext';

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    paddingBottom: Platform.OS === 'android' ? 100 : 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 12,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  messageInputContainer: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
    marginBottom: 24,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  messageInput: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 14,
    color: colors.text,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  postButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 8,
  },
  postButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  messagesContainer: {
    marginBottom: 24,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  messageCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
    marginVertical: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.08)',
    elevation: 2,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  authorName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  timestamp: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  messageContent: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
    marginBottom: 8,
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  likeCount: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default function ForumScreen() {
  const theme = useTheme();
  const { forumMessages, addForumMessage, userProfile } = useWidget();
  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState<ForumMessage[]>(forumMessages);

  const handlePostMessage = async () => {
    if (!messageText.trim()) {
      Alert.alert('Error', 'Please enter a message');
      return;
    }

    const newMessage: ForumMessage = {
      id: Date.now().toString(),
      author: userProfile?.name || 'Anonymous',
      content: messageText,
      timestamp: new Date().toLocaleString('de-DE'),
      likes: 0,
    };

    await addForumMessage(newMessage);
    setMessages([newMessage, ...messages]);
    setMessageText('');
    Alert.alert('Success', 'Message posted!');
  };

  const handleLikeMessage = (id: string) => {
    const updated = messages.map(m =>
      m.id === id ? { ...m, likes: m.likes + 1 } : m
    );
    setMessages(updated);
  };

  return (
    <View style={[commonStyles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <IconSymbol name="arrow.left" color={colors.primary} size={24} />
          </Pressable>
          <Text style={commonStyles.title}>Community Forum</Text>
        </View>

        <View style={styles.messageInputContainer}>
          <TextInput
            style={styles.messageInput}
            placeholder="Share your thoughts or ask a question..."
            placeholderTextColor={colors.textSecondary}
            value={messageText}
            onChangeText={setMessageText}
            multiline
            numberOfLines={3}
          />
          <Pressable
            style={[styles.postButton, { backgroundColor: colors.primary }]}
            onPress={handlePostMessage}
          >
            <IconSymbol name="paperplane.fill" color="#FFFFFF" size={18} />
            <Text style={styles.postButtonText}>Post</Text>
          </Pressable>
        </View>

        <View style={styles.messagesContainer}>
          <Text style={[commonStyles.subtitle, { marginBottom: 12 }]}>Recent Messages</Text>
          {messages.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={commonStyles.textSecondary}>No messages yet. Be the first to post!</Text>
            </View>
          ) : (
            messages.map(message => (
              <View key={message.id} style={styles.messageCard}>
                <View style={styles.messageHeader}>
                  <Text style={styles.authorName}>{message.author}</Text>
                  <Text style={styles.timestamp}>{message.timestamp}</Text>
                </View>
                <Text style={styles.messageContent}>{message.content}</Text>
                <View style={styles.messageFooter}>
                  <Pressable
                    style={styles.likeButton}
                    onPress={() => handleLikeMessage(message.id)}
                  >
                    <IconSymbol name="heart.fill" color={colors.primary} size={16} />
                    <Text style={[styles.likeCount, { color: colors.primary }]}>
                      {message.likes}
                    </Text>
                  </Pressable>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}
