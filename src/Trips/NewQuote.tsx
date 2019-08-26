import React, { useState, useCallback, useMemo, useRef } from "react"
import { RouteComponentProps } from "@reach/router"
import { AxiosInstance } from "axios"
import { Button, Icons } from "@tourepedia/ui"
import moment from "moment"

import { withXHR, XHRProps } from "./../xhr"
import { ITrip, IQuote } from "./store"
import {
  CalculatePriceForm as CalculateHotelPrice,
  ExtraServicesForm as ExtraHotelServices,
} from "./../HotelPrices"
import {
  CalculatePriceForm as CalculateCabPrice,
  ExtraServicesForm as ExtraTransportServices,
} from "./../TransportServicePrices"
import { ExtraServicesForm as ExtraQuoteServices } from "./QuoteExtras"
import { Input, FormGroup } from "./../Shared/InputField"
import { numberToLocalString } from "../utils"

export function XHR(xhr: AxiosInstance) {
  return {
    async saveQuote(tripId: string | number, data: any): Promise<IQuote> {
      return xhr
        .post(`/trips/${tripId}/quotes`, data)
        .then(resp => resp.data.quote)
    },
  }
}

interface NewQuoteProps extends RouteComponentProps, XHRProps {
  trip: ITrip
}

function NewQuote({ xhr, navigate, trip, location }: NewQuoteProps) {
  const quote: IQuote | undefined =
    location && location.state && location.state.quote
  const [hotelPrice, setHotelPrice] = useState<number>(0)
  const [cabPrice, setCabPrice] = useState<number>(0)
  const [hotels, setHotels] = useState<any>([])
  const [hotelExtras, setHotelExtras] = useState<any>([])
  const [hotelExtrasPrice, setHotelExtrasPrice] = useState<number>(0)
  const [transportExtrasPrice, setTransportExtrasPrice] = useState<number>(0)
  const [otherExtrasPrice, setOtherExtrasPrice] = useState<number>(0)
  const [cabs, setCabs] = useState<any>([])
  const [transportExtras, setTransportExtras] = useState<any>([])
  const [otherExtras, setOtherExtras] = useState<any>([])
  const [comments, setComments] = useState<string>(
    quote ? quote.comments || "" : ""
  )
  const [errors, setErrors] = useState<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const saveQuote = useCallback(() => {
    setErrors(null)
    XHR(xhr)
      .saveQuote(trip.id, {
        total_price:
          hotelPrice +
          cabPrice +
          hotelExtrasPrice +
          transportExtrasPrice +
          otherExtrasPrice,
        hotels,
        cabs,
        hotel_extras: hotelExtras,
        transport_extras: transportExtras,
        other_extras: otherExtras,
        comments,
      })
      .then(() => {
        navigate && navigate("../quotes")
      })
      .catch(e => {
        setErrors(e)
        const document = containerRef.current
        if (document) {
          const buttons: NodeListOf<
            HTMLButtonElement
          > = document.querySelectorAll("[type='submit']")
          buttons.forEach(btn =>
            typeof btn.click === "function" ? btn.click() : null
          )
          setTimeout(() => {
            const document = containerRef.current
            if (document) {
              const errors: NodeListOf<
                HTMLButtonElement
              > = document.querySelectorAll("[class='error-message']")
              if (errors.length) {
                if (errors[0].scrollIntoView) {
                  errors[0].scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                  })
                } else {
                  window.alert(e.message)
                }
              }
            }
          }, 300)
        }
      })
  }, [
    xhr,
    trip,
    navigate,
    comments,
    hotels,
    hotelPrice,
    cabs,
    cabPrice,
    hotelExtras,
    hotelExtrasPrice,
    transportExtras,
    transportExtrasPrice,
    otherExtras,
    otherExtrasPrice,
  ])
  const handleHotelChange = useCallback(
    (hotelPrice, hotels) => {
      setErrors(null)
      setHotelPrice(hotelPrice)
      setHotels(hotels)
    },
    [setHotelPrice, setHotels]
  )
  const handleHotelExtrasChange = useCallback(
    (hotelExtrasPrice, hotelExtras) => {
      setErrors(null)
      setHotelExtrasPrice(hotelExtrasPrice)
      setHotelExtras(hotelExtras)
    },
    [setHotelExtras, setHotelExtras]
  )
  const handleCabChange = useCallback(
    (cabPrice, cabs) => {
      setErrors(null)
      setCabPrice(cabPrice)
      setCabs(cabs)
    },
    [setCabPrice, setCabs]
  )
  const handleTransportExtrasChange = useCallback(
    (price, extras) => {
      setErrors(null)
      setTransportExtrasPrice(price)
      setTransportExtras(extras)
    },
    [setTransportExtrasPrice, setTransportExtras]
  )

  const handleOtherExtrasChange = useCallback(
    (price, extras) => {
      setErrors(null)
      setOtherExtrasPrice(price)
      setOtherExtras(extras)
    },
    [setOtherExtrasPrice, setOtherExtras]
  )

  const initialQuote = useMemo(() => {
    return {
      hotels: quote
        ? {
            hotels: quote.hotels.map(
              ({
                checkin,
                checkout,
                room_type,
                adults_with_extra_bed,
                children_with_extra_bed,
                children_without_extra_bed,
                no_of_rooms,
                ...hotel
              }) => ({
                ...hotel,
                start_date: moment
                  .utc(checkin)
                  .local()
                  .format("YYYY-MM-DD"),
                no_of_nights:
                  moment.utc(checkout).diff(moment.utc(checkin), "days") + 1,
                edited_given_price:
                  hotel.calculated_price !== hotel.given_price,
                rooms_detail: {
                  room_type,
                  adults_with_extra_bed,
                  children_with_extra_bed,
                  children_without_extra_bed,
                  no_of_rooms,
                },
              })
            ),
          }
        : undefined,
      cabs: quote
        ? {
            cabs: quote.cabs.map(({ from_date, to_date, ...cab }) => ({
              edited_given_price: cab.calculated_price !== cab.given_price,
              start_date: moment
                .utc(from_date)
                .local()
                .format("YYYY-MM-DD"),
              no_of_days:
                moment.utc(to_date).diff(moment.utc(from_date), "days") + 1,
              ...cab,
            })),
          }
        : undefined,
      hotel_extras: quote
        ? {
            hotel_extras: quote.hotel_extras.map(
              ({ given_price, date, ...others }) => ({
                ...others,
                price: given_price,
                date: date
                  ? moment
                      .utc(date)
                      .local()
                      .format("YYYY-MM-DD")
                  : undefined,
              })
            ),
          }
        : undefined,
      transport_extras: quote
        ? {
            transport_extras: quote.transport_extras.map(
              ({ given_price, date, ...others }) => ({
                ...others,
                price: given_price,
                date: date
                  ? moment
                      .utc(date)
                      .local()
                      .format("YYYY-MM-DD")
                  : undefined,
              })
            ),
          }
        : undefined,
      other_extras: quote
        ? {
            other_extras: quote.other_extras.map(
              ({ given_price, date, ...others }) => ({
                ...others,
                price: given_price,
                date: date
                  ? moment
                      .utc(date)
                      .local()
                      .format("YYYY-MM-DD")
                  : undefined,
              })
            ),
          }
        : undefined,
    }
  }, [quote])
  const bookingFrom = moment
    .utc(trip.start_date)
    .local()
    .format("YYYY-MM-DD HH:mm:ss")
  const bookingTo = moment
    .utc(trip.end_date)
    .local()
    .format("YYYY-MM-DD HH:mm:ss")
  return (
    <div className="pb-8" ref={containerRef}>
      <h3 className="mb-8">Create a new quote</h3>
      <section className="mb-16">
        <header className="flex">
          <div className="mr-2">
            <span className="inline-flex w-12 h-12 align-items-center justify-content-center bg-primary-600 text-white rounded-full">
              <Icons.BedIcon />
            </span>
          </div>
          <div>
            <h4>Hotels</h4>
            <p>
              Please fill hotel details and get the respective prices. Update
              the given price if necessary.
            </p>
          </div>
        </header>
        <div className="bg-white rounded shadow">
          <div className="mb-8 px-4">
            <CalculateHotelPrice
              bookingFrom={bookingFrom}
              bookingTo={bookingTo}
              initialValues={initialQuote.hotels}
              onChange={handleHotelChange}
            />
          </div>
          <hr />
          <div className="p-4">
            <h5>Any extra services in hotels</h5>
            <p>
              Add any extra services for hotels e.g. special dinner, honeymoon
              cake etc.
            </p>
            <ExtraHotelServices
              bookingFrom={bookingFrom}
              bookingTo={bookingTo}
              initialValues={initialQuote.hotel_extras}
              onChange={handleHotelExtrasChange}
            />
          </div>
        </div>
        <footer>
          <mark className="inline-block">
            Total price for Accommodation:{" "}
            {numberToLocalString(hotelPrice + hotelExtrasPrice)}
          </mark>
        </footer>
      </section>
      <section className="mb-16">
        <header className="flex">
          <div className="mr-2">
            <span className="inline-flex w-12 h-12 align-items-center justify-content-center bg-primary-600 text-white rounded-full">
              <Icons.BusIcon />
            </span>
          </div>
          <div>
            <h4>Transportation</h4>
            <p>
              Please fill the transportation details and click on get price to
              get the corresponding prices. Update given prices if necessary.
            </p>
          </div>
        </header>
        <div className="bg-white rounded shadow">
          <div className="mb-8 px-4">
            <CalculateCabPrice
              bookingFrom={bookingFrom}
              bookingTo={bookingTo}
              initialValues={initialQuote.cabs}
              onChange={handleCabChange}
            />
          </div>
          <hr />
          <div className="p-4">
            <h5>Any extra services in transportation</h5>
            <p>
              Add any extra services like any side destination trip that is
              provided only per customer request
            </p>
            <ExtraTransportServices
              bookingFrom={bookingFrom}
              bookingTo={bookingTo}
              initialValues={initialQuote.transport_extras}
              onChange={handleTransportExtrasChange}
            />
          </div>
        </div>
        <footer>
          <mark className="inline-block">
            Total price for Transportation:{" "}
            {numberToLocalString(cabPrice + transportExtrasPrice)}
          </mark>
        </footer>
      </section>
      <section className="mb-16">
        <header className="flex">
          <div className="mr-2">
            <span className="inline-flex w-12 h-12 align-items-center justify-content-center bg-primary-600 text-white rounded-full">
              <Icons.StarEmptyIcon />
            </span>
          </div>
          <div>
            <h4>Any extra service for this trip</h4>
            <p>
              Add any extra services like off road dinner, side tracking etc
              that are associated with overall trip package
            </p>
          </div>
        </header>
        <div className="bg-white rounded p-4 shadow">
          <ExtraQuoteServices
            bookingFrom={bookingFrom}
            bookingTo={bookingTo}
            initialValues={initialQuote.other_extras}
            onChange={handleOtherExtrasChange}
          />
        </div>
        <footer>
          <mark className="inline-block">
            Extra Stuff Price: {numberToLocalString(otherExtrasPrice)}
          </mark>
        </footer>
      </section>
      <FormGroup>
        <label>Any comments for this quote</label>
        <Input
          name="comments"
          as="textarea"
          value={comments}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setComments(e.target.value)
          }
          placeholder="Any comments regarding customer request or anything special about this quote or anything else..."
          maxLength={191}
        />
      </FormGroup>
      <footer className="mt-16">
        <div className="mb-4">
          <mark className="inline-block font-bold text-2xl">
            Total Cost Price:{" "}
            {numberToLocalString(
              hotelPrice +
                cabPrice +
                hotelExtrasPrice +
                transportExtrasPrice +
                otherExtrasPrice
            )}
          </mark>
        </div>
        <Button className="w-full py-2 text-lg" primary onClick={saveQuote}>
          Create Quote
        </Button>
        {errors ? <p className="text-red-700 my-2">{errors.message}</p> : null}
      </footer>
    </div>
  )
}

export default withXHR(NewQuote)
