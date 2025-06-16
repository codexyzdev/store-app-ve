"use client";

import React, { createContext, useContext, ReactNode } from "react";
import {
  Controller,
  FieldPath,
  FieldValues,
  ControllerProps,
} from "react-hook-form";

const FormFieldContext = createContext<{ name?: string }>({});

interface FormProps {
  children: ReactNode;
  onSubmit?: (e: React.FormEvent) => void;
  className?: string;
}

const Form: React.FC<FormProps> = ({ children, onSubmit, className }) => {
  return (
    <form onSubmit={onSubmit} className={className}>
      {children}
    </form>
  );
};

interface FormFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> extends ControllerProps<TFieldValues, TName> {
  children: ReactNode;
}

const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>(
  props: FormFieldProps<TFieldValues, TName>
) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
};

interface FormItemProps {
  children: ReactNode;
  className?: string;
}

const FormItem: React.FC<FormItemProps> = ({ children, className }) => {
  return <div className={`space-y-2 ${className || ""}`}>{children}</div>;
};

interface FormLabelProps {
  children: ReactNode;
  htmlFor?: string;
  className?: string;
}

const FormLabel: React.FC<FormLabelProps> = ({
  children,
  htmlFor,
  className,
}) => {
  return (
    <label
      htmlFor={htmlFor}
      className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${
        className || ""
      }`}
    >
      {children}
    </label>
  );
};

interface FormControlProps {
  children: ReactNode;
}

const FormControl: React.FC<FormControlProps> = ({ children }) => {
  return <>{children}</>;
};

interface FormDescriptionProps {
  children: ReactNode;
  className?: string;
}

const FormDescription: React.FC<FormDescriptionProps> = ({
  children,
  className,
}) => {
  return (
    <p className={`text-sm text-gray-500 ${className || ""}`}>{children}</p>
  );
};

interface FormMessageProps {
  children?: ReactNode;
  className?: string;
}

const FormMessage: React.FC<FormMessageProps> = ({ children, className }) => {
  if (!children) return null;

  return (
    <p className={`text-sm font-medium text-red-500 ${className || ""}`}>
      {children}
    </p>
  );
};

export {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
};
