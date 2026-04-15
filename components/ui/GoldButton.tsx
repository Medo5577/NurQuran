// Powered by OnSpace.AI
import React from 'react';
import { Pressable, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Spacing, Radius, Typography } from '@/constants/theme';

interface GoldButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'filled' | 'outlined' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
  disabled?: boolean;
}

export default function GoldButton({ label, onPress, variant = 'filled', size = 'md', style, disabled }: GoldButtonProps) {
  const sizeStyle = {
    sm: { paddingVertical: 6, paddingHorizontal: 14 },
    md: { paddingVertical: 12, paddingHorizontal: 24 },
    lg: { paddingVertical: 16, paddingHorizontal: 32 },
  }[size];

  const fontSize = size === 'sm' ? Typography.caption : size === 'lg' ? Typography.bodyLG : Typography.body;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        sizeStyle,
        variant === 'filled' && styles.filled,
        variant === 'outlined' && styles.outlined,
        variant === 'ghost' && styles.ghost,
        pressed && { opacity: 0.75, transform: [{ scale: 0.97 }] },
        disabled && styles.disabled,
        style,
      ]}
    >
      <Text style={[
        styles.label,
        { fontSize },
        variant === 'outlined' && styles.labelOutlined,
        variant === 'ghost' && styles.labelGhost,
      ]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filled: {
    backgroundColor: Colors.primary,
  },
  outlined: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  ghost: {
    backgroundColor: Colors.overlayLight,
  },
  disabled: {
    opacity: 0.4,
  },
  label: {
    color: Colors.background,
    fontWeight: Typography.semiBold,
    letterSpacing: 0.3,
  },
  labelOutlined: {
    color: Colors.primary,
  },
  labelGhost: {
    color: Colors.primary,
  },
});
