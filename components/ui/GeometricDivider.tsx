// Powered by OnSpace.AI
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors } from '@/constants/theme';

export default function GeometricDivider() {
  return (
    <View style={styles.container}>
      <View style={styles.line} />
      <View style={styles.diamond} />
      <View style={styles.line} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
    paddingHorizontal: 16,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.surfaceBorder,
  },
  diamond: {
    width: 8,
    height: 8,
    backgroundColor: Colors.primary,
    transform: [{ rotate: '45deg' }],
    marginHorizontal: 10,
  },
});
