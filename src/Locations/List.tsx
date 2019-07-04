import React, { Fragment, useEffect, useCallback } from "react"
import Helmet from "react-helmet-async"
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
import { ThunkAction } from "./../types"
import { Async, AsyncProps } from "@tourepedia/select"
import { withXHR, XHRProps } from "./../xhr"
import Search, { useSearch } from "../Shared/Search"
import Listable from "./../Shared/List"
import { Grid, Col } from "../Shared/Layout"
import { IPaginate } from "../model"
import { useSelector } from "react-redux"
import { useThunkDispatch } from "../utils"

export function XHR(xhr: AxiosInstance) {
  return {
    async getLocations(
      params?: any
    ): Promise<{ data: ILocation[]; meta: any }> {
      return xhr.get("/locations", { params }).then(resp => resp.data)
    },
    async getCountries(params?: any): Promise<ICountry[]> {
      return xhr
        .get("/locations/countries", { params })
        .then(({ data }) => data.data)
    },
    async getStates(params?: any): Promise<ICountryState[]> {
      return xhr
        .get("/locations/states", { params })
        .then(({ data }) => data.data)
    },
    async getCities(params?: any): Promise<ICity[]> {
      return xhr
        .get("/locations/cities", { params })
        .then(({ data }) => data.data)
    },
  }
}

export const getLocationsAction = (
  params?: any
): ThunkAction<Promise<ILocation[]>> => async (dispatch, _, { xhr }) => {
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

function useLocationsState() {
  interface StateProps extends IPaginate {
    locations: ILocation[]
    isFetching: boolean
  }
  return useSelector<IStateWithKey, StateProps>(state => {
    const locationsSelector = selectors(state)
    return {
      ...locationsSelector.meta,
      isFetching: locationsSelector.isFetching,
      locations: locationsSelector.get(),
    }
  })
}

function useLocationsFetch() {
  const dispatch = useThunkDispatch()
  return useCallback((params?: any) => dispatch(getLocationsAction(params)), [
    dispatch,
  ])
}

function useLocations() {
  return {
    ...useLocationsState(),
    fetchLocations: useLocationsFetch(),
  }
}

export default function List(_: RouteComponentProps) {
  const {
    locations,
    total,
    from,
    to,
    isFetching,
    currentPage,
    lastPage,
    fetchLocations: getLocations,
  } = useLocations()
  const [params, setParams] = useSearch()
  useEffect(() => {
    getLocations({ page: currentPage })
  }, [getLocations])
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
