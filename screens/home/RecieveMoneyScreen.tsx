import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  RefreshControl,
  StatusBar,
  Pressable,
  Animated,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { supabase } from '../../utils/supabaseClient';
import { useUser } from '../../utils/UserContext';
import ScreenWrapper from '../../utils/ScreenWrapper';
import {
  scale as s,
  verticalScale as vs,
  moderateScale as ms,
} from 'react-native-size-matters';

// Simple Scale Animation for the Card Click
const ScaleCard = ({ children, onPress, style }: any) => {
  const scaleValue = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.96,
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
      style={style}
    >
      <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
        {children}
      </Animated.View>
    </Pressable>
  );
};

export default function DirectReferralsScreen() {
  const { user } = useUser();
  const navigation = useNavigation<any>();
  const [referrals, setReferrals] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // 🎨 NEON GREEN GRADIENT
  const THEME_GRADIENT = ['#03310b', '#00d435'];

  const fetchReferrals = async () => {
    if (!user?.account_number) return;
    setLoading(true);
    // 2️⃣ Added 'profileImage' to the select query
    const { data, error } = await supabase
      .from('users')
      .select('id, username, direct_business, account_number, profileImage')
      .eq('referrer_account_number', user.account_number);

    if (!error && data) setReferrals(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchReferrals();
  }, [user?.account_number]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchReferrals();
    setRefreshing(false);
  }, [user?.account_number]);

  return (
    <ScreenWrapper>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      {/* 🌑 Background: Deep Green/Black Gradient */}
      <LinearGradient
        colors={['#000000', '#0a1a10', '#082415']}
        style={{ flex: 1 }}
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.container}>
            {/* Header */}
            <View style={styles.headerContainer}>
              <Text style={styles.headerTitle}>My Network</Text>
              <Text style={styles.headerSubtitle}>Direct Referrals</Text>
              <LinearGradient
                colors={THEME_GRADIENT}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.headerLine}
              />
            </View>

            {loading && !refreshing ? (
              <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#00ff40" />
              </View>
            ) : referrals.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.noReferrals}>
                  No direct referrals found
                </Text>
              </View>
            ) : (
              <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    tintColor="#00ff40"
                    colors={['#00ff40', '#00d435']}
                    progressBackgroundColor="#1c140d"
                  />
                }
              >
                {referrals.map((ref, index) => (
                  <ScaleCard
                    key={ref.id}
                    style={styles.cardContainer}
                    onPress={() =>
                      navigation.navigate('IndirectReferralsScreen', {
                        accountNumber: ref.account_number,
                        name: ref.username,
                      })
                    }
                  >
                    <View style={styles.card}>
                      {/* Left: User Info */}
                      <View style={styles.userInfo}>
                        {/* 3️⃣ Logic to show Image or Initial */}
                        <View
                          style={[
                            styles.avatarPlaceholder,
                            ref.profileImage && {
                              borderWidth: 0,
                              backgroundColor: 'transparent',
                            },
                          ]}
                        >
                          {ref.profileImage ? (
                            <Image
                              source={{ uri: ref.profileImage }}
                              style={styles.avatarImage}
                              resizeMode="cover"
                            />
                          ) : (
                            <Text style={styles.avatarText}>
                              {ref.username
                                ? ref.username.charAt(0).toUpperCase()
                                : 'U'}
                            </Text>
                          )}
                        </View>

                        <View>
                          <Text style={styles.username}>
                            {ref.username || `Trader ${index + 1}`}
                          </Text>
                          <View style={styles.statusBadge}>
                            <Text style={styles.statusText}>VIEW NETWORK</Text>
                          </View>
                        </View>
                      </View>

                      {/* Right: Business Volume */}
                      <View style={styles.businessInfo}>
                        <Text style={styles.businessLabel}>Volume</Text>
                        <Text style={styles.businessAmount}>
                          ${ref.direct_business || 0}
                        </Text>
                      </View>
                    </View>
                  </ScaleCard>
                ))}
              </ScrollView>
            )}
          </View>
        </SafeAreaView>
      </LinearGradient>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: {
    flex: 1,
    paddingHorizontal: s(16),
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* Header */
  headerContainer: {
    marginTop: vs(20),
    marginBottom: vs(20),
  },
  headerTitle: {
    fontSize: ms(28),
    fontWeight: '900',
    color: '#00ff40', // Neon Green
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginTop: vs(15),
  },
  headerSubtitle: {
    fontSize: ms(14),
    color: 'rgba(255,255,255,0.5)',
    marginBottom: vs(10),
  },
  headerLine: {
    width: s(50),
    height: vs(4),
    borderRadius: ms(2),
  },

  /* List */
  scroll: { width: '100%' },
  scrollContent: { paddingBottom: vs(200) },

  /* Card */
  cardContainer: {
    marginBottom: vs(15),
    shadowColor: '#00ff40',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: ms(16),
    padding: s(16),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 64, 0.15)', // Green Border
  },

  /* Left Side */
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarPlaceholder: {
    width: s(50),
    height: s(50),
    borderRadius: s(25),
    backgroundColor: 'rgba(0, 255, 64, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: s(12),
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 64, 0.3)',
  },
  avatarImage: {
    width: s(50),
    height: s(50),
    borderRadius: s(25),
    
  },
  avatarText: {
    color: '#00ff40',
    fontSize: ms(16),
    fontWeight: '800',
  },
  username: {
    color: '#fff',
    fontSize: ms(16),
    fontWeight: '700',
    marginBottom: vs(4),
  },
  statusBadge: {
    backgroundColor: 'rgba(0, 255, 64, 0.1)', // Green tint for "View Network"
    paddingHorizontal: s(6),
    paddingVertical: vs(2),
    borderRadius: ms(4),
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 64, 0.2)',
  },
  statusText: {
    color: '#00ff40',
    fontSize: ms(9),
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  /* Right Side */
  businessInfo: {
    alignItems: 'flex-end',
  },
  businessLabel: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: ms(10),
    textTransform: 'uppercase',
    marginBottom: vs(2),
  },
  businessAmount: {
    color: '#00ff40',
    fontSize: ms(18),
    fontWeight: '800',
  },

  /* Empty State */
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noReferrals: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: ms(16),
  },
});
