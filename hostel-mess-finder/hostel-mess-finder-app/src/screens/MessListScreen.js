import React, { useState } from 'react';
import { View, Text, FlatList, ScrollView, StyleSheet } from 'react-native';
import Card from '../components/Card';
import Chip from '../components/Chip';
import { colors } from '../theme';
import { isOpenNow, mealsText } from '../utils';

const FILTERS = ['All', 'Veg', 'Non-veg', 'Open now', 'Within 500 m'];

function passesFilter(m, filter) {
  if (filter === 'Veg') return m.type !== 'Non-veg';      // Veg or Both
  if (filter === 'Non-veg') return m.type !== 'Veg';      // Non-veg or Both
  if (filter === 'Open now') return isOpenNow(m);
  if (filter === 'Within 500 m') return m.distanceM <= 500;
  return true;
}

export default function MessListScreen({ messes }) {
  const [filter, setFilter] = useState('All');
  const shown = messes.filter((m) => passesFilter(m, filter));

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Messes Nearby</Text>

      <View style={styles.chipsBox}>
       <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chips}>
         {FILTERS.map((f) => (
           <Chip key={f} label={f} selected={filter === f} onPress={() => setFilter(f)} />
         ))}
       </ScrollView>
      </View>

      <FlatList
        data={shown}
        keyExtractor={(m) => m.id}
        contentContainerStyle={{ paddingBottom: 16 }}
        ListEmptyComponent={<Text style={styles.empty}>No messes match this filter.</Text>}
        renderItem={({ item: m }) => (
          <Card
            title={m.name}
            subtitle={m.distanceM + ' m from college · ' + mealsText(m)}
            price={'₹' + m.monthlyPrice + ' / month'}
            photo={null}
            badges={[
              { text: m.type, kind: 'green' },
              isOpenNow(m) ? { text: 'Open now', kind: 'green' } : { text: 'Closed', kind: 'amber' },
            ]}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },
  heading: { fontSize: 24, fontWeight: '700', color: colors.text },
  chipsBox: { height: 48, marginVertical: 12 },
  chipsContent: {alignltems: 'center'},
  empty: { textAlign: 'center', color: colors.grey, marginTop: 40 },
});