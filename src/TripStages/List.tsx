import React, { Fragment, useEffect, useCallback } from "react"
import Helmet from "react-helmet-async"
import { AxiosInstance } from "axios"
import { RouteComponentProps } from "@reach/router"
import { Omit } from "utility-types"
import { Table, Paginate } from "@tourepedia/ui"

import { ITripStage, actions, IStateWithKey, selectors } from "./store"
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
    async getTripStages(
      params?: any
    ): Promise<{ data: ITripStage[]; meta: any }> {
      return xhr.get("/trip-stages", { params }).then(resp => resp.data)
    },
  }
}

export const getTripStagesAction = (
  params?: any
): ThunkAction<Promise<ITripStage[]>> => async (dispatch, _, { xhr }) => {
  dispatch(actions.list.request())
  return XHR(xhr)
    .getTripStages(params)
    .then(tripStages => {
      dispatch(actions.list.success(tripStages))
      return tripStages.data
    })
    .catch(error => {
      dispatch(actions.list.failure(error))
      return Promise.reject(error)
    })
}

function useTripStagesState() {
  interface StateProps extends IPaginate {
    tripStages: ITripStage[]
  }
  return useSelector<IStateWithKey, StateProps>(state => {
    const tripStagesSelector = selectors(state)
    return {
      ...tripStagesSelector.meta,
      isFetching: tripStagesSelector.isFetching,
      tripStages: tripStagesSelector.get(),
    }
  })
}

function useTripStagesFetch() {
  const dispatch = useThunkDispatch()
  return useCallback((params?: any) => dispatch(getTripStagesAction(params)), [
    dispatch,
  ])
}

function useTripStages() {
  return {
    ...useTripStagesState(),
    fetchTripStages: useTripStagesFetch(),
  }
}

export default function List({  }: RouteComponentProps) {
  const [params, setParams] = useSearch()
  const {
    fetchTripStages: getTripStages,
    tripStages,
    total,
    from,
    to,
    currentPage,
    lastPage,
    isFetching,
  } = useTripStages()
  useEffect(() => {
    getTripStages({ page: currentPage })
  }, [getTripStages])
  return (
    <Fragment>
      <Helmet>
        <title>Trip Stages</title>
      </Helmet>
      <Grid>
        <Col>
          <Search
            onSearch={params => {
              setParams(params)
              getTripStages({ ...params, page: 1 })
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
            onChange={page => getTripStages({ ...params, page })}
          />
        </Col>
      </Grid>
      <Listable total={total} isFetching={isFetching}>
        <Table
          striped
          bordered
          headers={["Name", "Description"]}
          rows={tripStages.map(tripStage => [
            tripStage.name,
            tripStage.description,
          ])}
        />
      </Listable>
    </Fragment>
  )
}

interface SelectTripStagesProps extends XHRProps, Omit<AsyncProps, "fetch"> {}

export const SelectTripStages = withXHR<SelectTripStagesProps>(
  function SelectTripStages({ xhr, ...otherProps }: SelectTripStagesProps) {
    return (
      <Async
        multiple
        {...otherProps}
        fetch={q =>
          XHR(xhr)
            .getTripStages({ q })
            .then(resp => resp.data)
        }
      />
    )
  }
)
