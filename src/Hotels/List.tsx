import React, { useEffect, Fragment } from "react"
import { connect } from "react-redux"
import { RouteComponentProps, Link } from "@reach/router"
import { AxiosInstance } from "axios"
import { Omit } from "utility-types"

import {
  IHotel,
  hotelActions as actions,
  IStateWithKey,
  selectors,
} from "./store"
import { ThunkAction, ThunkDispatch } from "./../types"
import { withXHR, XHRProps } from "./../xhr"
import { Async, AsyncProps } from "./../Shared/Select"
import { List as Listable } from "./../Shared/List"
import { Paginate, PaginateProps } from "./../Shared/Paginate"
import { Search, useSearch } from "./../Shared/Search"
import Helmet from "react-helmet-async"

export function XHR(xhr: AxiosInstance) {
  return {
    getHotels(params?: any): Promise<{ data: IHotel[]; meta: any }> {
      return xhr.get("/hotels", { params }).then(resp => resp.data)
    },
  }
}

export const getHotels = (params?: any): ThunkAction<Promise<IHotel[]>> => (
  dispatch,
  getState,
  { xhr }
) => {
  dispatch(actions.list.request())
  return XHR(xhr)
    .getHotels(params)
    .then(({ data, meta }) => {
      dispatch(actions.list.success({ data, meta }))
      return data
    })
    .catch(error => {
      dispatch(actions.list.failure(error))
      return Promise.reject(error)
    })
}

interface StateProps extends PaginateProps {
  hotels: IHotel[]
}
interface DispatchProps {
  getHotels: (params?: any) => Promise<IHotel[]>
}

interface OwnProps {}

export const connectWithList = connect<
  StateProps,
  DispatchProps,
  OwnProps,
  IStateWithKey
>(
  state => {
    const hotelsSelector = selectors(state).hotels
    return {
      ...hotelsSelector.meta,
      isFetching: hotelsSelector.isFetching,
      hotels: hotelsSelector.get(),
    }
  },
  (dispatch: ThunkDispatch) => ({
    getHotels: (params?: any) => dispatch(getHotels(params)),
  })
)

interface ListProps
  extends StateProps,
    DispatchProps,
    OwnProps,
    RouteComponentProps {}

function List({ getHotels, hotels, ...otherProps }: ListProps) {
  const { currentPage, total, isFetching } = otherProps
  const [params, setParams] = useSearch()
  useEffect(() => {
    getHotels({ page: currentPage })
  }, [])
  return (
    <Fragment>
      <Helmet>
        <title>Hotels List</title>
      </Helmet>
      <div className="display--flex justify-content--space-between">
        <Search
          onSearch={params => {
            setParams(params)
            getHotels({ ...params, page: 1 })
          }}
        />
        <Paginate
          {...otherProps}
          onChange={page => getHotels({ ...params, page })}
        />
      </div>
      <Listable isFetching={isFetching} total={total}>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Meal Plans</th>
              <th>Room Types</th>
              <th>Child extra bed age</th>
            </tr>
          </thead>
          <tbody>
            {hotels.map(hotel => (
              <tr key={hotel.id}>
                <td>
                  <Link to={hotel.id.toString()}>{hotel.name}</Link>
                  <br />
                  {hotel.location.short_name} • {hotel.stars} stars
                </td>
                <td>
                  {hotel.meal_plans.map(mealPlan => mealPlan.name).join(" • ")}
                </td>
                <td>
                  {hotel.room_types.map(roomType => roomType.name).join(" • ")}
                </td>
                <td>
                  {hotel.extra_bed_child_age_start}-
                  {hotel.extra_bed_child_age_end}yo
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Listable>
    </Fragment>
  )
}

export default connectWithList(List)

interface SelectLocationsProps extends XHRProps, Omit<AsyncProps, "fetch"> {}

export const SelectHotels = withXHR<SelectLocationsProps>(
  function SelectHotels({ xhr, ...otherProps }: SelectLocationsProps) {
    return (
      <Async
        multiple
        {...otherProps}
        fetch={q =>
          XHR(xhr)
            .getHotels({ q })
            .then(resp => resp.data)
        }
      />
    )
  }
)
