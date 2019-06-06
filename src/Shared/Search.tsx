import React, { useState } from "react"
import { Formik, Form } from "formik"
import { InputField } from "./InputField"
import { SearchIcon } from "@tourepedia/icons"

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
          <div className="input-group">
            <InputField
              name="q"
              placeholder="Search..."
              type="search"
              style={{ minWidth: "200px" }}
            />
            <button type="submit">
              <SearchIcon />
            </button>
          </div>
        </Form>
      )}
    />
  )
}

export default Search
