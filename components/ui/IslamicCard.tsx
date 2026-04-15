// Powered by OnSpace.AI
import React from 'react';
import { View, StyleSheet, ViewStyle, Pressable } from 'react-native';
import { Colors, Radius, Shadow, Spacing } from '@/constants/theme';

interface IslamicCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  elevated?: boolean;
  goldBorder?: boolean;
}

export default function IslamicCard({ children, style, onPress, elevated, goldBorder }: IslamicCardProps) {
  const content = (
    <View style={[
      styles.card,
      elevated && styles.elevated,
      goldBorder && styles.goldBorder,
      style,
    ]}>
      {children}
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.985 : 1 }] }]}
      >
        {content}
      </Pressable>
    );
  }
  return content;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    ...Shadow.card,
  },
  elevated: {
    backgroundColor: Colors.surfaceElevated,
    ...Shadow.glow,
  },
  goldBorder: {
    borderColor: Colors.primary,
    borderWidth: 1,
  },
});
