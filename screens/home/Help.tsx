import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  ActivityIndicator,
  Alert,
  StatusBar,
  Keyboard,
  Platform,
  Animated,
  Pressable,
} from 'react-native';
import { supabase } from '../../utils/supabaseClient';
import { useUser } from '../../utils/UserContext';
import LinearGradient from 'react-native-linear-gradient';
import {
  scale as s,
  verticalScale as vs,
  moderateScale as ms,
} from 'react-native-size-matters';
import ScreenWrapper from '../../utils/ScreenWrapper';

// --- Local Pop Button Component ---
const PopScaleButton = ({ children, onPress, disabled, style }: any) => {
  const scaleValue = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.9,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      friction: 4,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      disabled={disabled}
      style={style}
    >
      <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
        {children}
      </Animated.View>
    </Pressable>
  );
};

export default function SupportScreen() {
  const { user } = useUser();
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const flatListRef = useRef<FlatList>(null);

  // 🎨 NEON GREEN GRADIENT
  const THEME_GRADIENT = ['#03310b', '#00d435'];

  // 1. Initialize Chat
  useEffect(() => {
    let isMounted = true;
    const initChat = async () => {
      try {
        if (!user) return;

        const { data: existingConv, error: fetchError } = await supabase
          .from('conversations')
          .select('id')
          .eq('user_id', user.id)
          .eq('status', 'open')
          .maybeSingle();

        if (fetchError) throw fetchError;

        let convId = existingConv?.id;

        if (!convId) {
          const { data: newConv, error: createError } = await supabase
            .from('conversations')
            .insert([{ user_id: user.id }])
            .select()
            .single();

          if (createError) throw createError;
          convId = newConv.id;
        }

        if (isMounted && convId) {
          setConversationId(convId);
          await fetchMessages(convId);
        }
      } catch (error: any) {
        console.error('Chat Init Error:', error.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    initChat();
    return () => {
      isMounted = false;
    };
  }, [user]);

  // 2. Real-time Subscription
  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`conversation_sub:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        payload => {
          setMessages(currentMessages => {
            const exists = currentMessages.find(m => m.id === payload.new.id);
            if (exists) return currentMessages;
            return [...currentMessages, payload.new];
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  // 3. Auto-Scroll logic
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        if (messages.length > 0) {
          flatListRef.current?.scrollToEnd({ animated: true });
        }
      },
    );

    if (messages.length > 0) {
      setTimeout(
        () => flatListRef.current?.scrollToEnd({ animated: true }),
        200,
      );
    }

    return () => {
      keyboardDidShowListener.remove();
    };
  }, [messages]);

  const fetchMessages = async (convId: number) => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', convId)
      .order('created_at', { ascending: true });

    if (!error && data) {
      setMessages(data);
    }
  };

  // 4. Send Message
  const sendMessage = async () => {
    if (!input.trim() || !conversationId) return;

    const msgText = input.trim();
    setInput('');

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert([
          {
            conversation_id: conversationId,
            sender_id: user.id,
            sender_type: 'user',
            message_text: msgText,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setMessages(prev => [...prev, data]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to send message');
      setInput(msgText);
    }
  };

  const renderItem = ({ item }: any) => {
    const isUser = item.sender_type === 'user';
    return (
      <View
        style={[
          styles.messageBubble,
          isUser ? styles.userBubble : styles.adminBubble,
        ]}
      >
        <Text style={[styles.messageText, !isUser && styles.adminText]}>
          {item.message_text}
        </Text>
      </View>
    );
  };

  return (
    <ScreenWrapper>
      {/* 🌑 Background: Deep Green/Black Gradient */}
      <LinearGradient
        colors={['#000000', '#0a1a10', '#082415']}
        style={styles.container}
      >
        <StatusBar barStyle="light-content" backgroundColor="#000" />

        {/* --- HEADER --- */}
        <View style={styles.headerContainer}>
          <LinearGradient
            colors={THEME_GRADIENT}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.headerLine}
          />
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>LIVE SUPPORT</Text>
            {loading && (
              <ActivityIndicator
                size="small"
                color="#00ff40"
                style={{ marginLeft: 10 }}
              />
            )}
          </View>
        </View>

        {/* --- CHAT AREA --- */}
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <View style={styles.listContainer}>
            <FlatList
              ref={flatListRef}
              data={messages}
              keyExtractor={item => String(item.id)}
              renderItem={renderItem}
              contentContainerStyle={{ padding: s(15), paddingBottom: vs(20) }}
              showsVerticalScrollIndicator={false}
              onContentSizeChange={() =>
                flatListRef.current?.scrollToEnd({ animated: true })
              }
              onLayout={() =>
                flatListRef.current?.scrollToEnd({ animated: true })
              }
              ListEmptyComponent={
                !loading ? (
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>SECURE LINE ACTIVE</Text>
                  </View>
                ) : null
              }
            />
          </View>

          {/* --- INPUT AREA --- */}
          <View style={styles.inputWrapper}>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                value={input}
                onChangeText={setInput}
                placeholder="Transmitting message..."
                placeholderTextColor="rgba(255,255,255,0.3)"
                returnKeyType="send"
                onSubmitEditing={sendMessage}
                multiline={false}
              />
              {/* Send Button with Pop Effect */}
              <PopScaleButton
                onPress={sendMessage}
                disabled={loading || !input.trim()}
              >
                <LinearGradient
                  colors={THEME_GRADIENT}
                  start={{ x: 0, y: 1 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.sendButton, !input.trim() && { opacity: 0.5 }]}
                >
                  <Text style={styles.sendButtonText}>➤</Text>
                </LinearGradient>
              </PopScaleButton>
            </View>
          </View>
        </KeyboardAvoidingView>
      </LinearGradient>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  /* HEADER */
  headerContainer: {
    paddingTop: vs(20),
    paddingBottom: vs(10),
    backgroundColor: 'transparent',
    zIndex: 10,
  },
  headerLine: {
    height: 2,
    width: '30%',
    alignSelf: 'center',
    borderRadius: 2,
    marginBottom: vs(10),
    opacity: 0.7,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: ms(20),
    fontWeight: '900',
    color: '#00ff40', // Neon Green
    letterSpacing: 1,
    textTransform: 'uppercase',
  },

  /* CHAT LIST */
  listContainer: {
    flex: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: vs(50),
    opacity: 0.5,
  },
  emptyText: {
    color: '#00ff40', // Green text
    fontSize: ms(14),
    fontWeight: '700',
    letterSpacing: 2,
  },

  /* BUBBLES */
  messageBubble: {
    padding: s(12),
    borderRadius: ms(16),
    marginVertical: vs(4),
    maxWidth: '80%',
  },
  userBubble: {
    backgroundColor: '#03310b', // Dark Green
    alignSelf: 'flex-end',
    borderBottomRightRadius: 2,
    borderWidth: 1,
    borderColor: '#00ff40', // Green Border
  },
  adminBubble: {
    backgroundColor: '#1a1a1a', // Dark Obsidian
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 2,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  messageText: {
    fontSize: ms(14),
    color: '#fff',
    lineHeight: ms(20),
  },
  adminText: {
    color: '#ccc',
  },

  /* INPUT AREA */
  inputWrapper: {
    padding: s(15),
    backgroundColor: 'rgba(0, 0, 0, 0)', // Slightly transparent black
    //borderTopWidth: 1,
    //borderTopColor: 'rgba(0, 255, 64, 0.1)',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#121212',
    borderRadius: ms(25),
    paddingHorizontal: s(15),
    paddingVertical: vs(12),
    marginRight: s(10),
    color: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 64, 0.2)', // Green tint border
    fontSize: ms(14),
  },
  sendButton: {
    width: s(45),
    height: s(45),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: s(25),
    shadowColor: '#00ff40',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  sendButtonText: {
    color: '#fff', // White arrow on Green button
    fontSize: ms(18),
    fontWeight: 'bold',
    marginBottom: 2,
  },
});
