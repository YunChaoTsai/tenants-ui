import { createAsyncAction, getType, ActionType } from "typesafe-actions"

import {
  IBaseItem,
  IBaseState,
  model,
  init,
  IModelState,
  IMeta,
  createReducer,
} from "./../model"

export const key = "ROLE_LIST_STATE"

export interface IPermission extends IBaseItem {
  id: number
  name: string
}

export interface IRole extends IBaseItem {
  id: number
  name: string
  created_at: string
  updated_at: string
  permissions?: IPermission[]
}

export interface IRoles extends IBaseState<IRole> {}

export interface IState extends IModelState<IRole> {}

export interface IStateWithKey {
  readonly [key]: IState
}

const INITIAL_STATE: IState = {
  isFetching: true,
  state: init<IRole>(),
}

export const actions = {
  list: createAsyncAction(
    "@ROLES/LIST_FETCH_REQUEST",
    "@ROLES/LIST_FETCH_SUCCESS",
    "@ROLES/LIST_FETCH_FAILED"
  )<any, { data: IRole[]; meta: IMeta }, Error>(),
  item: createAsyncAction(
    "@ROLES/ITEM_FETCH_REQUEST",
    "@ROLES/ITEM_FETCH_SUCCESS",
    "@ROLES/ITEM_FETCH_FAILED"
  )<any, IRole, Error>(),
}

export type TActions = ActionType<typeof actions>

export const reducer = createReducer(INITIAL_STATE, actions as any)

export function selectors<State extends IStateWithKey>(state: State) {
  const myState = state[key]
  return {
    ...model(myState.state),
    get state(): IState {
      return myState
    },
    get isFetching(): boolean {
      return this.state.isFetching
    },
  }
}
