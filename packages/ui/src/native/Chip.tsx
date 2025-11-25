import { Text, TouchableOpacity, StyleSheet, type TouchableOpacityProps } from 'react-native';
import { questitTheme } from '../theme/tokens';

type ChipVariant = 'default' | 'outline';

interface ChipProps extends TouchableOpacityProps {
  label: string;
  variant?: ChipVariant;
}

export function Chip({ label, variant = 'default', style, ...rest }: ChipProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      style={[
        styles.base,
        variant === 'outline' ? styles.outline : styles.filled,
        style
      ]}
      {...rest}
    >
      <Text
        style={[
          styles.label,
          variant === 'outline' ? styles.labelOutline : styles.labelFilled
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: questitTheme.radii.full,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1
  },
  filled: {
    backgroundColor: '#e0f2fe',
    borderColor: '#bae6fd'
  },
  outline: {
    backgroundColor: 'transparent',
    borderColor: questitTheme.colors.border
  },
  label: {
    fontSize: 13,
    fontWeight: '600'
  },
  labelFilled: {
    color: questitTheme.colors.primary
  },
  labelOutline: {
    color: questitTheme.colors.muted
  }
});
