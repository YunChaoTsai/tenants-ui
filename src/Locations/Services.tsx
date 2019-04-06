import React, { useState, useEffect } from "react"
import { RouteComponentProps, Link } from "@reach/router"
import { Formik, FormikProps, FormikActions, Form, FieldArray } from "formik"
import Button from "@tourepedia/button"
import * as Validator from "yup"
import { Omit } from "utility-types"
import { AxiosInstance } from "axios"

import { InputField } from "./../Shared/InputField"
import { IService } from "./store"
import { withXHR, XHRProps } from "./../xhr"
import { Async, AsyncProps } from "./../Shared/Select"

const validateSchema = Validator.object().shape({
  via: Validator.array()
    .min(2, "Atleast two locations required")
    .required("Via field is required"),
  distance: Validator.number()
    .positive("Distance should be a positive number")
    .integer("Distance should be an integer")
    .required("Distance field is required"),
})

export function XHR(xhr: AxiosInstance) {
  return {
    getServices(params?: any): Promise<IService[]> {
      return xhr
        .get("/location-services", { params })
        .then(resp => resp.data.location_services)
    },
  }
}

interface ServicesProps extends RouteComponentProps, XHRProps {}
function Services({ xhr }: ServicesProps) {
  const [services, setServices] = useState<IService[]>([])
  useEffect(() => {
    XHR(xhr)
      .getServices()
      .then(setServices)
  }, [])
  return (
    <div>
      <Link to="..">Back</Link>
      <h3>Services</h3>
      <div>Total: {services.length}</div>
      <ul>
        {services.map(service => (
          <li key={service.id}>{service.name}</li>
        ))}
      </ul>
    </div>
  )
}

export default withXHR(Services)

interface SelectProps extends XHRProps, Omit<AsyncProps, "fetch"> {}

export const SelectServices = withXHR<SelectProps>(function SelectServices({
  xhr,
  ...otherProps
}: SelectProps) {
  return (
    <Async multiple {...otherProps} fetch={q => XHR(xhr).getServices({ q })} />
  )
})
