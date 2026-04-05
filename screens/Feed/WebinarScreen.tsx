import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Text,
  ScrollView,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { supabase } from '../../utils/supabaseClient';
import ScreenWrapper from '../../utils/ScreenWrapper';
import {
  scale as s,
  verticalScale as vs,
  moderateScale as ms,
} from 'react-native-size-matters';
import LinearGradient from 'react-native-linear-gradient';

export default function WebinarScreen({ navigation }: any) {
  const [url, setUrl] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);

  // 1️⃣ Fetch Dynamic Data from Database (ID 12)
  const fetchWebinarData = async () => {
    try {
      const { data, error } = await supabase
        .from('fake_traders')
        .select('name, designation, image_url') // name=Title, designation=Desc, image_url=URL
        .eq('id', 12)
        .single();

      if (data) {
        // Set URL from image_url column
        if (data.image_url && data.image_url.startsWith('http')) {
          setUrl(data.image_url);
        } else {
          setUrl('https://us06web.zoom.us/j/83036402617'); // Fallback
        }

        // Set Text Data
        setTitle(data.name || 'Live Webinar');
        setDescription(
          data.designation || 'Join us for live trading insights.',
        );
      }
    } catch (err) {
      console.log('Error fetching webinar data:', err);
      setUrl('https://us06web.zoom.us/j/83036402617');
    }
  };

  useEffect(() => {
    fetchWebinarData();
  }, []);

  return (
    <ScreenWrapper>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      {/* 🌑 Background: Deep Green/Black Gradient matching theme */}
      <LinearGradient
        colors={['#000000', '#0a1a10', '#082415']}
        style={{ flex: 1 }}
      >
        <SafeAreaView style={styles.container}>
          {/* WebView Container (Meeting Area) */}
          <View style={styles.webViewContainer}>
            {url ? (
              <WebView
                source={{ uri: url }}
                startInLoadingState={true}
                renderLoading={() => (
                  <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" color="#00ff40" />
                    <Text style={styles.loadingText}>
                      Connecting to Zoom...
                    </Text>
                  </View>
                )}
                style={{ flex: 1, backgroundColor: '#000' }}
                allowsInlineMediaPlayback={true}
                mediaPlaybackRequiresUserAction={false}
                javaScriptEnabled={true}
                domStorageEnabled={true}
              />
            ) : (
              <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#00ff40" />
              </View>
            )}
          </View>

          {/* 2️⃣ Info Section (Title & Description) */}
          <View style={styles.infoContainer}>
            <Text style={styles.infoTitle}>{title}</Text>
            <ScrollView style={styles.descScroll}>
              <Text style={styles.infoDesc}>{description}</Text>
            </ScrollView>
          </View>
        </SafeAreaView>
      </LinearGradient>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  /* WebView Area */
  webViewContainer: {
    height: vs(350), // Fixed height for video area
    width: '95%',
    backgroundColor: '#000',
    marginTop: vs(30),
    borderRadius: ms(20),
    overflow: 'hidden',
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 64, 0.2)', // Neon Green Border
  },
  loaderContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  loadingText: {
    color: '#00ff40', // Neon Green Text
    marginTop: vs(15),
    fontSize: ms(14),
  },

  /* Info Section Below Video */
  infoContainer: {
    flex: 1,
    paddingHorizontal: s(20),
    paddingTop: vs(20),
  },
  infoTitle: {
    fontSize: ms(22),
    fontWeight: 'bold',
    color: '#00ff40', // Neon Green Title
    marginBottom: vs(10),
    letterSpacing: 0.5,
  },
  descScroll: {
    flex: 1,
  },
  infoDesc: {
    fontSize: ms(14),
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: ms(20),
    paddingBottom: vs(20),
  },
});
