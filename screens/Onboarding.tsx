import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  Dimensions,
  Animated,
  Pressable,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {
  scale as s,
  verticalScale as vs,
  moderateScale as ms,
} from 'react-native-size-matters';
import ScreenWrapper from '../utils/ScreenWrapper';

const { width } = Dimensions.get('window');

// 🎨 CHANGED: Neon Green Theme Colors (Matched to HomeScreen)
const NEON_GREEN = '#00ff40';
const GREEN_DARK = '#03310b';
const GREEN_LIGHT = '#00d435';

const slides = [
  {
    id: '1',
    title: 'Liquid Earnings',
    desc: 'Deposit funds and start Liquid to earn daily profits.',
    image: require('./LoginMedia/Very.png'),
  },
  {
    id: '2',
    title: 'Fast Withdrawals',
    desc: 'Get your earnings sent directly to your wallet quickly.',
    image: require('./LoginMedia/Third.png'),
  },
  {
    id: '3',
    title: 'Level Income',
    desc: 'Invite friends and earn commissions up to 10 levels deep.',
    image: require('./LoginMedia/Second.png'), 
  },
];

// --- MODERN POP BUTTON COMPONENT ---
const PopButton = ({ onPress, children, style }: any) => {
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
      <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
        {children}
      </Animated.View>
    </Pressable>
  );
};

export default function OnboardingScreen({ navigation }: any) {
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-scroll every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      let nextIndex = currentIndex + 1;
      if (nextIndex >= slides.length) nextIndex = 0;

      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      setCurrentIndex(nextIndex);
    }, 3000);

    return () => clearInterval(interval);
  }, [currentIndex]);

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems[0]) {
      setCurrentIndex(viewableItems[0].index);
    }
  });

  return (
    <ScreenWrapper>
      {/* 🌑 Background: Neon Green Gradient */}
      <LinearGradient
        colors={['#000000', '#0a1a10', '#082415']}
        style={{ flex: 1 }}
      >
        <View style={styles.container}>
          <View style={{ flex: 1 }}>
            <FlatList
              data={slides}
              ref={flatListRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => (
                <View style={styles.slide}>
                  <View style={styles.imageContainer}>
                    <Image
                      source={item.image}
                      style={styles.image}
                      resizeMode="contain"
                    />
                  </View>
                  <Text style={styles.title}>{item.title}</Text>
                  <Text style={styles.desc}>{item.desc}</Text>
                </View>
              )}
              keyExtractor={item => item.id}
              onViewableItemsChanged={onViewableItemsChanged.current}
              viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
            />
          </View>

          {/* Pagination dots */}
          <View style={styles.dots}>
            {slides.map((_, index) => (
              <View
                key={index}
                style={[styles.dot, currentIndex === index && styles.activeDot]}
              />
            ))}
          </View>

          {/* Buttons Container */}
          <View style={styles.buttonContainer}>
            {/* Continue Button with Pop Effect */}
            <PopButton onPress={() => navigation.replace('Login')}>
              <LinearGradient
                colors={[GREEN_DARK, GREEN_LIGHT]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.continueBtn}
              >
                <Text style={styles.buttonText}>Get Started</Text>
              </LinearGradient>
            </PopButton>
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
  slide: {
    width: width,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: vs(80),
  },
  imageContainer: {
    width: width * 0.8,
    height: width * 0.8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: vs(20),
  },
  image: {
    width: '100%',
    height: '100%',
  },
  title: {
    // 🎨 CHANGED: Title Color to Neon Green
    color: NEON_GREEN,
    fontSize: ms(28),
    fontWeight: 'bold',
    marginBottom: vs(12),
  },
  desc: {
    color: '#baffba9c',
    fontSize: ms(16),
    width: '85%',
    textAlign: 'center',
    lineHeight: ms(24),
    fontWeight: '400',
  },
  dots: {
    flexDirection: 'row',
    alignSelf: 'center',
    marginBottom: vs(40),
  },
  dot: {
    width: ms(8),
    height: ms(8),
    backgroundColor: '#275a27',
    borderRadius: ms(4),
    marginHorizontal: s(6),
  },
  activeDot: {
    // 🎨 CHANGED: Active Dot to Neon Green
    backgroundColor: NEON_GREEN,
    width: ms(24),
    height: ms(8),
    borderRadius: ms(4),
  },

  // --- Button Styles ---
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: vs(50),
  },

  // 1. CONTINUE BUTTON
  continueBtn: {
    width: s(280),
    height: vs(50),
    borderRadius: ms(25),
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },

  buttonText: {
    textAlign: 'center',
    // 🎨 CHANGED: Button Text to White for contrast against Green
    color: '#d3ffc7',
    fontWeight: 'bold',
    fontSize: ms(18),
  },
});
