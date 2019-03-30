import React from "react"
import { ErrorMessage, FieldProps, Field } from "formik"

export function InputField({
  label,
  name,
  type = "text",
  className,
  ...otherProps
}: React.HTMLProps<HTMLInputElement> & {
  name: string
  type?: string
  label?: React.ReactNode
  className?: string
}) {
  return (
    <Field
      name={name}
      render={({ field }: FieldProps) => (
        <div className={className}>
          {label ? <label htmlFor="name">{label}</label> : null}
          <input {...otherProps} type={type} {...field} />
          <ErrorMessage name={field.name} />
        </div>
      )}
    />
  )
}
