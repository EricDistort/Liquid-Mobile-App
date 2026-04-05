import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Dimensions,
} from 'react-native';
import LottieView from 'lottie-react-native';
import LinearGradient from 'react-native-linear-gradient';
import { supabase } from '../../utils/supabaseClient';
import { useUser } from '../../utils/UserContext';
import ScreenWrapper from '../../utils/ScreenWrapper';
import {
  scale as s,
  verticalScale as vs,
  moderateScale as ms,
} from 'react-native-size-matters';

// Import Lottie animations
import pendingAnim from './StoreMedia/Confirmed.json';
import packedAnim from './StoreMedia/Confirmed.json';
import outForDeliveryAnim from './StoreMedia/Confirmed.json';
import deliveredAnim from './StoreMedia/Confirmed.json';

const { width } = Dimensions.get('window');

export default function OrdersScreen() {
  const { user } = useUser();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // 🎨 NEON GREEN GRADIENT
  const THEME_GRADIENT = ['#03310b', '#00d435'];

  const fetchOrders = async () => {
    if (!user?.id) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('purchases')
      .select(
        `
        id,
        user:users(username),
        mobile,
        location,
        status,
        created_at,
        product:products(name, price)
      `,
      )
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (!error) setOrders(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, [user?.id]);

  const getLottieByStatus = (status: string) => {
    switch (status) {
      case 'pending':
        return pendingAnim;
      case 'packed':
        return packedAnim;
      case 'out for delivery':
        return outForDeliveryAnim;
      case 'delivered':
        return deliveredAnim;
      default:
        return pendingAnim;
    }
  };

  // Helper to determine progress bar height/color
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pending':
        return { color: '#ffb300', percent: '25%', label: 'Order Placed' };
      case 'packed':
        return { color: '#FFD700', percent: '50%', label: 'Packed' };
      case 'out for delivery':
        return { color: '#FFA500', percent: '75%', label: 'On The Way' };
      case 'delivered':
        return { color: '#00ff40', percent: '100%', label: 'Delivered' }; // Neon Green for delivered
      default:
        return { color: '#666', percent: '0%', label: 'Unknown' };
    }
  };

  const renderItem = ({ item }: any) => {
    const config = getStatusConfig(item.status);
    const formattedDate = new Date(item.created_at).toLocaleDateString(
      undefined,
      {
        month: 'short',
        day: 'numeric',
      },
    );

    return (
      <View style={styles.cardWrapper}>
        {/* Glow Effect behind card updated to Green */}
        <LinearGradient
          colors={['rgba(0, 255, 64, 0.2)', 'transparent']}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.cardGlow}
        />

        <View style={styles.card}>
          {/* Left Side: Timeline Strip */}
          <View style={styles.timelineContainer}>
            <View style={styles.timelineTrack} />
            <LinearGradient
              colors={[config.color, '#03310b']} // Blending to Dark Green
              style={[styles.timelineFill, { height: config.percent }]}
            />
          </View>

          {/* Right Side: Content */}
          <View style={styles.contentContainer}>
            {/* Header: Date & Status */}
            <View style={styles.headerRow}>
              <View style={[styles.statusPill, { borderColor: config.color }]}>
                <View
                  style={[styles.statusDot, { backgroundColor: config.color }]}
                />
                <Text style={[styles.statusText, { color: config.color }]}>
                  {config.label.toUpperCase()}
                </Text>
              </View>
              <Text style={styles.dateText}>{formattedDate}</Text>
            </View>

            {/* Animation Stage */}
            <View style={styles.animationStage}>
              {/* Spotlight Gradient */}
              <LinearGradient
                colors={[`${config.color}20`, 'transparent']}
                style={styles.spotlight}
              />
              <LottieView
                source={getLottieByStatus(item.status)}
                autoPlay
                loop
                style={styles.lottie}
                resizeMode="contain"
              />
            </View>

            {/* Product Details */}
            <View style={styles.detailsBlock}>
              <View style={styles.productRow}>
                <Text style={styles.productName} numberOfLines={1}>
                  {item.product?.name}
                </Text>
                <Text style={styles.price}>${item.product?.price}</Text>
              </View>

              {/* Divider */}
              <View style={styles.divider} />

              {/* Delivery Info */}
              <View style={styles.infoRow}>
                <View style={styles.infoBox}>
                  <Text style={styles.label}>Location</Text>
                  <Text style={styles.value} numberOfLines={1}>
                    {item.location}
                  </Text>
                </View>
                <View style={[styles.infoBox, { alignItems: 'flex-end' }]}>
                  <Text style={styles.label}>Contact</Text>
                  <Text style={styles.value}>{item.mobile}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <ScreenWrapper>
      <StatusBar barStyle="light-content" />
      {/* 🌑 Background: Deep Green/Black Gradient */}
      <LinearGradient
        colors={['#000000', '#0a1a10', '#082415']}
        style={{ flex: 1 }}
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.container}>
            {/* Header */}
            <View style={styles.screenHeader}>
              <Text style={styles.title}>Track Orders</Text>
              <LinearGradient
                colors={THEME_GRADIENT}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.headerLine}
              />
            </View>

            {loading ? (
              <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#00ff40" />
              </View>
            ) : orders.length === 0 ? (
              <View style={styles.centerContainer}>
                <Text style={styles.noOrdersText}>No active orders found</Text>
              </View>
            ) : (
              <FlatList
                data={orders}
                renderItem={renderItem}
                keyExtractor={item => item.id.toString()}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
              />
            )}
          </View>
        </SafeAreaView>
      </LinearGradient>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: {
    flex: 1,
    paddingHorizontal: s(16),
  },

  /* Header */
  screenHeader: {
    marginTop: vs(20),
    marginBottom: vs(20),
  },
  title: {
    fontSize: ms(28),
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 0.5,
    marginBottom: vs(5),
  },
  headerLine: {
    width: s(60),
    height: vs(4),
    borderRadius: ms(2),
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noOrdersText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: ms(16),
  },

  /* Card Wrapper */
  listContent: {
    paddingBottom: vs(50),
  },
  cardWrapper: {
    marginBottom: vs(25),
    position: 'relative',
  },
  cardGlow: {
    position: 'absolute',
    top: 0,
    left: s(20),
    right: s(20),
    height: vs(100),
    borderRadius: ms(40),
    opacity: 0.8,
  },
  card: {
    backgroundColor: '#0a0a0a', // Deep Black to match store
    borderRadius: ms(24),
    flexDirection: 'row',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 64, 0.1)', // Green border
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
  },

  /* Timeline Strip (Left) */
  timelineContainer: {
    width: s(6),
    backgroundColor: '#1a1a1a',
    marginVertical: vs(20),
    marginLeft: s(15),
    borderRadius: ms(3),
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  timelineTrack: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  timelineFill: {
    width: '100%',
    borderRadius: ms(3),
  },

  /* Content (Right) */
  contentContainer: {
    flex: 1,
    padding: s(15),
    paddingLeft: s(20),
  },

  /* Header Row */
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: vs(10),
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    paddingHorizontal: s(10),
    paddingVertical: vs(4),
    borderRadius: ms(20),
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  statusDot: {
    width: s(6),
    height: s(6),
    borderRadius: s(3),
    marginRight: s(6),
  },
  statusText: {
    fontSize: ms(10),
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  dateText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: ms(12),
    fontWeight: '600',
  },

  /* Animation Stage */
  animationStage: {
    height: vs(140),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: vs(10),
    position: 'relative',
  },
  spotlight: {
    position: 'absolute',
    width: s(120),
    height: s(120),
    borderRadius: s(60),
    top: vs(10),
  },
  lottie: {
    width: s(180),
    height: s(180),
  },

  /* Details Block */
  detailsBlock: {
    backgroundColor: 'rgba(0, 255, 64, 0.03)', // Subtle green tint
    borderRadius: ms(16),
    padding: s(12),
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 64, 0.05)',
  },
  productRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: vs(10),
  },
  productName: {
    color: '#fff',
    fontSize: ms(16),
    fontWeight: '700',
    flex: 1,
    marginRight: s(10),
  },
  price: {
    color: '#00ff40', // Neon Green
    fontSize: ms(18),
    fontWeight: '800',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginBottom: vs(10),
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoBox: {
    flex: 1,
  },
  label: {
    fontSize: ms(10),
    color: 'rgba(255,255,255,0.4)',
    textTransform: 'uppercase',
    marginBottom: vs(2),
  },
  value: {
    fontSize: ms(12),
    color: '#fff',
    fontWeight: '500',
  },
});
