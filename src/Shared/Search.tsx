import React, { useState } from "react"
import { Formik, Form } from "formik"
import { InputField } from "./InputField"
import { InputGroup, Icons, Button } from "@tourepedia/ui"

export interface SearchProps {
  initialParams?: {
    q: string
  }
  onSearch: (params: any) => void
  placeholder?: string
}

export function useSearch<T extends {} = {}>(initialValues: T = {} as any) {
  return useState<T>(initialValues)
}

const defaultInitialParams = {
  q: "",
}

export function Search({
  initialParams = defaultInitialParams,
  onSearch,
  placeholder = "Search...",
}: SearchProps) {
  return (
    <Formik
      initialValues={initialParams}
      onSubmit={values => onSearch(values)}
      render={() => (
        <Form noValidate style={{ marginBottom: "1em" }}>
          <InputGroup style={{ minWidth: "280px" }}>
            <InputField
              name="q"
              noGroup
              placeholder={placeholder}
              type="search"
            />
            <Button type="submit">
              <Icons.SearchIcon />
            </Button>
          </InputGroup>
        </Form>
      )}
    />
  )
}

export default Search
