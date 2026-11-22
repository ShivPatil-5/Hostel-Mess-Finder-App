import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../theme';
import { photos } from '../images';

// One card used for both hostels and messes.
// badges = [{ text: 'Veg', kind: 'green' }, { text: 'Closed', kind: 'amber' }]
export default function Card({ title, subtitle, price, badges, photo, onPress }) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.7}
    >
      {photos[photo] ? (
        <Image source={photos[photo]} style={styles.photo} />
      ) : (
        <View style={[styles.photo, styles.placeholder]}>
          <Text style={styles.placeholderText}>Photo</Text>
        </View>
      )}

      <View style={styles.info}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
        <Text style={styles.price}>{price}</Text>
        <View style={styles.badgeRow}>
          {badges.map((b) => (
            <View
              key={b.text}
              style={[styles.badge, b.kind === 'amber' ? styles.amber : styles.green]}
            >
              <Text style={[styles.badgeText, b.kind === 'amber' ? styles.amberText : styles.greenText]}>
                {b.text}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.white,
  },
  photo: { width: 88, height: 88, borderRadius: 8 },
  placeholder: { backgroundColor: colors.light, alignItems: 'center', justifyContent: 'center' },
  placeholderText: { fontSize: 12, color: colors.grey },
  info: { flex: 1, marginLeft: 12 },
  title: { fontSize: 16, fontWeight: '700', color: colors.text },
  subtitle: { fontSize: 14, color: colors.grey, marginTop: 2 },
  price: { fontSize: 16, fontWeight: '700', color: colors.primary, marginTop: 4 },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 6 },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, marginRight: 6, marginBottom: 4 },
  green: { backgroundColor: colors.tint },
  amber: { backgroundColor: colors.amber },
  badgeText: { fontSize: 12 },
  greenText: { color: colors.tintText },
  amberText: { color: colors.amberText },
});
