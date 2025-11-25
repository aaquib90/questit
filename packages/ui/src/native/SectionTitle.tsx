import { Text, StyleSheet, type TextProps } from 'react-native';
import { questitTheme } from '../theme/tokens';

export function SectionTitle({ style, ...rest }: TextProps) {
  return <Text style={[styles.title, style]} {...rest} />;
}

const styles = StyleSheet.create({
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: questitTheme.colors.foreground
  }
});
