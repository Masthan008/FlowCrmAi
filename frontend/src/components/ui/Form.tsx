import React from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { Input } from './Input';
import { Select } from './Select';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  name: string;
  label?: string;
  icon?: React.ReactNode;
}

export const FormInput: React.FC<FormInputProps> = ({ name, label, icon, ...props }) => {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <Input
          label={label}
          icon={icon}
          error={error?.message}
          {...field}
          {...props}
        />
      )}
    />
  );
};

interface SelectOption {
  value: string;
  label: string;
}

interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  name: string;
  label?: string;
  options: SelectOption[];
}

export const FormSelect: React.FC<FormSelectProps> = ({ name, label, options, ...props }) => {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <Select
          label={label}
          options={options}
          error={error?.message}
          {...field}
          {...props}
        />
      )}
    />
  );
};
