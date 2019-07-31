import { createAsyncAction, ActionType } from "typesafe-actions"

import {
  IBaseItem,
  IBaseState,
  IModelState,
  model,
  init,
  createReducer,
  IMeta,
} from "./../model"
import { store as userStore } from "./../Auth"

export const key = "TRIP_PLAN_REQUEST_LIST_STATE"

export interface ITripPlanRequest extends IBaseItem {
  id: number
  name: string
  phone_number: string
  email?: string
  destination?: string
  start_date?: string
  no_of_days?: number
  no_of_adults?: number
  no_of_children?: number
  hotel_preference?: string
  comments?: string
  trip_id?: number
  owner_id?: number
  owner?: userStore.IUser
  assigned_at?: string
  created_at: string
}

export interface ITripPlanRequests extends IBaseState<ITripPlanRequest> {}

export interface IState extends IModelState<ITripPlanRequest> {
  readonly isFetching: boolean
}

export interface IStateWithKey {
  readonly [key]: IState
}

const INITIAL_STATE: IState = {
  isFetching: true,
  state: init<ITripPlanRequest>(),
}

export const actions = {
  list: createAsyncAction(
    "@TRIP_PLAN_REQUESTS/LIST_FETCH_REQUEST",
    "@TRIP_PLAN_REQUESTS/LIST_FETCH_SUCCESS",
    "@TRIP_PLAN_REQUESTS/LIST_FETCH_FAILED"
  )<undefined, { data: ITripPlanRequest[]; meta: IMeta }, Error>(),
  item: createAsyncAction(
    "@TRIP_PLAN_REQUESTS/ITEM_FETCH_REQUEST",
    "@TRIP_PLAN_REQUESTS/ITEM_FETCH_SUCCESS",
    "@TRIP_PLAN_REQUESTS/ITEM_FETCH_FAILED"
  )<undefined, ITripPlanRequest, Error>(),
}

export type TActions = ActionType<typeof actions>

export const reducer = createReducer<ITripPlanRequest, IState>(
  INITIAL_STATE,
  actions as any
)

export function selectors<State extends IStateWithKey>(state: State) {
  const myState: IState = state[key]
  return {
    ...model<ITripPlanRequest>(myState.state),
    get state(): IState {
      return myState
    },
    get isFetching(): boolean {
      return this.state.isFetching
    },
  }
}
