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
  Dimensions,
  StatusBar,
  Keyboard,
  TouchableWithoutFeedback,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  scale as s,
  verticalScale as vs,
  moderateScale as ms,
} from 'react-native-size-matters';
import LinearGradient from 'react-native-linear-gradient';
import LottieView from 'lottie-react-native';

// Keep your existing utils
import { supabase } from '../utils/supabaseClient';
import { useUser } from '../utils/UserContext';
import ScreenWrapper from '../utils/ScreenWrapper';

const { width, height } = Dimensions.get('window');

type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Main: undefined;
};

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

export default function Login() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { setUser } = useUser();
  const [accountNumber, setAccountNumber] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // 🎨 NEON GREEN GRADIENT
  const THEME_GRADIENT = ['#03310b', '#00d435'];

  const navigateToApp = (userData: any) => {
    setUser(userData);
    navigation.replace('Main');
  };

  const handleLogin = async () => {
    Keyboard.dismiss();

    if (!accountNumber.trim() || !password.trim())
      return Alert.alert('Missing Details', 'Please fill in all fields.');

    setLoading(true);
    const startTime = Date.now();

    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('account_number', parseInt(accountNumber.trim()))
        .maybeSingle();

      if (error) throw error;

      const elapsedTime = Date.now() - startTime;
      const minDuration = 3000;
      const remainingTime = Math.max(0, minDuration - elapsedTime);

      await new Promise(resolve => setTimeout(resolve, remainingTime));

      if (!user) {
        setLoading(false);
        setTimeout(
          () => Alert.alert('Login Failed', 'Account number not found.'),
          100,
        );
        return;
      }

      if (user.password === password.trim()) {
        setLoading(false);
        navigateToApp(user);
      } else {
        setLoading(false);
        setTimeout(() => Alert.alert('Login Failed', 'Invalid password.'), 100);
      }
    } catch (error: any) {
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, 3000 - elapsedTime);
      await new Promise(resolve => setTimeout(resolve, remainingTime));

      setLoading(false);
      setTimeout(() => Alert.alert('Error', error.message), 100);
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

          {/* Loading Overlay */}
          {loading && (
            <View style={styles.loadingOverlay}>
              <LottieView
                source={require('./LoginMedia/loadinglatest.json')}
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
                keyboardShouldPersistTaps="handled"
              >
                <View style={styles.contentContainer}>
                  {/* Header Typography */}
                  <View style={styles.header}>
                    <Text style={styles.titleOutline}>Welcome</Text>
                    <Text style={styles.titleFilled}>Back</Text>
                    <Text style={styles.subtitle}>
                      Sign in to access your Liquid.
                    </Text>
                  </View>

                  {/* Form Fields */}
                  <View style={styles.formSection}>
                    <View style={styles.inputContainer}>
                      <Text style={styles.label}>ACCOUNT NUMBER</Text>
                      <TextInput
                        placeholder="12345678"
                        style={styles.input}
                        value={accountNumber}
                        onChangeText={setAccountNumber}
                        keyboardType="numeric"
                        placeholderTextColor="rgba(255,255,255,0.2)"
                      />
                    </View>

                    <View style={styles.inputContainer}>
                      <Text style={styles.label}>PASSWORD</Text>
                      <TextInput
                        placeholder="••••••••••••"
                        style={styles.input}
                        value={password}
                        secureTextEntry
                        onChangeText={setPassword}
                        autoCapitalize="none"
                        placeholderTextColor="rgba(255,255,255,0.2)"
                      />
                    </View>

                    <View style={styles.spacer} />

                    {/* MAIN ACTION BUTTON */}
                    <PopButton
                      onPress={handleLogin}
                      disabled={loading}
                      style={{ width: '100%' }}
                    >
                      <LinearGradient
                        colors={THEME_GRADIENT}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.gradientButton}
                      >
                        <Text style={styles.btnText}>ACCESS ACCOUNT</Text>
                      </LinearGradient>
                    </PopButton>

                    {/* REGISTER LINK */}
                    <PopButton
                      onPress={() => navigation.navigate('Register')}
                      style={styles.registerLink}
                    >
                      <Text style={styles.registerText}>
                        New here?{' '}
                        <Text style={styles.registerHighlight}>
                          Create Account
                        </Text>
                      </Text>
                    </PopButton>
                  </View>
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
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: vs(50),
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
  contentContainer: {
    paddingHorizontal: s(24),
    width: '100%',
  },
  header: {
    marginBottom: vs(40),
  },
  titleOutline: {
    fontSize: ms(42),
    fontWeight: '300',
    color: 'transparent',
    textShadowColor: 'rgba(0,255,64,0.3)', // Green glow
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
    letterSpacing: 2,
    marginBottom: -8,
  },
  titleFilled: {
    fontSize: ms(42),
    fontWeight: '900',
    color: '#d3ffc7',
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: ms(14),
    color: 'rgba(205, 255, 195, 0.58)',
    marginTop: vs(5),
    fontWeight: '400',
  },
  formSection: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: vs(20),
  },
  label: {
    fontSize: ms(10),
    fontWeight: '800',
    color: '#00ff40', // Neon Green
    marginBottom: vs(8),
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: ms(22),
    paddingHorizontal: s(16),
    paddingVertical: vs(14),
    color: '#fff',
    fontSize: ms(16),
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 64, 0.15)', // Green tint border
  },
  spacer: {
    height: vs(10),
  },
  gradientButton: {
    paddingVertical: vs(18),
    borderRadius: ms(25),
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#00ff40',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 10,
    width: '100%',
  },
  btnText: {
    color: '#d3ffc7', // High contrast text on green button
    fontSize: ms(16),
    fontWeight: '900',
    letterSpacing: 2,
  },
  registerLink: {
    marginTop: vs(15),
    alignSelf: 'center',
    padding: s(10),
  },
  registerText: {
    color: 'rgba(217, 255, 216, 0.5)',
    fontSize: ms(14),
  },
  registerHighlight: {
    color: '#00ff40',
    fontWeight: '700',
  },
});
