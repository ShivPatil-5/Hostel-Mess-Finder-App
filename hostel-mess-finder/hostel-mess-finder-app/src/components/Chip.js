import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors } from '../theme';

// A small rounded filter button.  selected = true makes it teal.
export default function Chip({ label, selected, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.chip, selected && styles.chipSelected]}
      onPress={onPress}
    >
      <Text style={[styles.text, selected && styles.textSelected]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    minHeight: 44,
    paddingHorizontal: 16,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#AEB7C0',
    backgroundColor: colors.white,
    justifyContent: 'center',
    marginRight: 8,
  },
  chipSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  text: { fontSize: 14, color: colors.text },
  textSelected: { color: colors.white, fontWeight: '700' },
});
