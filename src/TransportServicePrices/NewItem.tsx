import React from "react"
import { RouteComponentProps, Link } from "@reach/router"
import { AxiosInstance } from "axios"
import {
  Formik,
  FormikActions,
  FormikProps,
  Form,
  FieldProps,
  FieldArray,
} from "formik"
import { Button } from "@tourepedia/ui"
import * as Validator from "yup"
import moment from "moment"

import { ITransportServicePrice } from "./store"
import { store as cabTypeStore, SelectCabTypes } from "./../CabTypes"
import {
  store as transportLocationStore,
  SelectTransportLocations,
} from "./../TransportLocations"
import {
  SelectTransportServices as SelectServices,
  store as transportServiceStore,
} from "./../TransportServices"
import { withXHR, XHRProps } from "./../xhr"
import { InputField, FormikFormGroup } from "./../Shared/InputField"
import { Grid, Col } from "../Shared/Layout"
import DatePicker from "../Shared/DatePicker"
import { EmptyNumberValidator } from "../utils"

export function XHR(xhr: AxiosInstance) {
  return {
    async storePrice(data: any): Promise<ITransportServicePrice> {
      return xhr.post("/cab-prices", data).then(resp => resp.data.cab_price)
    },
  }
}

const validationSchema = Validator.object().shape({
  prices: Validator.array().of(
    Validator.object().shape({
      start_date: Validator.string().required("Start date is required"),
      end_date: Validator.string().required("End date is required"),
      cab_type: Validator.object().required("Cab type is required"),
      transport_service: Validator.object().required(
        "Transport service is required"
      ),
      cab_locality: Validator.object(),
      per_day_charges: EmptyNumberValidator(),
      per_day_parking_charges: EmptyNumberValidator(),
      price: EmptyNumberValidator(),
      per_km_charges: EmptyNumberValidator(),
      minimum_km_per_day: EmptyNumberValidator(),
      night_charges: EmptyNumberValidator(),
      toll_charges: EmptyNumberValidator(),
      parking_charges: EmptyNumberValidator(),
    })
  ),
})

interface AddPriceCredentials {
  prices: {
    start_date: string
    end_date: string
    cab_type?: cabTypeStore.ICabType
    transport_service?: transportServiceStore.ITransportService
    cab_locality?: transportLocationStore.ITransportLocation
    per_day_charges?: number
    per_day_parking_charges?: number
    price?: number
    per_km_charges?: number
    minimum_km_per_day?: number
    toll_charges?: number
    night_charges?: number
    parking_charges?: number
  }[]
}

const initialValues: AddPriceCredentials = {
  prices: [
    {
      start_date: "",
      end_date: "",
      cab_type: undefined,
      transport_service: undefined,
      cab_locality: undefined,
      per_day_charges: undefined,
      per_day_parking_charges: undefined,
      price: undefined,
      per_km_charges: undefined,
      minimum_km_per_day: undefined,
      toll_charges: undefined,
      night_charges: undefined,
      parking_charges: undefined,
    },
  ],
}

interface AddPriceProps extends RouteComponentProps, XHRProps {}

function AddPrice({ xhr, navigate }: AddPriceProps) {
  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={(
        values: AddPriceCredentials,
        actions: FormikActions<AddPriceCredentials>
      ) => {
        actions.setStatus()
        const prices: any = []
        values.prices.forEach(values => {
          const {
            cab_type,
            transport_service,
            cab_locality,
            start_date,
            end_date,
            ...otherData
          } = values
          if (cab_type && transport_service) {
            prices.push({
              ...otherData,
              start_date: moment(start_date)
                .hours(0)
                .minutes(0)
                .seconds(0)
                .utc()
                .format("YYYY-MM-DD HH:mm:ss"),
              end_date: moment(end_date)
                .hours(23)
                .minutes(59)
                .seconds(59)
                .utc()
                .format("YYYY-MM-DD HH:mm:ss"),
              cab_type_id: cab_type.id,
              transport_service_id: transport_service.id,
              cab_locality_id: cab_locality && cab_locality.name,
            })
          }
        })
        XHR(xhr)
          .storePrice({ prices })
          .then(() => {
            actions.setSubmitting(false)
            navigate && navigate("..")
          })
          .catch(error => {
            actions.setStatus(error.message)
            if (error.formikErrors) {
              actions.setErrors(error.formikErrors)
            }
            actions.setSubmitting(false)
          })
      }}
      render={({
        status,
        isSubmitting,
        values,
        setFieldValue,
      }: FormikProps<AddPriceCredentials>) => (
        <Form noValidate>
          <fieldset style={{ minInlineSize: "auto" }}>
            <legend>Add Transport Service Price</legend>
            <FieldArray
              name="prices"
              render={({ name, push, remove }) => (
                <ol className="list">
                  {values.prices.map((price, index, prices) => (
                    <li key={index}>
                      <Grid>
                        <Col>
                          <DatePicker
                            label="Start Date"
                            name={`${name}.${index}.start_date`}
                            required
                          />
                        </Col>
                        <Col>
                          <DatePicker
                            label="End Date"
                            name={`${name}.${index}.end_date`}
                            required
                          />
                        </Col>
                        <Col>
                          <FormikFormGroup
                            name={`${name}.${index}.cab_type`}
                            render={({
                              field,
                            }: FieldProps<AddPriceCredentials>) => (
                              <SelectCabTypes
                                {...field}
                                label="Cab Type"
                                multiple={false}
                                required
                                fetchOnMount
                                onChange={(value, name) =>
                                  setFieldValue(name, value)
                                }
                              />
                            )}
                          />
                        </Col>
                        <Col>
                          <FormikFormGroup
                            name={`${name}.${index}.transport_service`}
                            render={({
                              field,
                            }: FieldProps<AddPriceCredentials>) => (
                              <SelectServices
                                {...field}
                                label="Transport Service"
                                multiple={false}
                                required
                                fetchOnMount
                                onChange={(value, name) =>
                                  setFieldValue(name, value)
                                }
                              />
                            )}
                          />
                        </Col>
                        <Col>
                          <FormikFormGroup
                            name={`${name}.${index}.cab_locality`}
                            render={({
                              field,
                            }: FieldProps<AddPriceCredentials>) => (
                              <SelectTransportLocations
                                {...field}
                                label="Cab Locality"
                                multiple={false}
                                fetchOnMount
                                onChange={(value, name) =>
                                  setFieldValue(name, value)
                                }
                              />
                            )}
                          />
                        </Col>
                      </Grid>
                      <Grid>
                        <Col>
                          <InputField
                            label="Per Day Charges"
                            name={`${name}.${index}.per_day_charges`}
                            type="number"
                            min={0}
                          />
                        </Col>
                        <Col>
                          <InputField
                            label="Per Day Parking Charges"
                            name={`${name}.${index}.per_day_parking_charges`}
                            type="number"
                            min={0}
                          />
                        </Col>
                        <Col>
                          <InputField
                            label="Price (fixed Per Service)"
                            name={`${name}.${index}.price`}
                            type="number"
                            min={0}
                          />
                        </Col>
                        <Col>
                          <InputField
                            label="Charges per Km"
                            name={`${name}.${index}.per_km_charges`}
                            type="number"
                            min={0}
                          />
                        </Col>
                        <Col>
                          <InputField
                            label="Minimum Kms per Day"
                            name={`${name}.${index}.minimum_km_per_day`}
                            type="number"
                            min={0}
                          />
                        </Col>
                        <Col>
                          <InputField
                            label="Toll charges per Km"
                            name={`${name}.${index}.toll_charges`}
                            type="number"
                            min={0}
                          />
                        </Col>
                        <Col>
                          <InputField
                            label="Night Charges per Km"
                            name={`${name}.${index}.night_charges`}
                            type="number"
                            min={0}
                          />
                        </Col>
                        <Col>
                          <InputField
                            label="Parking Charges per km"
                            name={`${name}.${index}.parking_charges`}
                            type="number"
                            min={0}
                          />
                        </Col>
                      </Grid>
                      <div className="button-group mt-4">
                        <Button
                          className="btn--secondary"
                          onClick={() => push(price)}
                        >
                          + Duplicate
                        </Button>
                        {prices.length > 1 ? (
                          <Button
                            className="btn--secondary"
                            onClick={() => remove(index)}
                          >
                            &times; Remove
                          </Button>
                        ) : null}
                      </div>
                    </li>
                  ))}
                  <div className="form-group">
                    <hr />
                    <Button
                      branded
                      onClick={() => push(initialValues.prices[0])}
                    >
                      + Add More Transport Prices
                    </Button>
                  </div>
                </ol>
              )}
            />
            {status ? <div>{status}</div> : null}
            <footer>
              <Button type="submit" disabled={isSubmitting}>
                Save Prices
              </Button>
              <Link to={".."} className="btn">
                Cancel
              </Link>
            </footer>
          </fieldset>
        </Form>
      )}
    />
  )
}

export default withXHR(AddPrice)
