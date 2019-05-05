import React, { Fragment } from "react"
import {
  ErrorMessage as FormikErrorMessage,
  FieldProps,
  Field,
  ErrorMessageProps,
  getIn,
} from "formik"
import { Omit } from "utility-types"

export function ErrorMessage({ className = "", ...props }: ErrorMessageProps) {
  return (
    <FormikErrorMessage
      component="span"
      className={`error ${className}`}
      {...props}
    />
  )
}

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

export function FormGroup({
  className = "",
  ...props
}: React.HTMLProps<HTMLDivElement>) {
  return <div role="group" className={`form-group ${className}`} {...props} />
}

export function FormikFormGroup({
  name,
  className,
  render,
  children,
  ...props
}: Omit<React.HTMLProps<HTMLDivElement>, "name"> & {
  name: string
  render: (props: FieldProps) => React.ReactNode
}) {
  return (
    <Field
      name={name}
      render={(fieldProps: FieldProps) => {
        const {
          field: { name },
          form: { touched: allTouched, errors },
        } = fieldProps
        const touched: boolean = getIn(allTouched, name)
        const error: string = getIn(errors, name)
        return (
          <FormGroup
            className={`${touched ? "is-touched " : ""}${
              error ? "has-error " : ""
            }${className || ""}`}
            aria-errormessage={error}
            {...props}
          >
            {children ? children : render(fieldProps)}
            <ErrorMessage name={name} />
          </FormGroup>
        )
      }}
    />
  )
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
    <FormikFormGroup
      name={name}
      className={className}
      render={({ field }) => (
        <Fragment>
          {label ? <label htmlFor={name}>{label}</label> : null}
          <Input {...otherProps} type={type} {...field} />
        </Fragment>
      )}
    />
  )
}
