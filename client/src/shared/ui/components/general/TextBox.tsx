import React from 'react';
import { Text, TextProps } from 'react-native';

import { FONTS } from '@/src/shared/constants/fonts';
import { typography, type TypographyToken } from '@ui/foundation/typography';

const fontFamilyMap: Record<TypographyToken, string> = {
  heading1: FONTS.BMJUA,
  heading2: FONTS.BMJUA,
  heading3: FONTS.BMJUA,
  body1: FONTS.PRETENDARD_REGULAR,
  body1Bold: FONTS.PRETENDARD_BOLD,
  body2: FONTS.PRETENDARD_REGULAR,
  body2Bold: FONTS.PRETENDARD_BOLD,
  caption: FONTS.ROBOTO_REGULAR,
  captionBold: FONTS.ROBOTO_BOLD,
  label: FONTS.PRETENDARD_REGULAR,
};

interface TextBoxProps extends TextProps {
  variant?: TypographyToken;
  color?: string;
}

const TextBox: React.FC<TextBoxProps> = ({
  variant = 'body1',
  color,
  style,
  children,
  ...props
}) => {
  const dynamicStyles = React.useMemo(
    () => ({
      ...typography[variant],
      fontFamily: fontFamilyMap[variant],
      ...(color && { color }),
    }),
    [variant, color],
  );

  return (
    <Text style={[dynamicStyles, style]} {...props}>
      {children}
    </Text>
  );
};

export default TextBox;
