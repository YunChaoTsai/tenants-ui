import React from "react"
import { RouteComponentProps, Link } from "@reach/router"
import {
  Formik,
  FormikProps,
  FormikActions,
  Form,
  ErrorMessage,
  Field,
  FieldProps,
} from "formik"
import * as Validator from "yup"
import Button from "@tourepedia/button"

import { withXHR, XHRProps } from "./../xhr"
import { InputField } from "./../Shared/InputField"
import { SelectCabTypes, store as cabTypeStore } from "./../CabTypes"

export interface NewCabCredentials {
  name: string
  number_plate: string
  cab_type?: cabTypeStore.ICabType
}
const newCabSchema = Validator.object().shape({
  name: Validator.string().required("Name for the cab is required."),
  number_plate: Validator.string()
    .required("Number Plate is required")
    .max(299, "Maximum 299 characters allowed"),
  cab_type: Validator.object().required("Cab type is required"),
})
const initialValues = {
  name: "",
  number_plate: "",
  cab_type: undefined,
}

interface NewCabProps extends RouteComponentProps, XHRProps {}

export function NewCab({ xhr, navigate }: NewCabProps) {
  return (
    <div>
      <Formik
        initialValues={initialValues}
        validationSchema={newCabSchema}
        onSubmit={(
          values: NewCabCredentials,
          actions: FormikActions<NewCabCredentials>
        ) => {
          const { number_plate, cab_type, name } = values
          if (number_plate && cab_type && name) {
            actions.setStatus()
            return xhr
              .post("/cabs", {
                name,
                number_plate,
                cab_type_id: cab_type.id,
              })
              .then(({ data }) => {
                const { cab } = data
                navigate && navigate(`../${cab.id}`)
                actions.setSubmitting(false)
              })
              .catch(error => {
                actions.setStatus(error.message)
                if (error.formikErrors) {
                  actions.setErrors(error.formikErrors)
                }
                actions.setSubmitting(false)
              })
          } else {
            actions.setStatus("Please fill the required fields")
          }
        }}
        render={({
          isSubmitting,
          status,
          values,
          setFieldValue,
        }: FormikProps<NewCabCredentials>) => (
          <Form noValidate>
            {status ? <div>{status}</div> : null}
            <InputField
              label="Name"
              name="name"
              required
              placeholder="Suzuki Wagon R"
            />
            <Field
              name="cab_type"
              render={({ field }: FieldProps<NewCabCredentials>) => (
                <div>
                  <SelectCabTypes
                    label="Cab Type"
                    name={field.name}
                    multiple={false}
                    value={field.value}
                    placeholder="Type to search... (e.g. Wagon)"
                    onChange={value => setFieldValue(field.name, value)}
                  />
                  <ErrorMessage name={field.name} />
                </div>
              )}
            />
            <InputField
              label="Number Plate"
              name="number_plate"
              required
              placeholder="RJ18 CC 7838"
            />
            <Button type="submit" disabled={isSubmitting}>
              Submit
            </Button>
            <Link to="..">Cancel</Link>
          </Form>
        )}
      />
    </div>
  )
}

export default withXHR<NewCabProps>(NewCab)
