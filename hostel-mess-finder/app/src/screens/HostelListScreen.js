import React, { useState } from 'react';
import { View, Text, TextInput, FlatList, ScrollView, StyleSheet } from 'react-native';
import Card from '../components/Card';
import Chip from '../components/Chip';
import { colors } from '../theme';

const FILTERS = ['All', 'Boys', 'Girls', 'Vacant', 'Roommate', 'Under ₹5000'];

// Decides if one hostel passes the selected filter
function passesFilter(h, filter) {
  if (filter === 'Boys') return h.type === 'Boys';
  if (filter === 'Girls') return h.type === 'Girls';
  if (filter === 'Vacant') return h.vacantBeds > 0;
  if (filter === 'Roommate') return h.rooms.length > 0;
  if (filter === 'Under ₹5000') return h.rent < 5000;
  return true; // "All"
}

export default function HostelListScreen({ hostels, onOpen }) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');

  const shown = hostels.filter(
    (h) => passesFilter(h, filter) && h.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Find a Hostel</Text>
      <TextInput
        style={styles.search}
        placeholder="Search by name"
        value={search}
        onChangeText={setSearch}
      />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chips}>
        {FILTERS.map((f) => (
          <Chip key={f} label={f} selected={filter === f} onPress={() => setFilter(f)} />
        ))}
      </ScrollView>

      <FlatList
        data={shown}
        keyExtractor={(h) => h.id}
        contentContainerStyle={{ paddingBottom: 16 }}
        ListEmptyComponent={<Text style={styles.empty}>No hostels match this filter.</Text>}
        renderItem={({ item: h }) => (
          <Card
            title={h.name}
            subtitle={h.distanceKm + ' km from college'}
            price={'₹' + h.rent + ' / month'}
            photo={h.photo}
            badges={[
              h.vacantBeds === 0
                ? { text: 'Full', kind: 'amber' }
                : { text: h.vacantBeds + (h.vacantBeds === 1 ? ' bed vacant' : ' beds vacant'), kind: 'green' },
              h.rooms.length > 0
                ? { text: 'Roommate needed', kind: 'amber' }
                : { text: h.type + ' only', kind: 'green' },
            ]}
            onPress={() => onOpen(h)}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },
  heading: { fontSize: 24, fontWeight: '700', color: colors.text },
  search: {
    height: 48,
    marginTop: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#AEB7C0',
    borderRadius: 12,
    fontSize: 16,
  },
  chips: { flexGrow: 0, marginVertical: 12 },
  empty: { textAlign: 'center', color: colors.grey, marginTop: 40 },
});
