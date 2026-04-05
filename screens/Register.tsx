import React, { useState, useRef } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  Animated,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  scale as s,
  verticalScale as vs,
  moderateScale as ms,
} from 'react-native-size-matters';
import LinearGradient from 'react-native-linear-gradient';
import LottieView from 'lottie-react-native';

// Utils
import { supabase } from '../utils/supabaseClient';
import { useUser } from '../utils/UserContext';
import ScreenWrapper from '../utils/ScreenWrapper';

const { width, height } = Dimensions.get('window');

// --- GENERIC POP BUTTON COMPONENT ---
const PopButton = ({
  onPress,
  children,
  disabled,
  style,
}: {
  onPress: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  style?: any;
}) => {
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
      tension: 50,
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
        style={{ transform: [{ scale: scaleValue }], width: '100%' }}
      >
        {children}
      </Animated.View>
    </Pressable>
  );
};

export default function Register() {
  const navigation = useNavigation<any>();
  const { setUser } = useUser();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [referrerAcc, setReferrerAcc] = useState('');
  const [loading, setLoading] = useState(false);

  // 🎨 NEON GREEN THEME COLORS
  const THEME_GRADIENT = ['#03310b', '#00d435'];

  const handleRegister = async () => {
    if (
      !username.trim() ||
      !email.trim() ||
      !password.trim() ||
      !mobile.trim() ||
      !referrerAcc.trim()
    )
      return Alert.alert('Missing Details', 'All fields are required.');

    setLoading(true);
    const startTime = Date.now();

    try {
      const { data: refUser } = await supabase
        .from('users')
        .select('account_number')
        .eq('account_number', referrerAcc.trim())
        .maybeSingle();

      if (!refUser) {
        await enforceMinDuration(startTime);
        setLoading(false);
        setTimeout(
          () =>
            Alert.alert(
              'Invalid Referrer',
              'The referrer account number does not exist.',
            ),
          100,
        );
        return;
      }

      const { data: insertedUser, error: insertError } = await supabase
        .from('users')
        .insert([
          {
            username: username.trim(),
            email: email.trim(),
            password: password.trim(),
            mobile: mobile.trim(),
            balance: 0,
            referrer_account_number: refUser.account_number,
          },
        ])
        .select('*')
        .single();

      if (insertError) {
        if (insertError.code === '23505') {
          throw new Error('Email or Mobile number is already registered.');
        }
        throw insertError;
      }

      await enforceMinDuration(startTime);
      setLoading(false);
      setUser(insertedUser);
      navigation.replace('Main');
    } catch (error: any) {
      await enforceMinDuration(startTime);
      setLoading(false);
      setTimeout(() => Alert.alert('Registration Failed', error.message), 100);
    }
  };

  const enforceMinDuration = async (startTime: number) => {
    const elapsed = Date.now() - startTime;
    const remaining = Math.max(0, 3000 - elapsed);
    if (remaining > 0) {
      await new Promise(resolve => setTimeout(resolve, remaining));
    }
  };

  return (
    <ScreenWrapper>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.mainContainer}>
          {/* 🎨 Ambient Neon Green Background Glows */}
          <LinearGradient
            colors={['rgba(0, 255, 64, 0.3)', 'transparent']}
            style={styles.topGlow}
          />
          <View style={styles.bottomGlow} />

          {loading && (
            <View style={styles.loadingOverlay}>
              <LottieView
                source={require('./LoginMedia/Loading.json')}
                autoPlay
                loop
                style={styles.loadingAnimation}
              />
            </View>
          )}

          <SafeAreaView style={{ flex: 1 }}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={{ flex: 1 }}
            >
              <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                bounces={false}
              >
                <View style={styles.header}>
                  <Text style={styles.titleOutline}>Start</Text>
                  <Text style={styles.titleFilled}>Liquidity</Text>
                  <Text style={styles.subtitle}>
                    Initialize your Daily Profits.
                  </Text>
                </View>

                <View style={styles.formSection}>
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>USERNAME</Text>
                    <TextInput
                      placeholder="e.g. MinerOne"
                      style={styles.input}
                      value={username}
                      onChangeText={setUsername}
                      placeholderTextColor="rgba(255,255,255,0.2)"
                      autoCapitalize="none"
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>EMAIL</Text>
                    <TextInput
                      placeholder="name@domain.com"
                      style={styles.input}
                      value={email}
                      onChangeText={setEmail}
                      placeholderTextColor="rgba(255,255,255,0.2)"
                      autoCapitalize="none"
                      keyboardType="email-address"
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>MOBILE</Text>
                    <TextInput
                      placeholder="+1 234 567 890"
                      style={styles.input}
                      value={mobile}
                      onChangeText={setMobile}
                      placeholderTextColor="rgba(255,255,255,0.2)"
                      keyboardType="phone-pad"
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>PASSWORD</Text>
                    <TextInput
                      placeholder="••••••••••••"
                      style={styles.input}
                      value={password}
                      onChangeText={setPassword}
                      placeholderTextColor="rgba(255,255,255,0.2)"
                      secureTextEntry
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>REFERRER CODE</Text>
                    <TextInput
                      placeholder="123456"
                      style={styles.input}
                      value={referrerAcc}
                      onChangeText={setReferrerAcc}
                      placeholderTextColor="rgba(255,255,255,0.2)"
                      keyboardType="numeric"
                    />
                  </View>

                  <View style={styles.spacer} />

                  <PopButton
                    onPress={handleRegister}
                    disabled={loading}
                    style={{ width: '100%' }}
                  >
                    <LinearGradient
                      colors={THEME_GRADIENT}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.gradientButton}
                    >
                      <Text style={styles.btnText}>CREATE VAULT</Text>
                    </LinearGradient>
                  </PopButton>

                  <PopButton
                    onPress={() => navigation.goBack()}
                    style={styles.loginLink}
                  >
                    <Text style={styles.loginText}>
                      Already registered?{' '}
                      <Text style={styles.loginHighlight}>Sign In</Text>
                    </Text>
                  </PopButton>
                </View>
              </ScrollView>
            </KeyboardAvoidingView>
          </SafeAreaView>
        </View>
      </TouchableWithoutFeedback>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#000',
  },

  topGlow: {
    position: 'absolute',
    top: -height * 0.15,
    left: -width * 0.2,
    width: width * 1.2,
    height: width * 1.2,
    borderRadius: width,
    opacity: 0.3,
  },
  bottomGlow: {
    position: 'absolute',
    bottom: vs(-100),
    right: s(-50),
    width: s(200),
    height: s(200),
    borderRadius: s(100),
    backgroundColor: '#00b436', // Neon green glow
    opacity: 0.08,
    transform: [{ scale: 1.5 }],
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 1)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  loadingAnimation: {
    width: s(300),
    height: s(300),
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: s(24),
    justifyContent: 'center',
    paddingBottom: vs(20),
  },

  header: {
    marginBottom: vs(15),
    marginTop: vs(10),
  },
  titleOutline: {
    fontSize: ms(32),
    fontWeight: '300',
    color: 'transparent',
    textShadowColor: 'rgba(0,255,64,0.3)', // Green shadow
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
    letterSpacing: 2,
    marginBottom: -8,
  },
  titleFilled: {
    fontSize: ms(32),
    fontWeight: '900',
    color: '#d3ffc7',
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: ms(13),
    color: 'rgba(205, 255, 195, 0.58)',
    marginTop: vs(2),
    fontWeight: '400',
  },

  formSection: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: vs(10),
  },
  label: {
    fontSize: ms(10),
    fontWeight: '800',
    color: '#00ff40', // Neon Green
    marginBottom: vs(4),
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: ms(18),
    paddingHorizontal: s(12),
    paddingVertical: vs(10),
    color: '#fff',
    fontSize: ms(16),
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 64, 0.15)', // Green tint border
  },

  spacer: {
    height: vs(10),
  },
  gradientButton: {
    paddingVertical: vs(14),
    borderRadius: ms(22),
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#00ff40',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
    marginTop: vs(5),
  },
  btnText: {
    color: '#d3ffc7', // White text on green button
    fontSize: ms(14),
    fontWeight: '900',
    letterSpacing: 2,
  },
  loginLink: {
    marginTop: vs(15),
    alignSelf: 'center',
    padding: s(5),
  },
  loginText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: ms(14),
  },
  loginHighlight: {
    color: '#00ff40',
    fontWeight: '700',
  },
});
