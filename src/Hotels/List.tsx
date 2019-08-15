import React, { useEffect, Fragment, useCallback } from "react"
import { useSelector } from "react-redux"
import { RouteComponentProps, Link } from "@reach/router"
import { AxiosInstance } from "axios"
import { Omit } from "utility-types"
import { Table, Paginate } from "@tourepedia/ui"

import { IHotel, actions, IStateWithKey, selectors } from "./store"
import { ThunkAction } from "./../types"
import { withXHR, XHRProps } from "./../xhr"
import { Async, AsyncProps } from "@tourepedia/select"
import { List as Listable } from "./../Shared/List"
import { Search, useSearch } from "./../Shared/Search"
import Helmet from "react-helmet-async"
import { Grid, Col } from "../Shared/Layout"
import { IPaginate } from "./../model"
import { useThunkDispatch } from "../utils"

export function XHR(xhr: AxiosInstance) {
  return {
    async getHotels(params?: any): Promise<{ data: IHotel[]; meta: any }> {
      return xhr.get("/hotels", { params }).then(resp => resp.data)
    },
  }
}

export const getHotelsAction = (
  params?: any
): ThunkAction<Promise<IHotel[]>> => async (dispatch, _, { xhr }) => {
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

function useHotelsState() {
  interface StateProps extends IPaginate {
    hotels: IHotel[]
    isFetching: boolean
  }
  return useSelector<IStateWithKey, StateProps>(state => {
    const hotelsSelector = selectors(state)
    return {
      ...hotelsSelector.meta,
      isFetching: hotelsSelector.isFetching,
      hotels: hotelsSelector.get(),
    }
  })
}
function useHotelsFetch() {
  const dispatch = useThunkDispatch()
  return useCallback((params?: any) => dispatch(getHotelsAction(params)), [
    dispatch,
  ])
}

export function useHotels() {
  return {
    ...useHotelsState(),
    fetchHotels: useHotelsFetch(),
  }
}

export default function List({  }: RouteComponentProps) {
  const {
    hotels,
    total,
    from,
    to,
    lastPage,
    currentPage,
    isFetching,
    fetchHotels: getHotels,
  } = useHotels()
  const [params, setParams] = useSearch()
  useEffect(() => {
    getHotels({ page: currentPage })
  }, [getHotels])
  return (
    <Fragment>
      <Helmet>
        <title>Hotels List</title>
      </Helmet>
      <Grid>
        <Col>
          <Search
            onSearch={params => {
              setParams(params)
              getHotels({ ...params, page: 1 })
            }}
          />
        </Col>
        <Col className="text-right">
          <Paginate
            total={total}
            isFetching={isFetching}
            currentPage={currentPage}
            from={from}
            to={to}
            lastPage={lastPage}
            onChange={page => getHotels({ ...params, page })}
          />
        </Col>
      </Grid>
      <Listable isFetching={isFetching} total={total}>
        <Table
          responsive
          striped
          bordered
          headers={["Name", "Meal Plans", "Room Type", "Child extra bed age"]}
          rows={hotels.map(hotel => [
            <Fragment>
              <h4 className="text-base">
                <Link to={hotel.id.toString()}>{hotel.name}</Link>
              </h4>
              {hotel.location.short_name} • {hotel.stars} stars
            </Fragment>,
            hotel.meal_plans.map(mealPlan => mealPlan.name).join(" • "),
            hotel.room_types.map(roomType => roomType.name).join(" • "),
            <Fragment>
              {hotel.extra_bed_child_age_start}-{hotel.extra_bed_child_age_end}
              yo
            </Fragment>,
          ])}
        />
      </Listable>
    </Fragment>
  )
}

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
