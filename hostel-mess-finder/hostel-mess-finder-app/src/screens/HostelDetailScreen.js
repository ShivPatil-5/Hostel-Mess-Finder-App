import React from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, Linking, StyleSheet } from 'react-native';
import { colors } from '../theme';
import { photos } from '../images';

// Small box used for the three numbers at the top
function Stat({ label, value }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

export default function HostelDetailScreen({ hostel: h, onBack }) {
  // Opens the phone's dialer with the owner's number
  const callOwner = () => Linking.openURL('tel:' + h.phone);

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onBack} style={styles.back}>
        <Text style={styles.backText}>‹ Back</Text>
      </TouchableOpacity>

      <ScrollView>
        {photos[h.photo] ? (
          <Image source={photos[h.photo]} style={styles.photo} />
        ) : (
          <View style={[styles.photo, styles.placeholder]}>
            <Text style={{ color: colors.grey }}>Hostel photo</Text>
          </View>
        )}

        <View style={styles.body}>
          <Text style={styles.name}>{h.name}</Text>
          <Text style={styles.sub}>{h.distanceKm} km from college · {h.type}</Text>

          <View style={styles.statRow}>
            <Stat label="Rent" value={'₹' + h.rent} />
            <Stat label="Vacant beds" value={h.vacantBeds + ' of ' + h.totalBeds} />
            <Stat label="Nearest mess" value={h.nearestMessM + ' m'} />
          </View>
          <Text style={styles.messName}>Nearest mess: {h.nearestMessName}</Text>

          <Text style={styles.section}>Rules</Text>
          {h.rules.map((r) => (
            <Text key={r} style={styles.rule}>• {r}</Text>
          ))}

          <Text style={styles.section}>Roommate needed</Text>
          {h.rooms.length === 0 ? (
            <Text style={styles.rule}>No rooms looking for a roommate right now.</Text>
          ) : (
            h.rooms.map((r) => (
              <View key={r.room} style={styles.roomRow}>
                <Text style={styles.roomText}>Room {r.room} · {r.sharing}-sharing</Text>
                <Text style={styles.roomBeds}>{r.beds} {r.beds === 1 ? 'bed' : 'beds'}</Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.callButton} onPress={callOwner}>
          <Text style={styles.callText}>Call Owner</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  back: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 16 },
  backText: { fontSize: 16, color: colors.primary, fontWeight: '700' },
  photo: { width: '100%', height: 200 },
  placeholder: { backgroundColor: colors.light, alignItems: 'center', justifyContent: 'center' },
  body: { padding: 16 },
  name: { fontSize: 22, fontWeight: '700', color: colors.text },
  sub: { fontSize: 14, color: colors.grey, marginTop: 2 },
  statRow: { flexDirection: 'row', marginTop: 14 },
  stat: { flex: 1, padding: 10, borderRadius: 10, backgroundColor: colors.tint, marginRight: 8 },
  statLabel: { fontSize: 12, color: colors.tintText },
  statValue: { fontSize: 15, fontWeight: '700', color: colors.text, marginTop: 2 },
  messName: { fontSize: 14, color: colors.grey, marginTop: 8 },
  section: { fontSize: 16, fontWeight: '700', color: colors.text, marginTop: 18, marginBottom: 6 },
  rule: { fontSize: 14, color: colors.grey, lineHeight: 22 },
  roomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
  },
  roomText: { fontSize: 14, color: colors.text },
  roomBeds: { fontSize: 14, fontWeight: '700', color: colors.primary },
  footer: { padding: 12, borderTopWidth: 1, borderTopColor: colors.border },
  callButton: {
    height: 52,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  callText: { color: colors.white, fontSize: 16, fontWeight: '700' },
});
