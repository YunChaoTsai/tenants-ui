import React from "react"
import { Formik, Form } from "formik"
import { InputField } from "./InputField"
import Button from "@tourepedia/button"

export interface SearchProps {
  initialParams?: {
    q: string
  }
  onSearch: (params: any) => void
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
        <Form noValidate className="display--flex">
          <InputField name="q" placeholder="Type to search..." />
          <Button type="submit">Submit</Button>
          <Button type="reset">Reset</Button>
        </Form>
      )}
    />
  )
}

export default Search
