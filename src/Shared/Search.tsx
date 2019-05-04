import React, { useState } from "react"
import { Formik, Form } from "formik"
import { InputField } from "./InputField"
import Button from "@tourepedia/button"

export interface SearchProps {
  initialParams?: {
    q: string
  }
  onSearch: (params: any) => void
}

export function useSearch(initialValues: any = {}) {
  const [params, setParams] = useState<any>(initialValues)
  return [params, setParams]
}

const defaultInitialParams = {
  q: "",
}

export function Search({
  initialParams = defaultInitialParams,
  onSearch,
}: SearchProps) {
  return (
    <Formik
      initialValues={initialParams}
      onSubmit={values => onSearch(values)}
      render={() => (
        <Form noValidate>
          <div className="input-group">
            <InputField name="q" placeholder="Search..." />
            <Button type="submit">&#128269;</Button>
            <Button type="reset">&#8634;</Button>
          </div>
        </Form>
      )}
    />
  )
}

export default Search
