import React, { Fragment, useEffect, useCallback } from "react"
import Helmet from "react-helmet-async"
import { AxiosInstance } from "axios"
import { RouteComponentProps } from "@reach/router"
import { Omit } from "utility-types"
import { Table, Paginate } from "@tourepedia/ui"

import { IMealPlan, actions, IStateWithKey, selectors } from "./store"
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
    async getMealPlans(
      params?: any
    ): Promise<{ data: IMealPlan[]; meta: any }> {
      return xhr.get("/meal-plans", { params }).then(resp => resp.data)
    },
  }
}

export const getMealPlansAction = (
  params?: any
): ThunkAction<Promise<IMealPlan[]>> => async (dispatch, _, { xhr }) => {
  dispatch(actions.list.request())
  return XHR(xhr)
    .getMealPlans(params)
    .then(({ data, meta }) => {
      dispatch(actions.list.success({ data, meta }))
      return data
    })
    .catch(error => {
      dispatch(actions.list.failure(error))
      return Promise.reject(error)
    })
}

function useMealPlansState() {
  interface StateProps extends IPaginate {
    mealPlans: IMealPlan[]
    isFetching: boolean
  }
  return useSelector<IStateWithKey, StateProps>(state => {
    const mealPlansSelector = selectors(state)
    return {
      ...mealPlansSelector.meta,
      isFetching: mealPlansSelector.isFetching,
      mealPlans: mealPlansSelector.get(),
    }
  })
}

function useMealPlansFetch() {
  const dispatch = useThunkDispatch()
  return useCallback((params?: any) => dispatch(getMealPlansAction(params)), [
    dispatch,
  ])
}

export function useMealPlans() {
  return {
    ...useMealPlansState(),
    fetchMealPlans: useMealPlansFetch(),
  }
}

export default function List({  }: RouteComponentProps) {
  const {
    mealPlans,
    total,
    from,
    to,
    isFetching,
    currentPage,
    lastPage,
    fetchMealPlans: getMealPlans,
  } = useMealPlans()
  const [params, setParams] = useSearch()
  useEffect(() => {
    getMealPlans({ page: currentPage })
  }, [getMealPlans])
  return (
    <Fragment>
      <Helmet>
        <title>Meal Plans</title>
      </Helmet>
      <Grid>
        <Col>
          <Search
            onSearch={params => {
              setParams(params)
              getMealPlans({ ...params, page: 1 })
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
            onChange={page => getMealPlans({ ...params, page })}
          />
        </Col>
      </Grid>
      <Listable total={total} isFetching={isFetching}>
        <Table
          striped
          bordered
          headers={["Name", "Description"]}
          rows={mealPlans.map(mealPlan => [
            mealPlan.name,
            mealPlan.description,
          ])}
        />
      </Listable>
    </Fragment>
  )
}

interface SelectMealPlanProps extends XHRProps, Omit<AsyncProps, "fetch"> {}

export const SelectMealPlans = withXHR<SelectMealPlanProps>(
  function SelectMealPlans({ xhr, ...otherProps }: SelectMealPlanProps) {
    return (
      <Async
        multiple
        {...otherProps}
        fetch={q =>
          XHR(xhr)
            .getMealPlans({ q })
            .then(resp => resp.data)
        }
      />
    )
  }
)
