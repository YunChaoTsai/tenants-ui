import React, { useEffect, useState, Fragment } from "react"
import { RouteComponentProps } from "@reach/router"
import { AxiosInstance } from "axios"
import moment from "moment"

import { ITrip, IGivenQuote } from "./store"
import { withXHR, XHRProps } from "./../xhr"
import { Quote } from "./Quotes"
import Button from "@tourepedia/button"
import { Table } from "../Shared/Table"
import { useFetch } from "../hooks"
import Spinner from "./../Shared/Spinner"
import { numberToLocalString } from "../utils"

export interface IInstalment {
  amount: number
  due_date: string
}

export function XHR(xhr: AxiosInstance) {
  return {
    getGivenQuotes(params?: any): Promise<IGivenQuote[]> {
      return xhr.get("/given-quotes", { params }).then(resp => resp.data.data)
    },
    getInstalments(
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

export const GivenQuote = withXHR(function GivenQuote({
  givenQuote,
  xhr,
  readOnly,
  showHotelBookingStatus,
}: XHRProps & {
  givenQuote: IGivenQuote
  readOnly?: boolean
  showHotelBookingStatus?: boolean
}) {
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
  ] = useFetch<IInstalment[]>(() =>
    XHR(xhr)
      .getInstalments(id)
      .then(resp => resp.data)
  )
  return (
    <div>
      <h5>
        Given Price: <mark>INR {numberToLocalString(given_price)} /-</mark>
      </h5>
      {comments ? <blockquote>{comments}</blockquote> : null}
      <p>
        <em>
          on{" "}
          {moment
            .utc(created_at)
            .local()
            .format("DD MMM, YYYY [at] hh:mm A")}{" "}
          by {created_by.name}&lt;{created_by.email}&gt;
        </em>
      </p>
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
})

interface QuotesProps extends RouteComponentProps, XHRProps {
  trip: ITrip
}
function Quotes({ xhr, trip }: QuotesProps) {
  const [givenQuotes, setGivenQuotes] = useState<IGivenQuote[]>([])
  function getGivenQuotes() {
    XHR(xhr)
      .getGivenQuotes({ trip_id: trip.id })
      .then(setGivenQuotes)
  }
  useEffect(() => {
    getGivenQuotes()
  }, [])
  return (
    <Fragment>
      <h4>Given Quotes</h4>
      {givenQuotes.length === 0 ? (
        <p className="text--center">No quote given yet</p>
      ) : (
        <ol className="list list--bordered">
          {givenQuotes.map(givenQuote => (
            <li key={givenQuote.id}>
              <GivenQuote givenQuote={givenQuote} />
            </li>
          ))}
        </ol>
      )}
    </Fragment>
  )
}

export default withXHR(Quotes)
