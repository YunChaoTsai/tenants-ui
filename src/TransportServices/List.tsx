import React, { Fragment, useEffect, useCallback } from "react"
import Helmet from "react-helmet-async"
import { AxiosInstance } from "axios"
import { RouteComponentProps } from "@reach/router"
import { Omit } from "utility-types"
import { Table, Paginate } from "@tourepedia/ui"

import { ITransportService, actions, IStateWithKey, selectors } from "./store"
import { ThunkAction } from "./../types"
import { withXHR, XHRProps } from "./../xhr"
import { Async, AsyncProps } from "@tourepedia/select"
import Search, { useSearch } from "../Shared/Search"
import Listable from "../Shared/List"
import { Grid, Col } from "../Shared/Layout"
import { IPaginate } from "../model"
import { useSelector } from "react-redux"
import { useThunkDispatch } from "../utils"

export function XHR(xhr: AxiosInstance) {
  return {
    async getTransportServices(
      params?: any
    ): Promise<{ data: ITransportService[]; meta: any }> {
      return xhr.get("/transport-services", { params }).then(resp => resp.data)
    },
  }
}

export const getTransportServicesAction = (
  params?: any
): ThunkAction<Promise<ITransportService[]>> => async (
  dispatch,
  _,
  { xhr }
) => {
  dispatch(actions.list.request())
  return XHR(xhr)
    .getTransportServices(params)
    .then(data => {
      dispatch(actions.list.success(data))
      return data.data
    })
    .catch(error => {
      dispatch(actions.list.failure(error))
      return Promise.reject(error)
    })
}

function useTransportServicesState() {
  interface StateProps extends IPaginate {
    transportServices: ITransportService[]
  }
  return useSelector<IStateWithKey, StateProps>(state => {
    const transportServicesSelector = selectors(state)
    return {
      ...transportServicesSelector.meta,
      isFetching: transportServicesSelector.isFetching,
      transportServices: transportServicesSelector.get(),
    }
  })
}

function useTransportServicesFetch() {
  const dispatch = useThunkDispatch()
  return useCallback(
    (params?: any) => dispatch(getTransportServicesAction(params)),
    [dispatch]
  )
}

function useTransportServices() {
  const state = useTransportServicesState()
  const fetchTransportServices = useTransportServicesFetch()
  return {
    ...state,
    fetchTransportServices,
  }
}

export default function List({  }: RouteComponentProps) {
  const {
    fetchTransportServices: getTransportServices,
    transportServices,
    total,
    from,
    to,
    currentPage,
    lastPage,
    isFetching,
  } = useTransportServices()
  const [params, setParams] = useSearch()
  useEffect(() => {
    getTransportServices({ page: currentPage })
  }, [getTransportServices])
  return (
    <Fragment>
      <Helmet>
        <title>Transport Services List</title>
      </Helmet>
      <Grid>
        <Col>
          <Search
            onSearch={params => {
              setParams(params)
              getTransportServices({ ...params, page: 1 })
            }}
          />
        </Col>
        <Col className="text-right">
          <Paginate
            total={total}
            from={from}
            to={to}
            isFetching={isFetching}
            currentPage={currentPage}
            lastPage={lastPage}
            onChange={page => getTransportServices({ ...params, page })}
          />
        </Col>
      </Grid>
      <Listable total={total} isFetching={isFetching}>
        <Table
          responsive
          striped
          bordered
          headers={["Destinations", "Distance (kms)"]}
          alignCols={{ 1: "right" }}
          rows={transportServices.map(({ name, comments, distance }) => [
            <div>
              {name}
              {comments ? <blockquote>{comments}</blockquote> : null}
            </div>,
            distance,
          ])}
        />
      </Listable>
    </Fragment>
  )
}

interface SelectTransportServicesProps
  extends XHRProps,
    Omit<AsyncProps, "fetch"> {}

export const SelectTransportServices = withXHR<SelectTransportServicesProps>(
  function SelectTransportServices({
    xhr,
    ...otherProps
  }: SelectTransportServicesProps) {
    return (
      <Async
        multiple
        {...otherProps}
        fetch={q =>
          XHR(xhr)
            .getTransportServices({ q })
            .then(resp => resp.data)
        }
      />
    )
  }
)
