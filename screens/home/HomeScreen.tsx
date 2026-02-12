import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Animated,
  Pressable,
} from 'react-native';
import {
  scale as s,
  verticalScale as vs,
  moderateScale as ms,
} from 'react-native-size-matters';
import { useUser } from '../../utils/UserContext';
import ScreenWrapper from '../../utils/ScreenWrapper';
import { supabase } from '../../utils/supabaseClient';
import LinearGradient from 'react-native-linear-gradient';

// --- POP BUTTON COMPONENT ---
const PopScaleButton = ({ children, onPress, style }: any) => {
  const scaleValue = useRef(new Animated.Value(1)).current;
  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.95,
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
      <Animated.View
        style={{
          transform: [{ scale: scaleValue }],
          width: '100%',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {children}
      </Animated.View>
    </Pressable>
  );
};

export default function HomeScreen({ navigation }: any) {
  const { user, setUser } = useUser();
  const [refreshing, setRefreshing] = useState(false);

  // ⛏️ Mining Rigs State (Replaces Traders)
  const [miningRigs, setMiningRigs] = useState<any[]>([]);
  const [loadingRigs, setLoadingRigs] = useState(false);

  const [partnerData, setPartnerData] = useState({
    name: 'SantrX',
    url: 'https://santrx.com/login',
  });

  const fetchUserData = async () => {
    if (!user?.id) return;
    try {
      const { data: userData, error } = await supabase
        .from('users')
        .select(
          'balance, profileImage, username, account_number, direct_business',
        )
        .eq('id', user.id)
        .single();

      if (!error && userData) {
        setUser((prev: any) => ({ ...prev, ...userData }));
      }
    } catch (error) {
      console.log('User fetch error:', error);
    }
  };

  // 🏭 Generate Fake Mining Data
  const generateMiningData = () => {
    setLoadingRigs(true);
    // UDPATED: Simulating 11 Active Mining Shafts (Added 6 more)
    const rigs = Array.from({ length: 11 }).map((_, index) => ({
      id: index + 1,
      name: `EXC-${100 + index}`,
      hashRate: (Math.random() * (150 - 80) + 80).toFixed(1), // TH/s
      temp: Math.floor(Math.random() * (85 - 60) + 60), // °C
      yield: (Math.random() * (0.05 - 0.01) + 0.01).toFixed(4), // oz
      status: 'ONSITE',
    }));
    setMiningRigs(rigs);
    setLoadingRigs(false);
  };

  useEffect(() => {
    if (!user?.id) return;

    fetchUserData();
    generateMiningData();

    // ⚡ Real-time Simulation Loop
    const interval = setInterval(() => {
      setMiningRigs(prev =>
        prev.map(rig => ({
          ...rig,
          // Fluctuate Hashrate
          hashRate: (
            parseFloat(rig.hashRate) +
            (Math.random() * 2 - 1)
          ).toFixed(1),
          // Increase Yield
          yield: (parseFloat(rig.yield) + 0.0001).toFixed(4),
          // Fluctuate Temp
          temp: Math.max(
            60,
            Math.min(90, rig.temp + Math.floor(Math.random() * 3 - 1)),
          ),
        })),
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [user?.id]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchUserData();
    generateMiningData(); // Reset rigs on refresh
    setRefreshing(false);
  }, [user?.id]);

  const handleProfilePress = () => {
    navigation.navigate('ProfileScreen');
  };

  return (
    <ScreenWrapper>
      {/* 🌑 Background Gradient */}
      <LinearGradient
        colors={['#000000', '#1a1005', '#241808']}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#FFD700"
              colors={['#FFD700', '#B8860B']}
              progressBackgroundColor="#1c140d"
            />
          }
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.container}>
            {/* Profile Section */}
            <View style={styles.firstContainer}>
              <PopScaleButton onPress={handleProfilePress}>
                <View style={styles.avatarContainer}>
                  <Image
                    source={
                      user?.profileImage
                        ? { uri: user.profileImage }
                        : require('../homeMedia/Avatar.png')
                    }
                    style={styles.avatarImage}
                    resizeMode="cover"
                  />
                </View>
              </PopScaleButton>

              <View style={styles.userInfo}>
                <Text style={styles.name}>
                  {user?.username || 'Guest User'}
                </Text>
                <Text style={styles.accountNumber}>
                  Account No {user?.account_number || '0000000000'}
                </Text>
              </View>

              <PopScaleButton
                style={styles.editButton}
                onPress={() => navigation.navigate('Help')}
              >
                <Image
                  source={require('../homeMedia/support.webp')}
                  style={styles.editImage}
                  resizeMode="contain"
                />
              </PopScaleButton>
            </View>

            {/* Balance Section */}
            <View style={styles.secondContainerWrapper}>
              <LinearGradient
                colors={['#422006', '#ffbf00']}
                start={{ x: 0, y: 1 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradientCard}
              >
                <View style={styles.balanceOverlay}>
                  <Text style={styles.balanceSubHeader}>Trading Balance</Text>
                  <Text style={styles.balanceAmount}>
                    ${user?.balance || '0'}
                  </Text>

                  <View style={styles.fourButtonRow}>
                    {[
                      {
                        name: 'Deposit',
                        icon: require('../homeMedia/deposit.webp'),
                        onPress: () => navigation.navigate('DepositMoney'),
                      },
                      {
                        name: 'Rewards',
                        icon: require('../homeMedia/send.webp'),
                        onPress: () => navigation.navigate('StoreMain'),
                      },
                      {
                        name: 'Webinar',
                        icon: require('../homeMedia/recieve.webp'),
                        onPress: () => navigation.navigate('RecieveMoney'),
                      },
                      {
                        name: 'Withdraw',
                        icon: require('../homeMedia/withdraw.webp'),
                        onPress: () => navigation.navigate('WithdrawalMoney'),
                      },
                    ].map((btn, index) => (
                      <PopScaleButton
                        key={index}
                        style={styles.imageButton}
                        onPress={btn.onPress}
                      >
                        <Image source={btn.icon} style={styles.buttonIcon} />
                        <Text style={styles.buttonLabel}>{btn.name}</Text>
                      </PopScaleButton>
                    ))}
                  </View>
                </View>
              </LinearGradient>
            </View>

            <View style={{ flexDirection: 'row', gap: s(8) }}>
              <PopScaleButton
                onPress={() => navigation.navigate('RecieveMoneyScreen')}
              >
                <Text style={styles.withdrawableText}>
                  Direct Business{' '}
                  <Text style={styles.boldAmount}>
                    ${user?.direct_business || 0}
                  </Text>
                </Text>
              </PopScaleButton>

              <PopScaleButton
                onPress={() =>
                  navigation.navigate('BrowserScreen', {
                    url: partnerData.url,
                    title: partnerData.name,
                  })
                }
              >
                <Text style={styles.withdrawableText}>
                  {' '}
                  <Text style={styles.boldAmount}>{partnerData.name}</Text>
                </Text>
              </PopScaleButton>
            </View>

            {/* ⛏️ Live Mining Operations Section */}
            <View style={styles.thirdContainer}>
              <View style={styles.sectionHeader}>
                <Text style={styles.transactionsTitle}>LIVE EXTRACTION</Text>
                <LinearGradient
                  colors={['#FFD700', '#7b009400']}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  style={styles.slickLine}
                />
              </View>

              {loadingRigs ? (
                <ActivityIndicator size="small" color="#FFD700" />
              ) : (
                // UPDATED: Fixed height container to make it scrollable independently
                <View style={{ width: '100%', height: vs(320) }}>
                  <ScrollView
                    contentContainerStyle={{
                      alignItems: 'center',
                      paddingBottom: vs(20),
                    }}
                    showsVerticalScrollIndicator={true}
                    nestedScrollEnabled={true}
                    indicatorStyle="white"
                  >
                    {miningRigs.map(rig => (
                      <PopScaleButton
                        key={rig.id}
                        style={styles.miningCard}
                        onPress={() => navigation.navigate('SendMoney')}
                      >
                        <LinearGradient
                          colors={[
                            'rgba(20, 20, 20, 0.9)',
                            'rgba(40, 25, 5, 0.95)',
                          ]}
                          style={styles.miningCardInner}
                        >
                          {/* Left: Rig Info */}
                          <View style={styles.rigInfoLeft}>
                            <View style={styles.rigIconBox}>
                              <Text style={{ fontSize: 20 }}>⚒️</Text>
                            </View>
                            <View>
                              <Text style={styles.rigName}>{rig.name}</Text>
                              <Text style={styles.rigStatus}>
                                ● {rig.status}
                              </Text>
                            </View>
                          </View>

                          {/* Middle: Tech Stats */}
                          <View style={styles.rigStats}>
                            <Text style={styles.statLabel}>HASHRATE</Text>
                            <Text style={styles.statValue}>
                              {rig.hashRate} TH/s
                            </Text>

                            <View style={{ height: 4 }} />

                            <Text
                              style={[
                                styles.statValue,
                                {
                                  color: rig.temp > 80 ? '#FF4500' : '#00ff88',
                                },
                              ]}
                            >
                              {rig.temp}°C
                            </Text>
                          </View>

                          {/* Right: Yield */}
                          <View style={styles.rigYieldBox}>
                            <Text style={styles.yieldLabel}>YIELD (OZ)</Text>
                            <Text style={styles.yieldValue}>{rig.yield}</Text>
                          </View>
                        </LinearGradient>

                        {/* Progress Bar Visual at bottom of card */}
                        <View style={styles.progressBarBg}>
                          <LinearGradient
                            colors={['#FFD700', '#B8860B']}
                            style={{
                              width: `${(rig.temp / 100) * 100}%`,
                              height: '100%',
                            }}
                          />
                        </View>
                      </PopScaleButton>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', paddingVertical: vs(5) },
  firstContainer: {
    width: '95%',
    height: '11%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: s(10),
    marginTop: vs(25),
  },
  userInfo: { flex: 1 },
  name: { fontSize: ms(18), fontWeight: 'bold', color: '#FFD700' },
  accountNumber: { fontSize: ms(14), color: '#ffffff49', marginTop: vs(2) },
  editButton: { padding: ms(8) },
  editImage: { width: s(30), height: s(30) },

  // Avatar Styles
  avatarContainer: {
    width: s(60),
    height: s(60),
    borderRadius: ms(50),
    marginRight: s(12),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  avatarImage: { width: '100%', height: '100%', borderRadius: ms(50) },

  secondContainerWrapper: {
    width: '92%',
    height: '30%',
    justifyContent: 'center',
    overflow: 'hidden',
    marginTop: vs(10),
    borderRadius: ms(50),
    backgroundColor: '#000',
    shadowColor: '#B8860B',
    shadowOffset: { width: 0, height: vs(4) },
    shadowOpacity: 1,
    shadowRadius: ms(10),
    elevation: 10,
    borderColor: '#fffb00',
    borderWidth: ms(1),
  },
  gradientCard: {
    width: '100%',
    height: '100%',
    borderRadius: ms(20),
    alignSelf: 'center',
  },
  balanceOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    padding: s(20),
  },
  balanceSubHeader: { fontSize: ms(16), color: 'rgba(255, 255, 255, 0.9)' },
  balanceAmount: {
    fontSize: ms(50),
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: vs(15),
  },
  fourButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: vs(-20),
  },
  imageButton: { justifyContent: 'center', alignItems: 'center', flex: 1 },
  buttonIcon: { width: s(55), height: s(50), resizeMode: 'contain' },
  buttonLabel: { fontSize: ms(12), color: '#fff', textAlign: 'center' },
  withdrawableText: {
    marginTop: vs(10),
    marginBottom: vs(3),
    fontSize: ms(13),
    color: '#8a7c00',
    textAlign: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    paddingHorizontal: s(10),
    paddingVertical: vs(2),
    borderRadius: ms(20),
    borderWidth: 0.5,
    borderColor: '#FFD700',
  },
  boldAmount: { fontWeight: 'bold', fontSize: ms(16), color: '#FFD700' },

  thirdContainer: {
    width: '98%',
    borderRadius: ms(12),
    padding: s(8),
    marginBottom: vs(30),
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: vs(10),
  },
  transactionsTitle: {
    fontSize: ms(18),
    fontWeight: 'bold',
    color: '#FFD700',
  },
  slickLine: {
    flex: 1,
    height: vs(0.5),
    marginLeft: s(12),
    borderRadius: ms(2),
    opacity: 0.8,
  },

  /* ⚒️ Mining Card Styles */
  miningCard: {
    borderRadius: ms(25),
    marginBottom: vs(8),
    width: '100%',
    overflow: 'hidden', // Clips the progress bar
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.15)', // Gold border
  },
  miningCardInner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: s(12),
    width: '100%',
  },
  rigInfoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '35%',
  },
  rigIconBox: {
    width: s(36),
    height: s(36),
    borderRadius: ms(10),
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: s(8),
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.2)',
  },
  rigName: {
    color: '#fff',
    fontWeight: '700',
    fontSize: ms(12),
  },
  rigStatus: {
    color: '#00ff88',
    fontSize: ms(9),
    fontWeight: '600',
    marginTop: 2,
  },
  rigStats: {
    width: '30%',
    alignItems: 'flex-start',
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(255,255,255,0.1)',
    paddingLeft: s(10),
  },
  statLabel: {
    color: '#888',
    fontSize: ms(8),
    fontWeight: '700',
  },
  statValue: {
    color: '#ccc',
    fontSize: ms(11),
    fontFamily: 'monospace', // Tech look
    fontWeight: '600',
  },
  rigYieldBox: {
    width: '30%',
    alignItems: 'flex-end',
  },
  yieldLabel: {
    color: '#FFD700',
    fontSize: ms(9),
    fontWeight: '800',
    marginBottom: 2,
  },
  yieldValue: {
    color: '#fff',
    fontSize: ms(16),
    fontWeight: '700',
    textShadowColor: 'rgba(255, 215, 0, 0.5)',
    textShadowRadius: 5,
  },
  progressBarBg: {
    height: vs(3),
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
});
