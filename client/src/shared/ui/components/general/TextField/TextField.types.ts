import type { TextInputProps } from 'react-native';

export type TextFieldProps = TextInputProps & {
  title?: string;
  description?: string;
  errorMessage?: string;
  clearButton?: boolean;
  onClear?: () => void;
  fullWidth?: boolean;
};

export type SplitTextFieldProps = {
  length: number;
  value: string;
  onChange: (value: string) => void;
  errorMessage?: string;
};

export type TextAreaProps = TextInputProps & {
  title?: string;
  description?: string;
  errorMessage?: string;
  maxLength?: number;
};
