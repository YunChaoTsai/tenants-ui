import React, { Fragment, useEffect, useRef } from "react"
import {
  ErrorMessage as FormikErrorMessage,
  FieldProps,
  Field,
  ErrorMessageProps,
  getIn,
  connect,
  FormikProps,
} from "formik"
import { Omit } from "utility-types"
import { ErrorMessage as ErrorM, FormGroup } from "@tourepedia/ui"
import classNames from "classnames"

export function ErrorMessage({ className = "", ...props }: ErrorMessageProps) {
  return (
    <FormikErrorMessage
      component={ErrorM}
      className={`${className}`}
      {...props}
    />
  )
}

interface InputProps
  extends Omit<React.HTMLProps<HTMLInputElement>, "as" | "label"> {
  as?: React.ReactType
}

export function Input({
  as: Component = "input",
  id,
  name,
  className,
  ...otherProps
}: InputProps) {
  return (
    <Component
      className={classNames("input", className)}
      name={name}
      id={id || name}
      {...otherProps}
    />
  )
}

export { FormGroup }

export function FormikFormGroup({
  name,
  render,
  children,
  ref,
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
            hasError={!!(touched && error)}
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

export interface InputFieldProps extends InputProps {
  name: string
  type?: string
  label?: React.ReactNode
  className?: string
  labelPlacement?: "before" | "after"
  noGroup?: boolean
}

export function InputField({
  label,
  name,
  type = "text",
  className,
  labelPlacement,
  noGroup,
  ...otherProps
}: InputFieldProps) {
  // for radio or checkbox, default to after
  labelPlacement =
    labelPlacement ||
    (type === "checkbox" || type === "radio" ? "after" : "before")
  const renderLabel = label ? <label htmlFor={name}>{label}</label> : null
  function render({ field }: FieldProps) {
    return (
      <Fragment>
        {labelPlacement === "before" ? renderLabel : null}
        <Input type={type} {...field} {...otherProps} />
        {labelPlacement === "after" ? renderLabel : null}
      </Fragment>
    )
  }
  if (noGroup) {
    return <Field name={name} render={render} />
  }
  return <FormikFormGroup name={name} className={className} render={render} />
}

export interface OnFormChangeProps {
  onChange: (formik: FormikProps<any>) => any
  debounce?: number
}

function OnFormChangeImpl({
  onChange,
  formik,
  debounce = 300,
}: OnFormChangeProps & { formik: FormikProps<any> }) {
  const { values } = formik
  const debounceHandler = useRef(-1)
  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }
    debounceHandler.current = window.setTimeout(() => {
      onChange(formik)
    }, debounce)
    return function clearDebounce() {
      debounceHandler.current && window.clearTimeout(debounceHandler.current)
    }
  }, [values])
  return null
}

export const OnFormChange = connect<OnFormChangeProps, any>(OnFormChangeImpl)
