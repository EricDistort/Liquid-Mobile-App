import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Image,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { supabase } from '../../utils/supabaseClient';
import ScreenWrapper from '../../utils/ScreenWrapper';
import {
  scale as s,
  verticalScale as vs,
  moderateScale as ms,
} from 'react-native-size-matters';

export default function LeaderboardScreen() {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from('fake_leaderboard')
        .select('name, image, amount')
        .order('amount', { ascending: false });

      if (error) throw error;
      setLeaderboard(data || []);
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <Image
        source={require('../homeMedia/leaderboard.png')}
        style={styles.bannerImage}
        resizeMode="contain"
      />
      <LinearGradient
        colors={['transparent', 'transparent']}
        style={styles.bannerGradient}
      />
    </View>
  );

  const renderItem = ({ item, index }: { item: any; index: number }) => {
    const rankColor = '#00ff40';
    const cardBackground = ['#05120a', '#000000'];

    return (
      <View style={styles.cardContainer}>
        <LinearGradient
          colors={cardBackground}
          style={styles.cardGradient}
        >
          <View style={styles.cardContent}>
            <View style={styles.rankBox}>
              <Text style={[styles.rankText, { color: rankColor }]}>
                #{index + 1}
              </Text>
            </View>

            <View style={styles.avatarContainer}>
              {item.image ? (
                <Image source={{ uri: item.image }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarPlaceholderText}>
                    {item.name?.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.textColumn}>
              <Text style={styles.username} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={styles.amount}>
                ${Number(item.amount).toLocaleString()}
              </Text>
            </View>

            <View style={styles.arrowColumn}>
              <Text style={styles.upArrow}>▲</Text>
            </View>
          </View>
        </LinearGradient>
      </View>
    );
  };

  return (
    <ScreenWrapper>
      <LinearGradient colors={['#000000', '#0a1a10']} style={styles.background}>
        <SafeAreaView style={styles.safeArea}>
          <StatusBar barStyle="light-content" backgroundColor="#000" />

          {renderHeader()}

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#00ff40" />
            </View>
          ) : (
            <View style={styles.fixedListWrapper}>
              <FlatList
                data={leaderboard}
                keyExtractor={(_, index) => index.toString()}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
              />
            </View>
          )}
        </SafeAreaView>
      </LinearGradient>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  safeArea: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  fixedListWrapper: {
    flex: 1,
    width: '100%',
    paddingHorizontal: s(16),
  },

  headerContainer: {
    marginBottom: vs(16),
    marginTop: vs(40),
  },
  bannerImage: {
    width: '100%',
    height: vs(160),
  },
  bannerGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: vs(80),
    backgroundColor: 'transparent',
  },
  headerTextContainer: {
    position: 'absolute',
    bottom: vs(10),
    left: s(16),
  },
  headerTitle: {
    fontSize: ms(28),
    fontWeight: '900',
    color: '#00ff40',
    letterSpacing: 2,
  },
  headerSubtitle: {
    fontSize: ms(10),
    color: '#fff',
    marginTop: vs(2),
    marginBottom: vs(8),
    letterSpacing: 1,
    fontWeight: '700',
  },
  headerLine: {
    height: vs(3),
    width: s(60),
    borderRadius: ms(2),
  },

  listContent: {
    paddingBottom: vs(100),
  },

  cardContainer: {
    marginTop: vs(15),
    borderRadius: ms(20),
    shadowColor: '#00ff40',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'visible',
  },
  cardGradient: {
    borderRadius: ms(20),
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 64, 0.1)',
    overflow: 'visible',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: vs(7),
    paddingHorizontal: s(16),
  },

  rankBox: {
    width: s(40),
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  rankText: {
    fontSize: ms(20),
    fontWeight: '900',
  },

  avatarContainer: {
    marginRight: s(12),
    marginTop: -vs(25),
    elevation: 5,
    zIndex: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  avatar: {
    width: ms(56),
    height: ms(56),
    borderRadius: ms(28),
   
    backgroundColor: 'transparent',
    resizeMode: 'contain',
  },
  avatarPlaceholder: {
    width: ms(56),
    height: ms(56),
    borderRadius: ms(28),
    backgroundColor: '#03310b',
    borderWidth: 2,
    borderColor: '#00ff40',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarPlaceholderText: {
    color: '#00ff40',
    fontSize: ms(20),
    fontWeight: 'bold',
  },

  textColumn: {
    flex: 1,
    justifyContent: 'center',
  },
  username: {
    fontSize: ms(15),
    fontWeight: '800',
    color: '#d6ffdc',
    marginBottom: vs(2),
  },
  amount: {
    fontSize: ms(14),
    fontWeight: 'bold',
    color: '#00ff40',
  },

  arrowColumn: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingLeft: s(10),
  },
  upArrow: {
    fontSize: ms(18),
    color: '#00ff40',
  },
});