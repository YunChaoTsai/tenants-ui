import React, { useState } from "react"
import { RouteComponentProps } from "@reach/router"
import { AxiosInstance } from "axios"
import Button from "@tourepedia/button"

import { withXHR, XHRProps } from "./../xhr"
import { ITrip, IQuote } from "./store"
import { CalculatePriceForm as CalculateHotelPrice } from "./../Hotels"
import { CalculatePriceForm as CalculateCabPrice } from "./../CabTypes"
import { Input } from "./../Shared/InputField"

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
      <footer>Price: {hotelPrice}</footer>
      <h4>Calculate Prices for Cabs</h4>
      <CalculateCabPrice
        onChange={(cabPrice, cabs) => {
          setCabPrice(cabPrice)
          setCabs(cabs)
        }}
      />
      <footer>Price: {cabPrice}</footer>
      <hr />
      <b>Total: {hotelPrice + cabPrice}</b>
      <div>
        <label>Any Comment</label>
        <Input
          name="comments"
          value={comments}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setComments(e.target.value)
          }
          maxLength={191}
        />
      </div>
      <Button onClick={saveQuote}>Save Quote</Button>
    </div>
  )
}

export default withXHR(NewQuote)
