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
import { store as userStore } from "./../Users"

export const key = "TENANT_LIST_STATE"

export interface ITenant extends IBaseItem {
  id: number
  name: string
  description: string
  invited_at?: string
  users?: Array<userStore.IUser>
}

export interface ITenants extends IBaseState<ITenant> {}

export interface IState extends IModelState<ITenant> {
  readonly isFetching: boolean
}

export interface IStateWithKey {
  readonly [key]: IState
}

const INITIAL_STATE: IState = {
  isFetching: true,
  state: init<ITenant>(),
}

export const actions = {
  list: createAsyncAction(
    "@TENANTS/LIST_FETCH_REQUEST",
    "@TENANTS/LIST_FETCH_SUCCESS",
    "@TENANTS/LIST_FETCH_FAILED"
  )<undefined, { data: ITenant[]; meta: IMeta }, Error>(),
  item: createAsyncAction(
    "@TENANTS/ITEM_FETCH_REQUEST",
    "@TENANTS/ITEM_FETCH_SUCCESS",
    "@TENANTS/ITEM_FETCH_FAILED"
  )<undefined, ITenant, Error>(),
}

export type TActions = ActionType<typeof actions>

export const reducer = createReducer<ITenant, IState>(
  INITIAL_STATE,
  actions as any
)

export function selectors<State extends IStateWithKey>(state: State) {
  const myState: IState = state[key]
  return {
    ...model<ITenant>(myState.state),
    get state(): IState {
      return myState
    },
    get isFetching(): boolean {
      return this.state.isFetching
    },
  }
}
