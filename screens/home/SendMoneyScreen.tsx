import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  Dimensions,
  Animated,
  Pressable,
  StatusBar,
  ScrollView,
  Easing,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { supabase } from '../../utils/supabaseClient';
import { useUser } from '../../utils/UserContext';
import ScreenWrapper from '../../utils/ScreenWrapper';
import {
  scale as s,
  verticalScale as vs,
  moderateScale as ms,
} from 'react-native-size-matters';

const { width: screenWidth } = Dimensions.get('window');

// --- ⚛️ NEW ANIMATION: QUANTUM SMELTER ---
const QuantumSmelter = () => {
  const spin1 = useRef(new Animated.Value(0)).current;
  const spin2 = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Ring 1 Rotation
    Animated.loop(
      Animated.timing(spin1, {
        toValue: 1,
        duration: 4000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Ring 2 Rotation (Counter-clockwise)
    Animated.loop(
      Animated.timing(spin2, {
        toValue: 1,
        duration: 7000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Core Pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.2,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const rotate1 = spin1.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const rotate2 = spin2.interpolate({ inputRange: [0, 1], outputRange: ['360deg', '0deg'] });

  return (
    <View style={styles.animContainer}>
      {/* Background Glow */}
      <View style={styles.animGlow} />

      {/* Orbit Ring 1 */}
      <Animated.View style={[styles.orbitRing, { width: s(180), height: s(180), transform: [{ rotate: rotate1 }] }]}>
        <View style={styles.orbitDot} />
        <LinearGradient
           colors={['transparent', '#FFD700', 'transparent']}
           style={styles.ringGradient}
        />
      </Animated.View>

      {/* Orbit Ring 2 */}
      <Animated.View style={[styles.orbitRing, { width: s(130), height: s(130), transform: [{ rotate: rotate2 }, { scaleX: 0.9 }] }]}>
         <View style={[styles.orbitDot, { bottom: -4, top: undefined }]} />
         <LinearGradient
           colors={['transparent', '#B8860B', 'transparent']}
           style={styles.ringGradient}
        />
      </Animated.View>

      {/* Central Core */}
      <Animated.View style={[styles.core, { transform: [{ scale: pulse }] }]}>
        <LinearGradient
          colors={['#FFF700', '#FFA500', '#B8860B']}
          style={styles.coreGradient}
        />
        <View style={styles.coreInnerHighlight} />
      </Animated.View>
    </View>
  );
};

// --- 🧪 LIQUID PROGRESS BAR ---
const LiquidProgress = ({ progress }: { progress: number }) => (
  <View style={styles.liquidTrack}>
    <LinearGradient
      colors={['#FFD700', '#B8860B']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={[styles.liquidFill, { width: `${progress}%` }]}
    />
    {/* Shine on top of liquid */}
    <LinearGradient
      colors={[
        'rgba(255,255,255,0.1)',
        'rgba(255,255,255,0.4)',
        'rgba(255,255,255,0.1)',
      ]}
      style={[styles.liquidShine, { width: `${progress}%` }]}
    />
  </View>
);

// --- 🔘 POP BUTTON ---
const PopButton = ({ onPress, children, style }: any) => {
  const scale = useRef(new Animated.Value(1)).current;
  return (
    <Pressable
      onPressIn={() =>
        Animated.spring(scale, { toValue: 0.96, useNativeDriver: true }).start()
      }
      onPressOut={() =>
        Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start()
      }
      onPress={onPress}
      style={style}
    >
      <Animated.View style={{ transform: [{ scale }] }}>
        {children}
      </Animated.View>
    </Pressable>
  );
};

export default function FoundryMiningScreen() {
  const { user, setUser } = useUser();
  const [investments, setInvestments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchUserData = async () => {
    const { data, error } = await supabase
      .from('users')
      .select('withdrawal_amount, level_income')
      .eq('id', user.id)
      .single();
    if (!error && data) setUser({ ...user, ...data });
  };

  const fetchInvestments = async () => {
    if (!user?.id) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('deposits')
      .select('id, amount, created_at, trade_status')
      .eq('user_id', user.id)
      .eq('status', 'approved')
      .eq('trade_status', 'running')
      .order('created_at', { ascending: false });

    if (!error) {
      const initialized = (data || []).map(t => ({
        ...t,
        currentValue: t.amount,
        progress: Math.random() * 100,
        temp: Math.floor(Math.random() * (2000 - 1500) + 1500),
      }));
      setInvestments(initialized);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUserData();
    fetchInvestments();
  }, [user?.id]);

  // Animation Loop
  const hasActive = investments.length > 0;
  useEffect(() => {
    if (!hasActive) return;
    const interval = setInterval(() => {
      setInvestments(prev =>
        prev.map(t => ({
          ...t,
          currentValue: t.currentValue + 0.002,
          progress: (t.progress + 0.8) % 100,
        })),
      );
    }, 500); // Faster update for smooth liquid look
    return () => clearInterval(interval);
  }, [hasActive]);

  return (
    <ScreenWrapper>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <LinearGradient
        colors={['#000000', '#1a1005', '#241808']} // Deep Bronze/Black
        style={styles.background}
      >
        <SafeAreaView style={styles.safeArea}>
          {/* 1️⃣ TOP CONTAINER: THE FURNACE (New Animation) */}
          <View style={styles.topContainer}>
            <View style={styles.furnaceWindow}>
              {/* 👇 REPLACED ANIMATION HERE 👇 */}
              <QuantumSmelter />
            </View>
          </View>

          {/* 2️⃣ MIDDLE CONTAINER: THE LEDGER (Two Incomes) */}
          <View style={styles.statsRow}>
            {/* Card 1: Profit */}
            <View style={styles.glassCard}>
              <LinearGradient
                colors={['rgba(255,255,255,0.08)', 'rgba(0,0,0,0.5)']}
                style={styles.cardGradient}
              >
                <View style={styles.iconBox}>
                  <Text style={styles.icon}>🏆</Text>
                </View>
                <Text style={styles.statLabel}>Total Mined</Text>
                <Text style={styles.statValue}>
                  ${user?.withdrawal_amount || '0.00'}
                </Text>
              </LinearGradient>
              {/* Gold Border Highlight */}
              <View style={styles.cardBorder} />
            </View>

            {/* Card 2: Level Income */}
            <View style={styles.glassCard}>
              <LinearGradient
                colors={['rgba(255,255,255,0.08)', 'rgba(0,0,0,0.5)']}
                style={styles.cardGradient}
              >
                <View style={styles.iconBox}>
                  <Text style={styles.icon}>🔱</Text>
                </View>
                <Text style={styles.statLabel}>Network Share</Text>
                <Text style={styles.statValue}>
                  ${user?.level_income || '0.00'}
                </Text>
              </LinearGradient>
              <View style={styles.cardBorder} />
            </View>
          </View>

          {/* 3️⃣ BOTTOM CONTAINER: ACTIVE RIGS (Scrollable) */}
          <View style={styles.bottomContainer}>
            <View style={styles.listHeader}>
              <Text style={styles.listTitle}>ACTIVE CRUCIBLES</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{investments.length}</Text>
              </View>
            </View>

            {loading ? (
              <ActivityIndicator
                size="large"
                color="#FFD700"
                style={{ marginTop: 50 }}
              />
            ) : !hasActive ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>Foundry Inactive</Text>
              </View>
            ) : (
              <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
              >
                {investments.map((item, index) => (
                  <View key={item.id} style={styles.rigCard}>
                    {/* Background Glow */}
                    <LinearGradient
                      colors={['#1c140d', '#000000']}
                      style={styles.rigInner}
                    >
                      {/* Header */}
                      <View style={styles.rigHeader}>
                        <View style={styles.rigIdBox}>
                          <Text style={styles.rigIdText}>{index + 1}</Text>
                        </View>
                        <View style={{ flex: 1, paddingLeft: 10 }}>
                          <Text style={styles.rigName}>
                            Smelter Unit-{100 + index}
                          </Text>
                          <Text style={styles.rigTemp}>
                            {item.temp}°F • Molten
                          </Text>
                        </View>
                        <Text style={styles.investedAmt}>${item.amount}</Text>
                      </View>

                      {/* Liquid Progress */}
                      <View style={styles.progressSection}>
                        <View
                          style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            marginBottom: 5,
                          }}
                        >
                          <Text style={styles.progressLabel}>Chamber Fill</Text>
                          <Text style={styles.progressValue}>
                            {item.progress.toFixed(0)}%
                          </Text>
                        </View>
                        <LiquidProgress progress={item.progress} />
                      </View>

                      {/* Footer */}
                      <View style={styles.rigFooter}>
                        <View>
                          <Text style={styles.yieldLabel}>GOLD VALUE</Text>
                          <Text style={styles.yieldValue}>
                            ${item.currentValue.toFixed(4)}
                          </Text>
                        </View>
                        <PopButton style={styles.actionBtn}>
                          <Text style={styles.actionBtnText}>EXTRACT</Text>
                        </PopButton>
                      </View>
                    </LinearGradient>
                  </View>
                ))}
              </ScrollView>
            )}
          </View>
        </SafeAreaView>
      </LinearGradient>
    </ScreenWrapper>
  );
}

/* --------------------------- STYLES --------------------------- */
const styles = StyleSheet.create({
  background: { flex: 1 },
  safeArea: { flex: 1 },

  /* --- 1️⃣ TOP: THE FURNACE --- */
  topContainer: {
    height: vs(260),
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: vs(10),
  },
  furnaceWindow: {
    width: s(220),
    height: s(220),
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  /* ⚡ NEW ANIMATION STYLES */
  animContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  animGlow: {
    position: 'absolute',
    width: s(120),
    height: s(120),
    borderRadius: s(60),
    backgroundColor: '#FFD700',
    opacity: 0.1,
    transform: [{scale: 1.8}],
  },
  orbitRing: {
    position: 'absolute',
    borderRadius: s(100),
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ringGradient: {
    width: '100%',
    height: '100%',
    borderRadius: s(100),
    opacity: 0.5,
  },
  orbitDot: {
    position: 'absolute',
    top: -4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFD700',
    shadowColor: '#FFF',
    shadowOpacity: 1,
    shadowRadius: 5,
  },
  core: {
    width: s(80),
    height: s(80),
    borderRadius: s(40),
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#FFD700',
    shadowColor: '#FFD700',
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 15,
  },
  coreGradient: {
    flex: 1,
  },
  coreInnerHighlight: {
    position: 'absolute',
    top: 10,
    left: 15,
    width: 20,
    height: 10,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 10,
    transform: [{rotate: '-45deg'}]
  },

  /* --- 2️⃣ MIDDLE: STATS --- */
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: ms(20),
    marginBottom: vs(15),
  },
  glassCard: {
    width: '48%',
    height: vs(110),
    borderRadius: ms(30),
    overflow: 'hidden',
    backgroundColor: '#000',
    position: 'relative',
  },
  cardGradient: {
    flex: 1,
    padding: ms(15),
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: ms(30),
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  iconBox: {
    width: s(36),
    height: s(36),
    borderRadius: s(18),
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: vs(8),
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.2)',
  },
  icon: { fontSize: ms(18) },
  statLabel: {
    color: '#8B8B8B',
    fontSize: ms(11),
    fontWeight: '600',
    marginBottom: vs(4),
  },
  statValue: {
    color: '#fff',
    fontSize: ms(18),
    fontWeight: '700',
    textShadowColor: 'rgba(255, 215, 0, 0.3)',
    textShadowRadius: 5,
  },

  /* --- 3️⃣ BOTTOM: LIST --- */
  bottomContainer: {
    flex: 1,
    backgroundColor: 'rgba(20, 16, 10, 0.8)',
    borderTopLeftRadius: ms(35),
    borderTopRightRadius: ms(35),
    paddingTop: ms(20),
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 215, 0, 0.1)',
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: ms(25),
    marginBottom: vs(15),
  },
  listTitle: {
    color: '#D4AF37',
    fontSize: ms(14),
    fontWeight: '800',
    letterSpacing: 1,
  },
  badge: {
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  badgeText: {
    color: '#FFD700',
    fontSize: ms(10),
    fontWeight: '700',
  },

  /* Rig Card */
  scrollContent: {
    paddingHorizontal: ms(20),
    paddingBottom: vs(30),
  },
  rigCard: {
    borderRadius: ms(30),
    marginBottom: vs(15),
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  rigInner: {
    padding: ms(16),
    borderRadius: ms(30),
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.15)',
  },
  rigHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: vs(12),
  },
  rigIdBox: {
    width: s(30),
    height: s(30),
    borderRadius: s(15),
    backgroundColor: '#332200',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  rigIdText: {
    color: '#FFD700',
    fontWeight: 'bold',
  },
  rigName: {
    color: '#fff',
    fontSize: ms(14),
    fontWeight: '700',
  },
  rigTemp: {
    color: '#FF4500',
    fontSize: ms(10),
  },
  investedAmt: {
    color: '#D4AF37',
    fontSize: ms(16),
    fontWeight: '700',
  },

  /* Liquid Bar */
  progressSection: {
    marginBottom: vs(15),
  },
  progressLabel: {
    color: '#666',
    fontSize: ms(10),
  },
  progressValue: {
    color: '#FFD700',
    fontSize: ms(10),
    fontWeight: '700',
  },
  liquidTrack: {
    height: vs(10),
    backgroundColor: '#111',
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#333',
    position: 'relative',
  },
  liquidFill: {
    height: '100%',
    borderRadius: 10,
  },
  liquidShine: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '50%',
    borderRadius: 10,
  },

  /* Footer */
  rigFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    paddingTop: vs(12),
  },
  yieldLabel: {
    color: '#888',
    fontSize: ms(9),
    marginBottom: 2,
  },
  yieldValue: {
    color: '#fff',
    fontSize: ms(16),
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  actionBtn: {
    backgroundColor: '#B8860B',
    paddingVertical: vs(8),
    paddingHorizontal: s(18),
    borderRadius: ms(20),
    shadowColor: '#FFD700',
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  actionBtnText: {
    color: '#000',
    fontSize: ms(10),
    fontWeight: '800',
  },
  emptyState: { alignItems: 'center', marginTop: vs(30) },
  emptyText: { color: '#555' },
});