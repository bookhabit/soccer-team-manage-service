export type SelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

export type SelectProps = {
  label?: string;
  options: SelectOption[];
  placeholder?: string;
  errorMessage?: string;
  fullWidth?: boolean;
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
};
