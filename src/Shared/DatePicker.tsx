import React from "react"
import { InputField, InputFieldProps } from "./InputField"

// dateformat is yyyy-mm-dd
export default function DatePicker(props: InputFieldProps) {
  return <InputField type="date" placeholder="dd/mm/yyyy" {...props} />
}
