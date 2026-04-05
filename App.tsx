import React, { useState, useEffect, useRef } from 'react';
import {
  NavigationContainer,
  DarkTheme as NavigationDarkTheme,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  StatusBar,
  Image,
  View,
  StyleSheet,
  Animated,
  Pressable,
} from 'react-native';
import {
  scale as s,
  verticalScale as vs,
  moderateScale as ms,
} from 'react-native-size-matters';
import { UserProvider } from './utils/UserContext';
import LinearGradient from 'react-native-linear-gradient';

// Import Screens
import SplashScreen from './SplashScreen';
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/home/HomeScreen';
import TransactionListScreen from './screens/home/TransactionListScreen';
import Help from './screens/home/Help';
import DepositScreen from './screens/home/DepositScreen';
import WithdrawalScreen from './screens/home/WithdrawalScreen';
import FeedScreen from './screens/Feed/FeedScreen';
import StoreScreen from './screens/Store/StoreScreen';
import RecieveMoneyScreen from './screens/home/RecieveMoneyScreen';
import SendMoneyScreen from './screens/home/SendMoneyScreen';
import OrderListScreen from './screens/Store/OrderListScreen';
import OnboardingScreen from './screens/Onboarding';
import Register from './screens/Register';
import ProfileScreen from './screens/home/ProfileScreen';
import BrowserScreen from './screens/home/BrowserScreen';
import TransactionDetailsScreen from './screens/home/TransactionDetailsScreen';
import IndirectReferralsScreen from './screens/home/IndirectReferralsScreen';
import WebinarScreen from './screens/Feed/WebinarScreen';

const RootStack = createNativeStackNavigator();
const HomeStack = createNativeStackNavigator();
const StoreStack = createNativeStackNavigator();
const FeedStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// 🎨 CHANGED: Neon Green Theme Gradient
const THEME_GRADIENT = ['#03310b', '#00d435'];

// 1️⃣ UPDATED THEME FOR GREEN ACCENTS
const MyDarkTheme = {
  ...NavigationDarkTheme,
  colors: {
    ...NavigationDarkTheme.colors,
    background: '#000000',
    card: '#000000',
    text: '#ffffff',
    border: '#0a1a10',
    notification: '#00ff40', // Neon green notifications
  },
};

const globalScreenOptions = {
  headerShown: false,
  contentStyle: { backgroundColor: '#000000' },
  animation: 'slide_from_right' as const,
};

// --- CUSTOM POP TAB BUTTON ---
const PopTabButton = (props: any) => {
  const scaleValue = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.8,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Pressable
      {...props}
      onPressIn={e => {
        handlePressIn();
        props.onPressIn && props.onPressIn(e);
      }}
      onPressOut={e => {
        handlePressOut();
        props.onPressOut && props.onPressOut(e);
      }}
      style={[props.style, styles.tabBtnContainer]}
    >
      <Animated.View
        style={{
          transform: [{ scale: scaleValue }],
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {props.children}
      </Animated.View>
    </Pressable>
  );
};

function HomeStackScreen() {
  return (
    <HomeStack.Navigator screenOptions={globalScreenOptions}>
      <HomeStack.Screen name="HomeMain" component={HomeScreen} />
      <HomeStack.Screen name="SendMoney" component={SendMoneyScreen} />
      <HomeStack.Screen name="RecieveMoney" component={FeedScreen} />
      <HomeStack.Screen name="WebinarScreen" component={WebinarScreen} />
      <HomeStack.Screen name="OrderList" component={OrderListScreen} />
      <HomeStack.Screen
        name="RecieveMoneyScreen"
        component={RecieveMoneyScreen}
      />
      <HomeStack.Screen
        name="IndirectReferralsScreen"
        component={IndirectReferralsScreen}
      />
      <HomeStack.Screen name="BrowserScreen" component={BrowserScreen} />
      <HomeStack.Screen name="DepositMoney" component={DepositScreen} />
      <HomeStack.Screen name="WithdrawalMoney" component={WithdrawalScreen} />
      <HomeStack.Screen
        name="TransactionDetailsScreen"
        component={TransactionDetailsScreen}
      />
      <HomeStack.Screen
        name="TransactionListScreen"
        component={TransactionListScreen}
      />
      <HomeStack.Screen name="StoreMain" component={StoreScreen} />
      <HomeStack.Screen name="ProfileScreen" component={ProfileScreen} />
    </HomeStack.Navigator>
  );
}

function FeedStackScreen() {
  return (
    <FeedStack.Navigator screenOptions={globalScreenOptions}>
      <FeedStack.Screen name="FeedMain" component={BrowserScreen} />
    </FeedStack.Navigator>
  );
}

function StoreStackScreen() {
  return (
    <StoreStack.Navigator screenOptions={globalScreenOptions}>
      <StoreStack.Screen name="SendMoney" component={SendMoneyScreen} />
    </StoreStack.Navigator>
  );
}

function MainTabs() {
  return (
    <View style={styles.tabContainer}>
      <Tab.Navigator
        initialRouteName="Home"
        sceneContainerStyle={{ backgroundColor: '#000000' }}
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: false,
          tabBarStyle: styles.tabBar,
          tabBarBackground: () => (
            <LinearGradient
              colors={THEME_GRADIENT}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={styles.gradientBackground}
            />
          ),
        }}
      >
        <Tab.Screen
          name="Trades"
          component={StoreStackScreen}
          options={{
            tabBarButton: props => <PopTabButton {...props} />,
            tabBarIcon: ({ focused }) => (
              <View style={styles.iconContainer}>
                <Image
                  source={require('./screens/tabMedia/store.webp')}
                  style={[
                    styles.icon,
                    focused ? styles.activeIcon : styles.inactiveIcon,
                  ]}
                  resizeMode="contain"
                />
                {focused && <View style={styles.activeDot} />}
              </View>
            ),
          }}
        />
        <Tab.Screen
          name="Home"
          component={HomeStackScreen}
          options={{
            tabBarButton: props => <PopTabButton {...props} />,
            tabBarIcon: ({ focused }) => (
              <View style={styles.iconContainer}>
                <Image
                  source={require('./screens/tabMedia/home.webp')}
                  style={[
                    styles.icon,
                    focused ? styles.activeIcon : styles.inactiveIcon,
                  ]}
                  resizeMode="contain"
                />
                {focused && <View style={styles.activeDot} />}
              </View>
            ),
          }}
        />
        <Tab.Screen
          name="Receipt"
          component={FeedStackScreen}
          options={{
            tabBarButton: props => <PopTabButton {...props} />,
            tabBarIcon: ({ focused }) => (
              <View style={styles.iconContainer}>
                <Image
                  source={require('./screens/tabMedia/feed.webp')}
                  style={[
                    styles.icon,
                    focused ? styles.activeIcon : styles.inactiveIcon,
                  ]}
                  resizeMode="contain"
                />
                {focused && <View style={styles.activeDot} />}
              </View>
            ),
          }}
        />
      </Tab.Navigator>
    </View>
  );
}

export default function App() {
  const [isShowSplash, setIsShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsShowSplash(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  if (isShowSplash) {
    return <SplashScreen />;
  }

  return (
    <UserProvider>
      <StatusBar backgroundColor="#000000" barStyle="light-content" />
      <View style={{ flex: 1, backgroundColor: '#000000' }}>
        <NavigationContainer theme={MyDarkTheme}>
          <RootStack.Navigator
            initialRouteName="Onboarding"
            screenOptions={globalScreenOptions}
          >
            <RootStack.Screen name="Onboarding" component={OnboardingScreen} />
            <RootStack.Screen name="Login" component={LoginScreen} />
            <RootStack.Screen name="Register" component={Register} />
            <RootStack.Screen name="Main" component={MainTabs} />
            <RootStack.Screen name="Help" component={Help} />
          </RootStack.Navigator>
        </NavigationContainer>
      </View>
    </UserProvider>
  );
}

const styles = StyleSheet.create({
  tabContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  tabBar: {
    position: 'absolute',
    bottom: vs(20),
    left: s(0),
    right: s(0),
    height: vs(65),
    borderRadius: ms(35),
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    elevation: 0,
    marginHorizontal: s(30),
    paddingHorizontal: s(15),
    paddingTop: vs(10),
  },
  gradientBackground: {
    flex: 1,
    borderRadius: ms(35),
    elevation: 10,
    shadowColor: '#00ff40', // Neon green shadow
  },
  tabBtnContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    width: '100%',
    gap: vs(4),
  },
  icon: {
    width: s(27),
    height: s(27),
  },
  activeIcon: {
    width: s(32),
    height: s(32),
    tintColor: '#bfffaf', // White icon on green background looks good
  },
  inactiveIcon: {
    tintColor: 'rgba(255, 255, 255, 0.25)', // Semi-transparent white icons for inactive
  },
  activeDot: {
    width: s(15),
    height: s(4),
    borderRadius: s(2.5),
    backgroundColor: '#bfffaf', // White dot on green
  },
});
