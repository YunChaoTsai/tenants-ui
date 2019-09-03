import React, { useEffect, useState, Fragment } from "react"
import { RouteComponentProps } from "@reach/router"
import { AxiosInstance } from "axios"
import moment from "moment"

import { ITrip, IGivenQuote } from "./store"
import { useXHR } from "./../xhr"
import { Quote } from "./Quotes"
import { Button, Table, useFetchState, Icons } from "@tourepedia/ui"
import Spinner from "./../Shared/Spinner"
import { numberToLocalString } from "../utils"

export interface IInstalment {
  amount: number
  due_date: string
}

export function XHR(xhr: AxiosInstance) {
  return {
    async getGivenQuotes(params?: any): Promise<IGivenQuote[]> {
      return xhr.get("/given-quotes", { params }).then(resp => resp.data.data)
    },
    async getInstalments(
      givenQuoteId: number
    ): Promise<{
      data: IInstalment[]
      meta: { total: number }
    }> {
      return xhr
        .get(`/given-quote-instalments/${givenQuoteId}`)
        .then(resp => resp.data)
    },
  }
}

export function GivenQuote({
  givenQuote,
  readOnly,
  showHotelBookingStatus,
}: {
  givenQuote: IGivenQuote
  readOnly?: boolean
  showHotelBookingStatus?: boolean
}) {
  const xhr = useXHR()
  const {
    id,
    given_price,
    quote,
    comments,
    created_by,
    created_at,
  } = givenQuote
  const [
    instalments,
    fetchInstalments,
    { isFetching: isFetchingInstalments },
  ] = useFetchState<IInstalment[]>(() =>
    XHR(xhr)
      .getInstalments(id)
      .then(resp => resp.data)
  )
  return (
    <div>
      <header className="mb-8">
        <h5>
          Given Price:{" "}
          <mark>
            <Icons.RupeeIcon /> {numberToLocalString(given_price)} /-
          </mark>
        </h5>
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
      <Quote
        quote={quote}
        readOnly
        showHotelBookingStatus={showHotelBookingStatus}
      />
      {readOnly ? null : (
        <Button onClick={fetchInstalments}>
          Get Instalments for Customer{" "}
          {isFetchingInstalments ? <Spinner /> : null}
        </Button>
      )}
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
    </div>
  )
}

interface QuotesProps extends RouteComponentProps {
  trip: ITrip
}
export default function Quotes({ trip }: QuotesProps) {
  const [givenQuotes, setGivenQuotes] = useState<IGivenQuote[]>([])
  const xhr = useXHR()
  function getGivenQuotes() {
    XHR(xhr)
      .getGivenQuotes({ trip_id: trip.id })
      .then(setGivenQuotes)
  }
  useEffect(() => {
    getGivenQuotes()
  }, [])
  return (
    <div className="mt-4">
      {givenQuotes.length === 0 ? (
        <p className="text-center">No quote given yet</p>
      ) : (
        <ol>
          {givenQuotes.map(givenQuote => (
            <li
              key={givenQuote.id}
              className="p-4 shadow rounded mb-8 bg-white"
            >
              <GivenQuote givenQuote={givenQuote} />
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}
