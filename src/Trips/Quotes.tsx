import React, { useEffect, useState, Fragment } from "react"
import { RouteComponentProps, Link } from "@reach/router"
import { AxiosInstance } from "axios"
import {
  Button,
  Icons,
  Table,
  useFetchState,
  Dialog,
  useDialog,
} from "@tourepedia/ui"
import { Formik, Form } from "formik"
import * as Validator from "yup"
import moment from "moment"
import { $PropertyType } from "utility-types"

import { ITrip, IQuote, IGivenQuote, IQuoteHotel } from "./store"
import { withXHR, XHRProps } from "./../xhr"
import { InputField, FormGroup, FormikFormGroup } from "./../Shared/InputField"
import Spinner from "./../Shared/Spinner"
import { numberToLocalString } from "../utils"
import { SelectHotelBookingStages } from "../HotelBookingStages"

interface IInstalment {
  amount: number
  due_date: string
}

export function XHR(xhr: AxiosInstance) {
  return {
    getQuotes(tripId: number | string, params?: any): Promise<IQuote[]> {
      return xhr
        .get(`/trips/${tripId}/quotes`, { params })
        .then(resp => resp.data.data)
    },
    giveQuote(data: any): Promise<IGivenQuote> {
      return xhr.post(`/given-quotes`, data).then(resp => resp.data.data)
    },
    getInstalments(
      quoteId: number
    ): Promise<{
      data: IInstalment[]
      meta: { total: number }
    }> {
      return xhr.get(`/quote-instalments/${quoteId}`).then(resp => resp.data)
    },
    changeHotelBookingStage(
      quoteHotelId: number,
      stageId: number
    ): Promise<any> {
      return xhr.patch("/quote-hotel-booking-stages", {
        items: [quoteHotelId],
        stage: stageId,
      })
    },
  }
}

export const QuoteHotelBookingStage = withXHR(function QuoteHotelBookingStage({
  xhr,
  quoteHotel,
}: XHRProps & { quoteHotel: IQuoteHotel }) {
  const { id, latest_booking_stage } = quoteHotel
  const [showEdit, setShowEdit] = useState<boolean>(false)
  if (showEdit) {
    return (
      <span>
        <Formik
          initialValues={{ stage: latest_booking_stage }}
          validationSchema={Validator.object().shape({
            stage: Validator.object().required("Stage field is required"),
          })}
          onSubmit={(values, actions) => {
            if (!values.stage) {
              actions.setSubmitting(false)
              return
            }
            XHR(xhr)
              .changeHotelBookingStage(id, values.stage.id)
              .then(() => {
                window.location = window.location
              })
          }}
          render={({ isSubmitting, setFieldValue }) => (
            <Form noValidate>
              <fieldset>
                <legend>Change Booking Stage</legend>
                <FormikFormGroup
                  name="stage"
                  render={({ field }) => (
                    <SelectHotelBookingStages
                      {...field}
                      label="Select the booking stage"
                      multiple={false}
                      fetchOnMount
                      onChange={(value, name) => setFieldValue(name, value)}
                    />
                  )}
                />
                <footer>
                  <Button disabled={isSubmitting} type="submit">
                    Save
                  </Button>
                  <Button
                    className="btn--secondary"
                    onClick={() => setShowEdit(false)}
                  >
                    Cancel
                  </Button>
                </footer>
              </fieldset>
            </Form>
          )}
        />
      </span>
    )
  }
  return (
    <span>
      {latest_booking_stage ? latest_booking_stage.name : null}
      <Button className="btn--secondary" onClick={() => setShowEdit(true)}>
        &#9998;
      </Button>
    </span>
  )
})

const giveQuoteSchema = Validator.object()
  .shape({
    given_price: Validator.number()
      .positive("Given price should a positive number")
      .required("Give price field is required"),
    comments: Validator.string(),
  })
  .required("Quote data is required")
export const Quote = withXHR(function Quote({
  quote,
  xhr,
  readOnly = false,
  navigate,
  showHotelBookingStatus,
}: XHRProps & {
  quote: IQuote
  readOnly?: boolean
  navigate?: $PropertyType<RouteComponentProps, "navigate">
  showHotelBookingStatus?: boolean
}) {
  const {
    id,
    total_price,
    hotels,
    cabs,
    comments,
    created_by,
    created_at,
    trip_id,
  } = quote
  const [showGiveQuote, open, close] = useDialog()
  const [
    instalments,
    fetchInstalments,
    { isFetching: isFetchingInstalments },
  ] = useFetchState<IInstalment[]>(() =>
    XHR(xhr)
      .getInstalments(id)
      .then(resp => resp.data)
  )
  function giveQuote(
    quoteId: number,
    givenPrice: number,
    comments?: string
  ): Promise<any> {
    return XHR(xhr).giveQuote({
      given_price: givenPrice,
      quote_id: quoteId,
      comments,
    })
  }
  return (
    <div>
      <header className="mb-4">
        <h6>
          Cost Price: <Icons.RupeeIcon /> {numberToLocalString(total_price)} /-
        </h6>
        <blockquote>
          {comments ? <p>{comments}</p> : null}
          <em>
            on{" "}
            {moment
              .utc(created_at)
              .local()
              .format("DD MMM, YYYY [at] hh:mm A")}{" "}
            by {created_by.name}&lt;{created_by.email}&gt;
          </em>
        </blockquote>
      </header>
      <section>
        <h6>
          <span className="inline-flex w-8 h-8 align-items-center justify-content-center bg-primary-100 rounded-full mr-2">
            <Icons.BedIcon />
          </span>
          Accommodation
        </h6>
        <Table
          striped
          bordered
          caption={
            "Bellow are the details of daywise hotel accomodation and their prices"
          }
          responsive
          headers={["Date", "Hotels", "Meal Plan", "Rooms", "Price"].concat(
            showHotelBookingStatus ? ["Booking Stage"] : []
          )}
          alignCols={{ 4: "right", 5: "center" }}
          rows={hotels.map(quoteHotel => {
            const {
              hotel,
              checkin,
              checkout,
              meal_plan,
              room_type,
              no_of_rooms,
              comments,
              given_price,
            } = quoteHotel
            return [
              <span className="whitespace-pre">
                {moment
                  .utc(checkin)
                  .local()
                  .format("DD MMM YYYY")}
                <br />
                <small>
                  {moment.utc(checkout).diff(moment.utc(checkin), "days") + 1}{" "}
                  Nights
                </small>
              </span>,
              <div>
                <b>{hotel.name}</b>
                <br />
                <small>
                  {hotel.location.short_name}, {hotel.stars} Star
                </small>
                {comments ? <blockquote>{comments}</blockquote> : null}
              </div>,
              meal_plan.name,
              <div>
                {room_type.name}
                <br />
                <small>{no_of_rooms} Rooms</small>
              </div>,
              numberToLocalString(given_price),
            ].concat(
              showHotelBookingStatus
                ? [<QuoteHotelBookingStage quoteHotel={quoteHotel} />]
                : []
            )
          })}
        />
      </section>
      <section>
        <h6>
          <span className="inline-flex w-8 h-8 align-items-center justify-content-center bg-primary-100 rounded-full mr-2">
            <Icons.BusIcon />
          </span>
          Transportation
        </h6>
        <Table
          striped
          bordered
          caption={
            "Bellow are the details for the daywise transportation and their prices"
          }
          responsive
          headers={["Date", "Service", "Cabs", "Price"]}
          alignCols={{ 3: "right" }}
          rows={cabs.map(
            ({
              from_date,
              to_date,
              cab_type,
              transport_service,
              no_of_cabs,
              comments,
              given_price,
            }) => [
              <span className="whitespace-pre">
                {moment
                  .utc(from_date)
                  .local()
                  .format("DD MMM YYYY")}{" "}
                <br />
                <small>
                  {moment.utc(to_date).diff(moment.utc(from_date), "days") + 1}{" "}
                  Days
                </small>
              </span>,
              <div>
                {transport_service.name}
                {comments ? <blockquote>{comments}</blockquote> : null}
              </div>,
              <div>
                {cab_type.name}
                <br />
                <small>{no_of_cabs} cabs</small>
              </div>,
              numberToLocalString(given_price),
            ]
          )}
        />
      </section>
      {!readOnly ? (
        <footer>
          <div className="button-group">
            <Button onClick={open}>Give this quote</Button>
            <Dialog open={showGiveQuote} onClose={close}>
              <Dialog.Header>
                <Dialog.Title as="h4">
                  Give this quote (price: {quote.total_price})
                </Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                <Formik
                  initialValues={{
                    comments: "",
                    factor: 1.1,
                    given_price: Math.ceil(quote.total_price * 1.1),
                  }}
                  validationSchema={giveQuoteSchema}
                  onSubmit={(values, actions) => {
                    if (
                      window.confirm(
                        "Are you sure you want to give this quote to the customer?"
                      )
                    ) {
                      giveQuote(id, values.given_price, values.comments)
                        .then(close)
                        .then(() => {
                          navigate && navigate("../given-quotes")
                        })
                    } else {
                      actions.setSubmitting(false)
                    }
                  }}
                  render={({ isSubmitting, values, setFieldValue }) => (
                    <Form noValidate>
                      <FormGroup>
                        <label>Multiplication Factor</label>
                        <select
                          name="factor"
                          value={values.factor}
                          onChange={e => {
                            setFieldValue(
                              "given_price",
                              Math.ceil(
                                quote.total_price * parseFloat(e.target.value)
                              )
                            )
                            setFieldValue(e.target.name, e.target.value)
                          }}
                        >
                          <option value={1.1}>1.1</option>
                          <option value={1.2}>1.2</option>
                          <option value={1.3}>1.3</option>
                          <option value={1.4}>1.4</option>
                          <option value={1.5}>1.5</option>
                        </select>
                      </FormGroup>
                      <InputField
                        name="given_price"
                        label="Given Price"
                        type="number"
                      />
                      <InputField
                        name="comments"
                        as="textarea"
                        label="Any Comments"
                        placeholder="Write comments regarding prices or anything else..."
                      />
                      <Dialog.Footer>
                        <Button primary type="submit" disabled={isSubmitting}>
                          Give Quote
                        </Button>
                        <Button onClick={close} className="btn--secondary">
                          Cancel
                        </Button>
                      </Dialog.Footer>
                    </Form>
                  )}
                />
              </Dialog.Body>
            </Dialog>
            <Button onClick={fetchInstalments}>
              Get Instalments for Hotels and Cabs{" "}
              {isFetchingInstalments ? <Spinner /> : null}
            </Button>
            <Link
              to={`/trips/${trip_id}/new-quote`}
              state={{ quote }}
              className="btn"
            >
              Edit
            </Link>
          </div>
          {instalments ? (
            <Table
              striped
              bordered
              headers={["Amount", "Due Date"]}
              alignCols={{ 0: "right" }}
              autoWidth
              rows={instalments.map(i => [
                i.amount.toFixed(2),
                moment
                  .utc(i.due_date)
                  .local()
                  .format("DD/MM/YYYY"),
              ])}
            />
          ) : null}
        </footer>
      ) : null}
    </div>
  )
})

interface QuotesProps extends RouteComponentProps, XHRProps {
  trip: ITrip
}
function Quotes({ xhr, trip, navigate }: QuotesProps) {
  const [quotes, setQuotes] = useState<IQuote[]>([])
  function getQuotes() {
    XHR(xhr)
      .getQuotes(trip.id)
      .then(setQuotes)
  }
  useEffect(() => {
    getQuotes()
  }, [])
  return (
    <Fragment>
      <h4 className="my-4">All Quotes</h4>
      {quotes.length === 0 ? (
        <p className="text-center">No quote created for this trip</p>
      ) : (
        <ol className="list list--bordered">
          {quotes.map(quote => (
            <li key={quote.id}>
              <Quote
                quote={quote}
                navigate={navigate}
                readOnly={!!trip.converted_at}
              />
            </li>
          ))}
        </ol>
      )}
    </Fragment>
  )
}

export default withXHR(Quotes)
