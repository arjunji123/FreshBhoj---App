import React from 'react';
import { StyleProp, Text as RNText, TextProps as RNTextProps, TextStyle } from 'react-native';
import { theme } from '@app/theme/index';
import type { TextStyleName } from '@app/theme/typography';

type ColorToken =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'inverse'
  | 'brand'
  | 'accent'
  | 'danger'
  | 'disabled';

export interface TextProps extends RNTextProps {
  /** A named style from the type scale. Defaults to `body`. */
  variant?: TextStyleName;
  /** A semantic text colour. Defaults to `primary`. */
  color?: ColorToken;
  align?: TextStyle['textAlign'];
  style?: StyleProp<TextStyle>;
}

/**
 * The only Text component new screens should use.
 *
 * Taking the variant and colour as tokens rather than raw styles is what keeps
 * typography consistent — a screen can't quietly invent a 15px semibold.
 */
const Text: React.FC<TextProps> = ({
  variant = 'body',
  color = 'primary',
  align,
  style,
  children,
  ...rest
}) => (
  <RNText
    style={[
      theme.text[variant],
      { color: theme.colors.text[color] },
      align ? { textAlign: align } : null,
      style,
    ]}
    {...rest}
  >
    {children}
  </RNText>
);

export default Text;
