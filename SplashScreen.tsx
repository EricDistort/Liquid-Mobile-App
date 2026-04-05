import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import LottieView from 'lottie-react-native';

const { width } = Dimensions.get('window');

const SplashScreen = () => {
  return (
    <View style={styles.container}>
      <LottieView
        // Replace with your actual Lottie JSON file path
        source={require('./screens/LoginMedia/Loading.json')}
        autoPlay
        loop
        speed={1}
        style={styles.lottie}
        resizeMode="cover"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000ff', // Match your Lottie background
    justifyContent: 'center',
    alignItems: 'center',
  },
  lottie: {
    // Making it responsive to 80% of the screen width
    width: width * 0.8,
    height: width * 0.8,
    backgroundColor: 'transparent',
  },
});

export default SplashScreen;
