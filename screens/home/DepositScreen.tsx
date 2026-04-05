import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  Platform,
  Image,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
  StatusBar,
  KeyboardAvoidingView,
  Animated,
  Pressable,
  Keyboard,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import LottieView from 'lottie-react-native';
import {
  scale as s,
  verticalScale as vs,
  moderateScale as ms,
} from 'react-native-size-matters';
import ScreenWrapper from '../../utils/ScreenWrapper';
import { useUser } from '../../utils/UserContext';
import { supabase } from '../../utils/supabaseClient';
import Clipboard from '@react-native-clipboard/clipboard';

// --- POP BUTTON COMPONENT ---
const PopButton = ({ onPress, children, style, disabled }: any) => {
  const scaleValue = React.useRef(new Animated.Value(1)).current;

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
      disabled={disabled}
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

export default function DepositScreen() {
  const { user } = useUser();

  // App Logic States
  const [walletAddress, setWalletAddress] = useState(''); // Company Wallet
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  // Input States
  // Note: We use 'txHash' state variable, but this functions as "Sender Address" in your UI
  const [txHash, setTxHash] = useState('');

  // User Data States
  const [fixedSenderAddress, setFixedSenderAddress] = useState<string | null>(
    null,
  );
  const [deposits, setDeposits] = useState<any[]>([]);
  const [hasPending, setHasPending] = useState(false);

  // UI States
  const [loading, setLoading] = useState(false);
  const [loadingDeposits, setLoadingDeposits] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [warningMessage, setWarningMessage] = useState(
    'Loading instructions...',
  );

  // --- 🎨 NEON GREEN THEME ---
  const THEME_GRADIENT = ['#03310b', '#00d435']; // Dark Green -> Neon Green
  const DISABLED_GRADIENT = ['#4a4a4a', '#2b2b2b']; // Grey

  // 1. Fetch Company Wallet & User's Fixed Address
  const fetchInitialData = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('users')
        .select(
          `
          sender_wallet_address,
          deposit_info (
            wallet_address,
            qr_code_url
          )
        `,
        )
        .eq('id', user.id)
        .single();

      if (!error && data) {
        // Handle Deposit Info (Company Wallet)
        const info: any = Array.isArray(data.deposit_info)
          ? data.deposit_info[0]
          : data.deposit_info;

        if (info) {
          setWalletAddress(info.wallet_address);
          setQrCodeUrl(info.qr_code_url);
        }

        // Handle User's Fixed Address
        if (data.sender_wallet_address) {
          setFixedSenderAddress(data.sender_wallet_address);
          setTxHash(data.sender_wallet_address); // Auto-fill input
        }
      }
    } catch (err) {
      console.log('Error fetching initial data', err);
    }
  };

  const fetchWarningText = async () => {
    try {
      const { data } = await supabase
        .from('fake_traders')
        .select('name')
        .eq('id', 11)
        .single();

      if (data?.name) setWarningMessage(data.name);
      else setWarningMessage('Copy address & send exact amount.');
    } catch (err) {
      console.log('Error fetching warning text', err);
    }
  };

  const fetchDeposits = async () => {
    if (!user?.id) return;
    setLoadingDeposits(true);

    const { data, error } = await supabase
      .from('deposits')
      .select('id, amount, status, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setDeposits(data);
      // Restriction Check: Are there any pending deposits?
      const pendingExists = data.some((d: any) => d.status === 'pending');
      setHasPending(pendingExists);
    }
    setLoadingDeposits(false);
  };

  useEffect(() => {
    fetchInitialData();
    fetchDeposits();
    fetchWarningText();
  }, [user?.id]);

  const copyToClipboard = () => {
    if (walletAddress) {
      Clipboard.setString(walletAddress);
      Alert.alert('Copied', 'Wallet address copied to clipboard!');
    }
  };

  const submitDeposit = async () => {
    Keyboard.dismiss();

    const addressToSubmit = fixedSenderAddress || txHash.trim();

    if (!addressToSubmit) {
      Alert.alert('Error', 'Please enter your sender wallet address');
      return;
    }

    setLoading(true);

    try {
      // 🚨 CHECK UNIQUENESS: If first time, ensure address isn't taken by another user
      if (!fixedSenderAddress) {
        const { data: existingUser } = await supabase
          .from('users')
          .select('id')
          .eq('sender_wallet_address', addressToSubmit)
          .maybeSingle();

        if (existingUser && existingUser.id !== user.id) {
          Alert.alert(
            'Failed',
            'This wallet address is already linked to another account.',
          );
          setLoading(false);
          return;
        }
      }

      // 1. Submit the Deposit
      const { error: depositError } = await supabase.from('deposits').insert([
        {
          user_id: user.id,
          // 🚨 CRITICAL FIX: Sending to 'sender_wallet_address' column
          sender_wallet_address: addressToSubmit,
          // We also send to tx_hash just in case your old logic needs it
          tx_hash: addressToSubmit,
          wallet_address: walletAddress,
          status: 'pending',
        },
      ]);

      if (depositError) throw depositError;

      // 2. If this is the FIRST time, we lock it locally for immediate UI feedback.
      // The SQL Trigger will handle the actual database lock.
      if (!fixedSenderAddress) {
        setFixedSenderAddress(addressToSubmit);
      }

      setShowSuccess(true);
      fetchDeposits();
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return '#00ff88'; // Green
      case 'pending':
        return '#FFD700'; // Yellow/Gold for pending status
      case 'rejected':
        return '#ff4d4d'; // Red
      default:
        return '#aaa';
    }
  };

  const renderHistoryItem = ({ item }: { item: any }) => (
    <View style={styles.historyCard}>
      <View style={styles.historyLeft}>
        <Text style={styles.historyAmount}>${item.amount || 0}</Text>
        <Text style={styles.historyDate}>
          {new Date(item.created_at).toLocaleDateString()} •{' '}
          {new Date(item.created_at).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </View>
      <View
        style={[
          styles.statusBadge,
          {
            backgroundColor: `${getStatusColor(item.status)}20`,
            borderColor: `${getStatusColor(item.status)}50`,
          },
        ]}
      >
        <Text
          style={[styles.statusText, { color: getStatusColor(item.status) }]}
        >
          {item.status.toUpperCase()}
        </Text>
      </View>
    </View>
  );

  return (
    <ScreenWrapper>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <LinearGradient
        colors={['#000000', '#0a1a10', '#082415']}
        style={{ flex: 1 }}
      >
        <SafeAreaView style={styles.safeArea}>
          {showSuccess && (
            <View style={styles.successOverlay}>
              <LottieView
                source={require('../homeMedia/Success.json')}
                autoPlay
                loop={false}
                onAnimationFinish={() => setShowSuccess(false)}
                style={styles.successLottie}
                resizeMode="contain"
              />
            </View>
          )}

          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.container}
          >
            <View style={styles.topSection}>
              <Text style={styles.screenTitle}>Deposit Funds</Text>

              <View style={styles.formContainer}>
                <View style={styles.qrRow}>
                  {qrCodeUrl ? (
                    <View style={styles.qrWrapper}>
                      <Image
                        source={{ uri: qrCodeUrl }}
                        style={styles.qrImage}
                        resizeMode="contain"
                      />
                    </View>
                  ) : null}
                  <View style={styles.warningBox}>
                    <Text style={styles.warningText}>⚠️ IMPORTANT</Text>
                    <Text style={styles.warningDesc}>{warningMessage}</Text>
                  </View>
                </View>

                <View style={styles.inputWrapper}>
                  <View style={styles.walletBox}>
                    <Text
                      style={styles.walletText}
                      numberOfLines={1}
                      ellipsizeMode="middle"
                    >
                      {walletAddress || 'Loading...'}
                    </Text>
                    <PopButton
                      onPress={copyToClipboard}
                      style={{ width: 'auto' }}
                    >
                      <Text style={styles.copyText}>COPY</Text>
                    </PopButton>
                  </View>
                </View>

                <View style={styles.inputWrapper}>
                  <TextInput
                    style={[
                      styles.input,
                      fixedSenderAddress
                        ? {
                            opacity: 0.5,
                            backgroundColor: 'rgba(0, 255, 64, 0.05)',
                          }
                        : {},
                    ]}
                    placeholder="Sender Wallet Address"
                    value={txHash}
                    onChangeText={setTxHash}
                    autoCapitalize="none"
                    placeholderTextColor="rgba(255,255,255,0.3)"
                    editable={!fixedSenderAddress}
                  />
                </View>

                <PopButton
                  onPress={submitDeposit}
                  disabled={loading || hasPending}
                >
                  <LinearGradient
                    colors={hasPending ? DISABLED_GRADIENT : THEME_GRADIENT}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.submitBtn}
                  >
                    {loading ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <Text
                        style={[
                          styles.submitBtnText,
                          hasPending ? { color: '#888' } : { color: '#fff' },
                        ]}
                      >
                        {hasPending
                          ? 'Pending Deposit Active'
                          : 'Confirm Deposit'}
                      </Text>
                    )}
                  </LinearGradient>
                </PopButton>
              </View>
            </View>

            <View style={styles.historyContainer}>
              <Text style={styles.historyHeader}>Recent History</Text>
              {loadingDeposits ? (
                <ActivityIndicator color="#00ff40" style={{ marginTop: 20 }} />
              ) : (
                <FlatList
                  data={deposits}
                  keyExtractor={item => item.id.toString()}
                  renderItem={renderHistoryItem}
                  contentContainerStyle={styles.listContent}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                  ListEmptyComponent={
                    <Text style={styles.emptyText}>
                      No deposit history found
                    </Text>
                  }
                />
              )}
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </LinearGradient>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: {
    flex: 1,
    paddingHorizontal: s(10),
    paddingTop: vs(10),
  },
  successOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 1)',
    zIndex: 9999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successLottie: { width: s(300), height: s(300) },
  topSection: { marginBottom: vs(20) },
  screenTitle: {
    fontSize: ms(24),
    fontWeight: '800',
    color: '#00ff40', // Neon Green
    marginBottom: vs(15),
    letterSpacing: 0.5,
    marginTop: vs(15),
  },
  formContainer: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: ms(20),
    padding: s(15),
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 64, 0.15)', // Green Tint
  },
  qrRow: { flexDirection: 'row', alignItems: 'center', marginBottom: vs(15) },
  qrWrapper: {
    width: s(100),
    height: s(100),
    backgroundColor: '#fff',
    borderRadius: ms(10),
    padding: s(5),
    marginRight: s(15),
  },
  qrImage: { width: '100%', height: '100%' },
  warningBox: { flex: 1, justifyContent: 'center' },
  warningText: {
    color: '#00ff40',
    fontWeight: '700',
    fontSize: ms(12),
    marginBottom: vs(2),
  },
  warningDesc: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: ms(11),
    lineHeight: ms(15),
  },
  inputWrapper: { marginBottom: vs(12) },
  walletBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000',
    borderRadius: ms(20),
    paddingHorizontal: s(15),
    height: vs(45),
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 64, 0.3)', // Green Border
  },
  walletText: {
    color: '#00ff40',
    flex: 1,
    fontSize: ms(13),
    marginRight: s(10),
  },
  copyText: {
    color: '#00ff40',
    fontWeight: '700',
    fontSize: ms(12),
    backgroundColor: 'rgba(0, 255, 64, 0.1)',
    paddingHorizontal: s(10),
    paddingVertical: vs(5),
    borderRadius: ms(14),
    borderWidth: 0.5,
    borderColor: '#00ff40',
  },
  input: {
    backgroundColor: '#000',
    borderRadius: ms(20),
    height: vs(45),
    paddingHorizontal: s(15),
    color: '#fff',
    fontSize: ms(14),
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 64, 0.3)',
  },
  submitBtn: {
    height: vs(48),
    borderRadius: ms(20),
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: vs(5),
    width: '100%',
  },
  submitBtnText: {
    color: '#fff',
    fontSize: ms(15),
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  historyContainer: { flex: 1 },
  historyHeader: {
    fontSize: ms(18),
    fontWeight: '700',
    color: '#00ff40',
    marginBottom: vs(10),
  },
  listContent: { paddingBottom: vs(200) },
  historyCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: ms(20),
    padding: s(12),
    marginBottom: vs(8),
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 64, 0.15)',
  },
  historyLeft: { flexDirection: 'column' },
  historyAmount: {
    color: '#fff',
    fontSize: ms(16),
    fontWeight: 'bold',
    marginBottom: vs(2),
  },
  historyDate: { color: 'rgba(255,255,255,0.4)', fontSize: ms(11) },
  statusBadge: {
    paddingVertical: vs(4),
    paddingHorizontal: s(8),
    borderRadius: ms(10),
    borderWidth: 1,
  },
  statusText: { fontSize: ms(10), fontWeight: '800' },
  emptyText: {
    color: 'rgba(255,255,255,0.3)',
    textAlign: 'center',
    marginTop: vs(20),
    fontSize: ms(14),
  },
});
