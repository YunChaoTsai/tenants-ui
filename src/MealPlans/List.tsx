import React, { Fragment, useEffect } from "react"
import Helmet from "react-helmet-async"
import { connect } from "react-redux"
import { AxiosInstance } from "axios"
import { RouteComponentProps } from "@reach/router"
import { Omit } from "utility-types"
import { Table, Paginate } from "@tourepedia/ui"

import { IMealPlan, actions, IStateWithKey, selectors } from "./store"
import { ThunkAction, ThunkDispatch } from "./../types"
import { withXHR, XHRProps } from "./../xhr"
import { Async, AsyncProps } from "@tourepedia/select"
import Search, { useSearch } from "../Shared/Search"
import Listable from "../Shared/List"
import { Grid, Col } from "../Shared/Layout"
import { IPaginate } from "../model"

export function XHR(xhr: AxiosInstance) {
  return {
    getMealPlans(params?: any): Promise<{ data: IMealPlan[]; meta: any }> {
      return xhr.get("/meal-plans", { params }).then(resp => resp.data)
    },
  }
}

export const getMealPlans = (
  params?: any
): ThunkAction<Promise<IMealPlan[]>> => (dispatch, getState, { xhr }) => {
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

interface StateProps extends IPaginate {
  mealPlans: IMealPlan[]
  isFetching: boolean
}
interface DispatchProps {
  getMealPlans: (params?: any) => Promise<any>
}
interface OwnProps {}

export const connectWithList = connect<
  StateProps,
  DispatchProps,
  OwnProps,
  IStateWithKey
>(
  state => {
    const mealPlansSelector = selectors(state)
    return {
      ...mealPlansSelector.meta,
      isFetching: mealPlansSelector.isFetching,
      mealPlans: mealPlansSelector.get(),
    }
  },
  (dispatch: ThunkDispatch) => ({
    getMealPlans: (params?: any) => dispatch(getMealPlans(params)),
  })
)

interface ListProps
  extends OwnProps,
    StateProps,
    DispatchProps,
    RouteComponentProps {}
function List({
  getMealPlans,
  mealPlans,
  total,
  from,
  to,
  isFetching,
  currentPage,
  lastPage,
}: ListProps) {
  const [params, setParams] = useSearch()
  useEffect(() => {
    getMealPlans({ page: currentPage })
  }, [])
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

export default connectWithList(List)

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
