import { View, StyleSheet, type ViewProps } from 'react-native';
import { questitTheme } from '../theme/tokens';

type SurfaceVariant = 'plain' | 'muted';

export interface SurfaceProps extends ViewProps {
  variant?: SurfaceVariant;
  elevated?: boolean;
}

export function Surface({ variant = 'plain', elevated = false, style, ...rest }: SurfaceProps) {
  return (
    <View
      style={[
        styles.base,
        variant === 'muted' ? styles.muted : styles.plain,
        elevated && styles.elevated,
        style
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: questitTheme.radii.lg,
    borderWidth: 1,
    borderColor: questitTheme.colors.border,
    padding: questitTheme.spacing.md,
    backgroundColor: questitTheme.colors.card
  },
  plain: {
    backgroundColor: questitTheme.colors.card
  },
  muted: {
    backgroundColor: '#0b1120',
    borderColor: '#1e293b'
  },
  elevated: {
    ...questitTheme.shadow.card
  }
});
