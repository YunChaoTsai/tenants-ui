import React from "react"
import { withXHR, XHRProps } from "./../xhr"
import { RouteComponentProps, Link } from "@reach/router"
import { Form, Formik } from "formik"
import { InputField } from "../Shared/InputField"
import { Button } from "@tourepedia/ui"
import * as Validator from "yup"

const initialValues = {
  timezone_offset: new Date().getTimezoneOffset(),
  file: "",
  file_name: "",
}

const validationSchema = Validator.object().shape({
  timezone_offset: Validator.string().required(),
  file: Validator.mixed().required("File field is required"),
  file_name: Validator.string().required("File field is required"),
})

interface UploadPricesProps extends RouteComponentProps, XHRProps {}

const UploadPrices = withXHR(function UploadPrices({
  xhr,
  navigate,
}: UploadPricesProps) {
  return (
    <div>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={(values, actions) => {
          const data = new FormData()
          data.set("timezone_offset", values.timezone_offset.toString())
          data.set("file", values.file)
          xhr
            .post("/hotel-prices", data, {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            })
            .then(resp => {
              navigate && navigate("..")
            })
            .catch(error => {
              actions.setStatus(error.message)
              if (error.formikErrors) {
                actions.setErrors(error.formikErrors)
              }
            })
            .then(() => {
              actions.setSubmitting(false)
            })
        }}
        render={({ setFieldValue, isSubmitting, status }) => (
          <Form noValidate encType="multipart/form-data">
            <fieldset>
              <legend>Upload file to add hotel prices</legend>
              {status ? <p className="text-red-700">{status}</p> : null}
              <InputField
                label="Select a csv file"
                name="file_name"
                type="file"
                accept=".csv"
                onChange={({ currentTarget }) => {
                  setFieldValue(
                    "file",
                    currentTarget.files ? currentTarget.files[0] : ""
                  )
                  setFieldValue(currentTarget.name, currentTarget.value)
                }}
              />
              <footer>
                <Button type="submit" disabled={isSubmitting}>
                  Upload CSV
                </Button>
                <Link className="btn" to="..">
                  Cancel
                </Link>
              </footer>
            </fieldset>
          </Form>
        )}
      />
    </div>
  )
})

export default UploadPrices
