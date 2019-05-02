import React, { Fragment, useEffect } from "react"
import Helmet from "react-helmet-async"
import { connect } from "react-redux"
import { AxiosInstance } from "axios"
import { RouteComponentProps } from "@reach/router"
import { Omit } from "utility-types"

import { IMealPlan, actions, IStateWithKey, selectors } from "./store"
import { ThunkAction, ThunkDispatch } from "./../types"
import { withXHR, XHRProps } from "./../xhr"
import { Async, AsyncProps } from "./../Shared/Select"
import Paginate, { PaginateProps } from "../Shared/Paginate"
import Search, { useSearch } from "../Shared/Search"
import Listable from "../Shared/List"

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

interface StateProps extends PaginateProps {
  mealPlans: IMealPlan[]
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
function List({ getMealPlans, mealPlans, ...otherProps }: ListProps) {
  const { isFetching, total, currentPage } = otherProps
  const [params, setParams] = useSearch()
  useEffect(() => {
    getMealPlans({ page: currentPage })
  }, [])
  return (
    <Fragment>
      <Helmet>
        <title>Meal Plans</title>
      </Helmet>
      <div className="display--flex justify-content--space-between">
        <Search
          onSearch={params => {
            setParams(params)
            getMealPlans({ ...params, page: 1 })
          }}
        />
        <Paginate
          {...otherProps}
          onChange={page => getMealPlans({ ...params, page })}
        />
      </div>
      <Listable total={total} isFetching={isFetching}>
        <dl>
          {mealPlans.map(mealPlan => (
            <Fragment key={mealPlan.id}>
              <dt>{mealPlan.name}</dt>
              <dd>{mealPlan.description}</dd>
            </Fragment>
          ))}
        </dl>
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
