import React, { useState } from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { theme } from '@app/theme/index';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  /** Rendered inside the field before the input, e.g. a "+91" country code. */
  prefix?: string;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  size?: 'md' | 'lg';
}

/**
 * Rounded input with a top label. The border colour is the only thing that
 * changes across rest / focus / error, which keeps forms calm.
 */
const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  prefix,
  containerStyle,
  inputStyle,
  size = 'lg',
  onFocus,
  onBlur,
  editable = true,
  ...rest
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const borderColor = error
    ? theme.colors.state.error
    : isFocused
    ? theme.colors.borders.focus
    : theme.colors.borders.subtle;

  return (
    <View style={containerStyle}>
      {label ? (
        <Text style={[theme.text.label, styles.label]} numberOfLines={1}>
          {label}
        </Text>
      ) : null}

      <View
        style={[
          styles.field,
          size === 'lg' ? styles.fieldLg : styles.fieldMd,
          { borderColor, backgroundColor: editable ? theme.colors.neutral[50] : theme.colors.neutral[100] },
          isFocused && !error ? styles.focused : null,
        ]}
      >
        {leftIcon ? <View style={styles.adornment}>{leftIcon}</View> : null}
        {prefix ? <Text style={[theme.text.bodyLarge, styles.prefix]}>{prefix}</Text> : null}

        <TextInput
          style={[theme.text.bodyLarge, styles.input, inputStyle]}
          placeholderTextColor={theme.colors.text.tertiary}
          editable={editable}
          onFocus={(event) => {
            setIsFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setIsFocused(false);
            onBlur?.(event);
          }}
          {...rest}
        />

        {rightIcon ? <View style={styles.adornment}>{rightIcon}</View> : null}
      </View>

      {error || helperText ? (
        <Text
          style={[
            theme.text.caption,
            styles.helper,
            { color: error ? theme.colors.state.error : theme.colors.text.secondary },
          ]}
        >
          {error ?? helperText}
        </Text>
      ) : null}
    </View>
  );
};

export default Input;

const styles = StyleSheet.create({
  label: {
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.sm,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: theme.radius.control,
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  fieldMd: { height: 48 },
  fieldLg: { height: 56 },
  focused: {
    backgroundColor: theme.colors.surface.base,
  },
  input: {
    flex: 1,
    height: '100%',
    color: theme.colors.text.primary,
    padding: 0,
  },
  prefix: {
    color: theme.colors.text.primary,
  },
  adornment: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  helper: {
    marginTop: 6,
    marginLeft: 4,
  },
});
