import React, { useState } from "react"
import { Formik, Form } from "formik"
import { InputField } from "./InputField"
import { InputGroup, Icons } from "@tourepedia/ui"

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
        <Form noValidate style={{ marginBottom: "1em" }}>
          <InputGroup>
            <InputField
              name="q"
              noGroup
              placeholder="Search..."
              type="search"
            />
            <button className="input-group-addon btn" type="submit">
              <Icons.SearchIcon />
            </button>
          </InputGroup>
        </Form>
      )}
    />
  )
}

export default Search
