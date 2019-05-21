import React, { useEffect, Fragment } from "react"
import { RouteComponentProps, Link } from "@reach/router"
import { connect } from "react-redux"
import { AxiosInstance } from "axios"
import moment from "moment"
import Helmet from "react-helmet-async"

import { ITrip, IStateWithKey, actions, selectors } from "./store"
import { ThunkAction, ThunkDispatch } from "./../types"
import Paginate, { PaginateProps } from "../Shared/Paginate"
import Search, { useSearch } from "../Shared/Search"
import Listable from "./../Shared/List"
import { Table } from "../Shared/Table"

export function XHR(xhr: AxiosInstance) {
  return {
    getTrips(params?: any): Promise<{ data: ITrip[]; meta: any }> {
      return xhr.get("/trips", { params }).then(resp => resp.data)
    },
  }
}

export const getTrips = (params?: any): ThunkAction<Promise<ITrip[]>> => (
  dispatch,
  getState,
  { xhr }
) => {
  dispatch(actions.list.request())
  return XHR(xhr)
    .getTrips(params)
    .then(trips => {
      dispatch(actions.list.success(trips))
      return trips.data
    })
    .catch(error => {
      dispatch(actions.list.failure(error))
      return Promise.reject(error)
    })
}

interface StateProps extends PaginateProps {
  trips: ITrip[]
}
interface DispatchProps {
  getTrips: (params?: any) => Promise<ITrip[]>
}
interface OwnProps extends RouteComponentProps {}

interface ListProps extends StateProps, DispatchProps, OwnProps {}

export const connectWithList = connect<
  StateProps,
  DispatchProps,
  OwnProps,
  IStateWithKey
>(
  state => {
    const tripSelector = selectors(state)
    return {
      ...tripSelector.meta,
      isFetching: tripSelector.isFetching,
      trips: tripSelector.get(),
    }
  },
  (dispatch: ThunkDispatch) => ({
    getTrips: (params?: any) => dispatch(getTrips(params)),
  })
)

function List({ trips, getTrips, ...otherProps }: ListProps) {
  const { isFetching, total, currentPage } = otherProps
  const [params, setParams] = useSearch()
  useEffect(() => {
    getTrips({ page: currentPage })
  }, [])
  return (
    <Fragment>
      <Helmet>
        <title>List of trips</title>
      </Helmet>
      <div className="display--flex justify-content--space-between">
        <Search
          onSearch={params => {
            setParams(params)
            getTrips({ ...params, page: 1 })
          }}
        />
        <Paginate
          {...otherProps}
          onChange={page => getTrips({ ...params, page })}
        />
      </div>
      <Listable total={total} isFetching={isFetching}>
        <Table
          responsive
          headers={["ID", "Dates", "Stages", "Destinations", "Traveler", "Pax"]}
          rows={trips.map(
            ({
              id,
              trip_source,
              trip_id,
              start_date,
              end_date,
              locations,
              no_of_adults,
              children,
              contact,
              latest_stage,
            }) => [
              <Link to={id.toString()}>
                {trip_source.short_name}-{trip_id || id}
              </Link>,
              `${moment
                .utc(start_date)
                .local()
                .format("DD/MM/YYYY")} to ${moment
                .utc(end_date)
                .local()
                .format("DD/MM/YYYY")}`,
              latest_stage ? latest_stage.name : "Initiated",
              locations.map(l => l.short_name).join(" • "),
              contact ? (
                <div>
                  {contact.name}
                  <br />
                  <a href={`tel:${contact.phone_number}`}>&#128222;</a>
                  <a href={`mailto:${contact.email}`}>&#9993;</a>
                </div>
              ) : null,
              `${no_of_adults} Adults${children ? " with " + children : ""}`,
            ]
          )}
        />
      </Listable>
    </Fragment>
  )
}

export default connectWithList(List)
