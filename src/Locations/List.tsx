import React, { Fragment, useEffect } from "react"
import Helmet from "react-helmet-async"
import { connect } from "react-redux"
import { AxiosInstance } from "axios"
import { RouteComponentProps } from "@reach/router"
import { Omit } from "utility-types"
import { Table, Paginate } from "@tourepedia/ui"

import {
  ILocation,
  ICountry,
  ICountryState,
  ICity,
  actions,
  IStateWithKey,
  selectors,
} from "./store"
import { ThunkAction, ThunkDispatch } from "./../types"
import { Async, AsyncProps } from "@tourepedia/select"
import { withXHR, XHRProps } from "./../xhr"
import Search, { useSearch } from "../Shared/Search"
import Listable from "./../Shared/List"
import { Grid, Col } from "../Shared/Layout"
import { IPaginate } from "../model"

export function XHR(xhr: AxiosInstance) {
  return {
    getLocations(params?: any): Promise<{ data: ILocation[]; meta: any }> {
      return xhr.get("/locations", { params }).then(resp => resp.data)
    },
    getCountries(params?: any): Promise<ICountry[]> {
      return xhr
        .get("/locations/countries", { params })
        .then(({ data }) => data.data)
    },
    getStates(params?: any): Promise<ICountryState[]> {
      return xhr
        .get("/locations/states", { params })
        .then(({ data }) => data.data)
    },
    getCities(params?: any): Promise<ICity[]> {
      return xhr
        .get("/locations/cities", { params })
        .then(({ data }) => data.data)
    },
  }
}

export const getLocations = (
  params?: any
): ThunkAction<Promise<ILocation[]>> => (dispatch, getState, { xhr }) => {
  dispatch(actions.list.request())
  return XHR(xhr)
    .getLocations(params)
    .then(data => {
      dispatch(actions.list.success(data))
      return data.data
    })
    .catch(error => {
      dispatch(actions.list.failure(error))
      return Promise.reject(error)
    })
}

interface StateProps extends IPaginate {
  locations: ILocation[]
  isFetching: boolean
}
interface DispatchProps {
  getLocations: (params?: any) => Promise<ILocation[]>
}
interface OwnProps {}

export const connectWithList = connect<
  StateProps,
  DispatchProps,
  OwnProps,
  IStateWithKey
>(
  state => {
    const locationsSelector = selectors(state)
    return {
      ...locationsSelector.meta,
      isFetching: locationsSelector.isFetching,
      locations: locationsSelector.get(),
    }
  },
  (dispatch: ThunkDispatch) => ({
    getLocations: (params?: any) => dispatch(getLocations(params)),
  })
)

interface ListProps
  extends OwnProps,
    StateProps,
    DispatchProps,
    RouteComponentProps {}
function List({
  getLocations,
  locations,
  total,
  from,
  to,
  isFetching,
  currentPage,
  lastPage,
}: ListProps) {
  const [params, setParams] = useSearch()
  useEffect(() => {
    getLocations({ page: currentPage })
  }, [])
  return (
    <Fragment>
      <Helmet>
        <title>Locations</title>
      </Helmet>
      <Grid>
        <Col>
          <Search
            onSearch={params => {
              setParams(params)
              getLocations({ ...params, page: 1 })
            }}
          />
        </Col>
        <Col className="text-right">
          <Paginate
            total={total}
            from={from}
            to={to}
            currentPage={currentPage}
            lastPage={lastPage}
            isFetching={isFetching}
            onChange={page => getLocations({ ...params, page })}
          />
        </Col>
      </Grid>
      <Listable total={total} isFetching={isFetching}>
        <Table
          striped
          bordered
          headers={["Name", "Latitude", "Longitude"]}
          responsive
          rows={locations.map(location => [
            location.name,
            location.latitude,
            location.longitude,
          ])}
        />
      </Listable>
    </Fragment>
  )
}

export default connectWithList(List)

interface SelectProps extends XHRProps, Omit<AsyncProps, "fetch"> {}

export const SelectLocations = withXHR<SelectProps>(function SelectLocations({
  xhr,
  ...otherProps
}: SelectProps) {
  return (
    <Async
      multiple
      {...otherProps}
      fetch={q =>
        XHR(xhr)
          .getLocations({ q })
          .then(resp => resp.data)
      }
    />
  )
})

export const SelectCountries = withXHR<SelectProps>(function SelectCountries({
  xhr,
  ...otherProps
}: SelectProps) {
  return (
    <Async multiple {...otherProps} fetch={q => XHR(xhr).getCountries({ q })} />
  )
})

export const SelectStates = withXHR<SelectProps>(function SelectStates({
  xhr,
  ...otherProps
}: SelectProps) {
  return (
    <Async multiple {...otherProps} fetch={q => XHR(xhr).getStates({ q })} />
  )
})

export const SelectCities = withXHR<SelectProps>(function SelectCities({
  xhr,
  ...otherProps
}: SelectProps) {
  return (
    <Async multiple {...otherProps} fetch={q => XHR(xhr).getCities({ q })} />
  )
})
