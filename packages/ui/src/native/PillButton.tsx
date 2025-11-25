import { Text, TouchableOpacity, StyleSheet, type TouchableOpacityProps } from 'react-native';
import { questitTheme } from '../theme/tokens';

type PillButtonVariant = 'primary' | 'ghost' | 'outline';

export interface PillButtonProps extends TouchableOpacityProps {
  variant?: PillButtonVariant;
  label: string;
}

export function PillButton({ variant = 'primary', label, style, disabled, ...rest }: PillButtonProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={[
        styles.base,
        variant === 'primary' && styles.primary,
        variant === 'ghost' && styles.ghost,
        variant === 'outline' && styles.outline,
        disabled && styles.disabled,
        style
      ]}
      disabled={disabled}
      {...rest}
    >
      <Text
        style={[
          styles.label,
          variant === 'primary' ? styles.labelPrimary : styles.labelGhost,
          disabled && styles.labelDisabled
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
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center'
  },
  primary: {
    backgroundColor: questitTheme.colors.primary
  },
  ghost: {
    backgroundColor: 'transparent'
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: questitTheme.colors.border
  },
  disabled: {
    opacity: 0.5
  },
  label: {
    fontSize: 16,
    fontWeight: '600'
  },
  labelPrimary: {
    color: questitTheme.colors.primaryForeground
  },
  labelGhost: {
    color: questitTheme.colors.foreground
  },
  labelDisabled: {
    color: questitTheme.colors.muted
  }
});
