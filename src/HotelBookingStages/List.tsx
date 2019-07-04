import React, { Fragment, useEffect, useCallback } from "react"
import Helmet from "react-helmet-async"
import { useSelector } from "react-redux"
import { AxiosInstance } from "axios"
import { RouteComponentProps } from "@reach/router"
import { Omit } from "utility-types"
import { Table, Paginate } from "@tourepedia/ui"

import { IHotelBookingStage, actions, IStateWithKey, selectors } from "./store"
import { ThunkAction } from "./../types"
import { withXHR, XHRProps } from "./../xhr"
import { Async, AsyncProps } from "@tourepedia/select"
import Search, { useSearch } from "../Shared/Search"
import Listable from "../Shared/List"
import { Grid, Col } from "../Shared/Layout"
import { IPaginate } from "../model"
import { useThunkDispatch } from "../utils"

export function XHR(xhr: AxiosInstance) {
  return {
    async getHotelBookingStages(
      params?: any
    ): Promise<{ data: IHotelBookingStage[]; meta: any }> {
      return xhr
        .get("/hotel-booking-stages", { params })
        .then(resp => resp.data)
    },
  }
}

export const getHotelBookingStagesAction = (
  params?: any
): ThunkAction<Promise<IHotelBookingStage[]>> => async (
  dispatch,
  _,
  { xhr }
) => {
  dispatch(actions.list.request())
  return XHR(xhr)
    .getHotelBookingStages(params)
    .then(({ data, meta }) => {
      dispatch(actions.list.success({ data, meta }))
      return data
    })
    .catch(error => {
      dispatch(actions.list.failure(error))
      return Promise.reject(error)
    })
}

function useHotelBookingStagesState() {
  interface StateProps extends IPaginate {
    hotelBookingStages: IHotelBookingStage[]
    isFetching: boolean
  }
  return useSelector<IStateWithKey, StateProps>(state => {
    const hotelBookingStagesSelector = selectors(state)
    return {
      ...hotelBookingStagesSelector.meta,
      isFetching: hotelBookingStagesSelector.isFetching,
      hotelBookingStages: hotelBookingStagesSelector.get(),
    }
  })
}

function useHotelBookingStagesFetch() {
  const dispatch = useThunkDispatch()
  return useCallback(
    (params?: any) => dispatch(getHotelBookingStagesAction(params)),
    [dispatch]
  )
}

export function useHotelBookingStages() {
  return {
    ...useHotelBookingStagesState(),
    fetchHotelBookingStages: useHotelBookingStagesFetch(),
  }
}

export default function List(_: RouteComponentProps) {
  const {
    hotelBookingStages,
    total,
    from,
    to,
    isFetching,
    currentPage,
    lastPage,
    fetchHotelBookingStages: getHotelBookingStages,
  } = useHotelBookingStages()
  const [params, setParams] = useSearch()
  useEffect(() => {
    getHotelBookingStages({ page: currentPage })
  }, [getHotelBookingStages])
  return (
    <Fragment>
      <Helmet>
        <title>Hotel Booking Stages</title>
      </Helmet>
      <Grid>
        <Col>
          <Search
            onSearch={params => {
              setParams(params)
              getHotelBookingStages({ ...params, page: 1 })
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
            onChange={page => getHotelBookingStages({ ...params, page })}
          />
        </Col>
      </Grid>
      <Listable total={total} isFetching={isFetching}>
        <Table
          bordered
          striped
          headers={["Name", "Description"]}
          rows={hotelBookingStages.map(hotelBookingStage => [
            hotelBookingStage.name,
            hotelBookingStage.description,
          ])}
        />
      </Listable>
    </Fragment>
  )
}

interface SelectHotelBookingStageProps
  extends XHRProps,
    Omit<AsyncProps, "fetch"> {}

export const SelectHotelBookingStages = withXHR<SelectHotelBookingStageProps>(
  function SelectHotelBookingStages({
    xhr,
    ...otherProps
  }: SelectHotelBookingStageProps) {
    return (
      <Async
        multiple
        {...otherProps}
        fetch={q =>
          XHR(xhr)
            .getHotelBookingStages({ q })
            .then(resp => resp.data)
        }
      />
    )
  }
)
