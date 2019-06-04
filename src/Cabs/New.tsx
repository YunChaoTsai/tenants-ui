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
import { InputField, FormikFormGroup } from "./../Shared/InputField"
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
                const cab = data.data
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
          setFieldValue,
        }: FormikProps<NewCabCredentials>) => (
          <Form noValidate>
            {status ? <div>{status}</div> : null}
            <fieldset>
              <legend>Add New Cab</legend>
              <InputField
                label="Name"
                name="name"
                required
                placeholder="Suzuki Wagon R"
              />
              <FormikFormGroup
                name="cab_type"
                render={({ field }: FieldProps<NewCabCredentials>) => (
                  <SelectCabTypes
                    {...field}
                    label="Cab Type"
                    multiple={false}
                    placeholder="Type to search... (e.g. Wagon)"
                    onChange={(value, name) => setFieldValue(name, value)}
                  />
                )}
              />
              <InputField
                label="Number Plate"
                name="number_plate"
                required
                placeholder="RJ18 CC 7838"
              />
              <footer>
                <Button primary type="submit" disabled={isSubmitting}>
                  Submit
                </Button>
                <Link to=".." className="btn">
                  Cancel
                </Link>
              </footer>
            </fieldset>
          </Form>
        )}
      />
    </div>
  )
}

export default withXHR<NewCabProps>(NewCab)
