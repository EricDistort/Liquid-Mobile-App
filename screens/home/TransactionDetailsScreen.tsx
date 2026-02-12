import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Dimensions,
} from 'react-native';
import LottieView from 'lottie-react-native';
import { useRoute } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import {
  scale as s,
  verticalScale as vs,
  moderateScale as ms,
} from 'react-native-size-matters';
import ScreenWrapper from '../../utils/ScreenWrapper';
import { useUser } from '../../utils/UserContext';

const { width } = Dimensions.get('window');

export default function TransactionDetailsScreen() {
  const route = useRoute<any>();
  const { user } = useUser();
  const { transaction } = route.params || {};

  if (!transaction) return null;

  const isSent = transaction.sender_acc === user.account_number;
  
  // 🎨 CHANGED: Gold Foundry Palette
  const THEME_GRADIENT = ['#FFD700', '#B8860B']; 

  // Formatted Data
  const formattedDate = new Date(transaction.created_at).toLocaleDateString();
  const formattedTime = new Date(transaction.created_at).toLocaleTimeString(
    [],
    {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    },
  );

  return (
    <ScreenWrapper>
      {/* 🌑 Screen Background: Deep Bronze/Black */}
      <LinearGradient
        colors={['#000000', '#1a1005', '#241808']}
        style={{ flex: 1 }}
      >
        <StatusBar
          barStyle="light-content"
          translucent
          backgroundColor="transparent"
        />
        <View style={styles.container}>
          {/* 1️⃣ TOP CONTAINER (Animation Only) */}
          <View style={styles.topContainer}>
            <LinearGradient
              colors={['rgba(212, 175, 55, 0.2)', 'transparent']}
              style={styles.glowBackground}
              start={{ x: 0.5, y: 0.5 }}
              end={{ x: 0.5, y: 1 }}
            />
            <LottieView
              source={require('../homeMedia/Success.json')}
              autoPlay
              loop
              style={styles.lottie}
              resizeMode="contain"
            />
          </View>

          {/* 2️⃣ BOTTOM CONTAINER (Text Info) */}
          <View style={styles.bottomContainer}>
            {/* Top Border Line */}
            <LinearGradient
              colors={THEME_GRADIENT}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientLine}
            />

            <View style={styles.textWrapper}>
              {/* Main Status & Amount */}
              <View style={styles.headerTextContainer}>
                <Text style={styles.statusText}>TRANSACTION SUCCESSFUL</Text>
                <Text
                  style={[
                    styles.amountText,
                    // 🎨 CHANGED: Using theme colors for amount
                    { color: isSent ? '#FF4500' : '#00ff88' },
                  ]}
                >
                  {isSent ? '-' : '+'}${Math.abs(transaction.amount).toFixed(2)}
                </Text>
              </View>

              {/* Details Grid */}
              <View style={styles.detailsGrid}>
                {/* Row 1: Sender & Receiver */}
                <View style={styles.row}>
                  <View style={styles.colLeft}>
                    <Text style={styles.label}>Receiver</Text>
                    <Text style={styles.value}>
                      {isSent ? 'You' : transaction.sender?.username}
                    </Text>
                  </View>

                  <View style={styles.colRight}>
                    <Text style={styles.label}>Sender</Text>
                    <Text style={styles.value}>
                      {!isSent ? 'You' : transaction.receiver?.username}
                    </Text>
                  </View>
                </View>

                {/* Row 2: Date & Ref ID */}
                <View style={[styles.row, { marginTop: vs(15) }]}>
                  <View style={styles.colLeft}>
                    <Text style={styles.label}>Date & Time</Text>
                    <Text style={styles.value}>{formattedDate}</Text>
                    <Text style={styles.subValue}>{formattedTime}</Text>
                  </View>

                  <View style={styles.colRight}>
                    <Text style={styles.label}>Ref ID</Text>
                    <Text style={styles.valueMono}>{transaction.id}</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>
      </LinearGradient>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },

  /* ---------------- TOP CONTAINER (60%) ---------------- */
  topContainer: {
    height: '50%',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  glowBackground: {
    position: 'absolute',
    width: width * 0.85,
    height: width * 0.85,
    borderRadius: (width * 0.85) / 2,
    opacity: 0.3,
  },
  lottie: {
    width: width * 0.85,
    height: width * 0.85,
  },

  /* ---------------- BOTTOM CONTAINER (40%) ---------------- */
  bottomContainer: {
    height: '40%',
    width: '100%',
    backgroundColor: '#0a0a0a', // Deep Obsidian
    borderTopLeftRadius: ms(30),
    borderTopRightRadius: ms(30),
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.1)',
  },
  gradientLine: {
    height: vs(3),
    width: '100%',
    opacity: 0.8,
  },
  textWrapper: {
    flex: 1,
    paddingHorizontal: s(25),
    paddingTop: vs(25),
  },

  /* Header Section (Status + Amount) */
  headerTextContainer: {
    alignItems: 'center',
    marginBottom: vs(25),
  },
  statusText: {
    color: '#D4AF37', // Gold text
    fontSize: ms(12),
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: vs(4),
    textTransform: 'uppercase',
  },
  amountText: {
    fontSize: ms(36),
    fontWeight: '800',
    letterSpacing: -0.5,
  },

  /* Details Grid */
  detailsGrid: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  colLeft: {
    flex: 1,
    alignItems: 'flex-start',
  },
  colRight: {
    flex: 1,
    alignItems: 'flex-end',
  },

  /* Typography */
  label: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: ms(11),
    textTransform: 'uppercase',
    fontWeight: '600',
    marginBottom: vs(2),
  },
  value: {
    color: '#fff',
    fontSize: ms(15),
    fontWeight: '700',
  },
  valueMono: {
    color: '#FFD700', // Gold Ref ID
    fontSize: ms(14),
    //fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  subValue: {
    color: '#888',
    fontSize: ms(12),
    marginTop: vs(1),
  },
});