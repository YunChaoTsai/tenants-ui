import React from "react"
import { Formik, Form } from "formik"
import {
  InputField,
  // FormikFormGroup
} from "../Shared/InputField"
import { Button } from "@tourepedia/ui"
import * as Validator from "yup"
import {
  store as locationStore,
  // SelectCountries
} from "../Locations"

const addContactValidationSchema = Validator.object()
  .shape({
    name: Validator.string().required("Contact name is required"),
    email: Validator.string().email("Email should be a valid email address"),
    phone_number: Validator.number()
      .positive("Phone number should be a positive integer")
      .typeError("Invalid number"),
  })
  .required("Contact data is required")

interface AddContactSchema {
  name: string
  email?: string
  phone_number?: number
  country?: locationStore.ICountry
}

const initialValues: AddContactSchema = {
  name: "",
  email: "",
}

interface AddContactFormProps {
  onCreate: (data: AddContactSchema) => Promise<any>
  onCancel: () => void
}

export function AddContactForm({ onCreate, onCancel }: AddContactFormProps) {
  return (
    <Formik
      initialValues={initialValues}
      validationSchema={addContactValidationSchema}
      onSubmit={(values, actions) => {
        actions.setStatus()
        onCreate(values)
          .then(() => {
            actions.setSubmitting(false)
            onCancel()
          })
          .catch(error => {
            actions.setStatus(error.message)
            if (error.formikErrors) {
              actions.setErrors(error.formikErrors)
            }
            actions.setSubmitting(false)
          })
      }}
      render={({ setFieldValue, isSubmitting }) => (
        <Form noValidate>
          <InputField
            name="name"
            label="Name"
            required
            placeholder="Johhny Dep"
          />
          <InputField
            name="email"
            label="Email"
            type="email"
            placeholder="user@domain.com"
          />
          {
            // <FormikFormGroup
            //   name="phone_number_dial_code"
            //   render={({ field }) => (
            //     <SelectCountries
            //       {...field}
            //       multiple={false}
            //       label="Country Code"
            //       onChange={(value, name) => setFieldValue(name, value)}
            //     />
            //   )}
            // />
          }
          <InputField
            name="phone_number"
            label="Phone Number"
            type="number"
            placeholder="9911929399"
          />
          <hr />
          <footer>
            <Button disabled={isSubmitting} primary type="submit">
              Save
            </Button>{" "}
            <Button onClick={onCancel}>Cancel</Button>
          </footer>
        </Form>
      )}
    />
  )
}

export default AddContactForm
