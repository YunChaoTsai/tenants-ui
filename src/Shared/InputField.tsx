import React from "react"
import { ErrorMessage, FieldProps, Field } from "formik"
import { Omit } from "utility-types"

interface InputProps extends Omit<React.HTMLProps<HTMLInputElement>, "as"> {
  as?: React.ReactType
}

export function Input({
  type = "text",
  as: Component = "input",
  ...otherProps
}: InputProps) {
  return <Component {...otherProps} type={type} />
}

export function InputField({
  label,
  name,
  type = "text",
  className,
  ...otherProps
}: InputProps & {
  name: string
  type?: string
  label?: React.ReactNode
  className?: string
  as?: React.ReactType
}) {
  return (
    <Field
      name={name}
      render={({ field }: FieldProps) => (
        <div className={className}>
          {label ? <label htmlFor="name">{label}</label> : null}
          <Input {...otherProps} type={type} {...field} />
          <ErrorMessage
            name={field.name}
            component="span"
            className="text--error"
          />
        </div>
      )}
    />
  )
}
