import React, { useState } from "react"
import { RouteComponentProps } from "@reach/router"
import { AxiosInstance } from "axios"
import Button from "@tourepedia/button"

import { withXHR, XHRProps } from "./../xhr"
import { ITrip, IQuote } from "./store"
import { CalculatePriceForm as CalculateHotelPrice } from "./../Hotels"
import { CalculatePriceForm as CalculateCabPrice } from "./../TransportServicePrices"
import { Input, FormGroup } from "./../Shared/InputField"

export function XHR(xhr: AxiosInstance) {
  return {
    saveQuote(tripId: string | number, data: any): Promise<IQuote> {
      return xhr
        .post(`/trips/${tripId}/quotes`, data)
        .then(resp => resp.data.quote)
    },
  }
}

interface NewQuoteProps extends RouteComponentProps, XHRProps {
  trip: ITrip
}
function NewQuote({ xhr, navigate, trip }: NewQuoteProps) {
  const [hotelPrice, setHotelPrice] = useState<number>(0)
  const [cabPrice, setCabPrice] = useState<number>(0)
  const [hotels, setHotels] = useState<any>([])
  const [cabs, setCabs] = useState<any>([])
  const [comments, setComments] = useState<string>("")
  function saveQuote() {
    XHR(xhr)
      .saveQuote(trip.id, {
        total_price: hotelPrice + cabPrice,
        hotels,
        cabs,
        comments,
      })
      .then(resp => {
        navigate && navigate("../quotes")
      })
  }
  return (
    <div>
      <h4>Calculate Prices for hotels</h4>
      <CalculateHotelPrice
        onChange={(hotelPrice, hotels) => {
          setHotelPrice(hotelPrice)
          setHotels(hotels)
        }}
      />
      <mark>Hotel Price: {hotelPrice}</mark>
      <h4>Calculate Prices for Cabs</h4>
      <CalculateCabPrice
        onChange={(cabPrice, cabs) => {
          setCabPrice(cabPrice)
          setCabs(cabs)
        }}
      />
      <mark>Cab Price: {cabPrice}</mark>
      <hr />
      <h3>
        <mark>Total Price: {hotelPrice + cabPrice}</mark>
      </h3>
      <hr />
      <FormGroup>
        <label>Any Comment</label>
        <Input
          name="comments"
          as="textarea"
          value={comments}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setComments(e.target.value)
          }
          maxLength={191}
        />
      </FormGroup>
      <Button primary onClick={saveQuote}>
        Save Quote
      </Button>
    </div>
  )
}

export default withXHR(NewQuote)
