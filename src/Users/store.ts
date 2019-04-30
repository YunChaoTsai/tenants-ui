import { createAsyncAction, getType, ActionType } from "typesafe-actions"

import {
  IBaseItem,
  IBaseState,
  model,
  init,
  IModelState,
  createReducer,
  IMeta,
} from "./../model"
import { IRole } from "./../Roles/store"

export const key = "USER_LIST_STATE"

export interface IUser extends IBaseItem {
  id: number
  name: string
  email: string
  email_verified_at: boolean
  created_at: string
  updated_at: string
  roles: IRole[]
}

export interface IUsers extends IBaseState<IUser> {}

export interface IState extends IModelState<IUser> {
  readonly isFetching: boolean
}

export interface IStateWithKey {
  readonly [key]: IState
}

const INITIAL_STATE: IState = {
  isFetching: true,
  state: init<IUser>(),
}

export const actions = {
  list: createAsyncAction(
    "@USERS/LIST_FETCH_REQUEST",
    "@USERS/LIST_FETCH_SUCCESS",
    "@USERS/LIST_FETCH_FAILED"
  )<any, { data: IUser[]; meta: IMeta }, Error>(),
  item: createAsyncAction(
    "@USERS/ITEM_FETCH_REQUEST",
    "@USERS/ITEM_FETCH_SUCCESS",
    "@USERS/ITEM_FETCH_FAILED"
  )<any, IUser, Error>(),
}

export type TActions = ActionType<typeof actions>

export const reducer = createReducer<IUser, IState>(
  INITIAL_STATE,
  actions as any
)

export function selectors<State extends IStateWithKey>(state: State) {
  const myState = state[key]
  return {
    ...model<IUser>(myState.state),
    get state(): IState {
      return state[key]
    },
    get isFetching(): boolean {
      return this.state.isFetching
    },
  }
}
