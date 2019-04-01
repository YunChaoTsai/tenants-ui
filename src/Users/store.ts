import { createAsyncAction, getType, ActionType } from "typesafe-actions"

import { IBaseItem, IBaseState, model, init } from "./../model"
import { IRole } from "./../Roles/store"

export const key = "USER_LIST_STATE"

export interface IUser extends IBaseItem {
  id: number
  name: string
  created_at: string
  updated_at: string
  roles?: IRole[]
}

export interface IUsers extends IBaseState<IUser> {}

export interface IState {
  readonly isFetching: boolean
  readonly users: IUsers
}

export interface IStateWithKey {
  readonly [key]: IState
}

const INITIAL_STATE: IState = {
  isFetching: true,
  users: init<IUser>(),
}

export const actions = {
  list: createAsyncAction(
    "@USERS/LIST_FETCH_REQUEST",
    "@USERS/LIST_FETCH_SUCCESS",
    "@USERS/LIST_FETCH_FAILED"
  )<any, IUser[], Error>(),
  item: createAsyncAction(
    "@USERS/ITEM_FETCH_REQUEST",
    "@USERS/ITEM_FETCH_SUCCESS",
    "@USERS/ITEM_FETCH_FAILED"
  )<any, IUser, Error>(),
}

export type TActions = ActionType<typeof actions>

export function reducer(
  state: IState = INITIAL_STATE,
  action: TActions
): IState {
  switch (action.type) {
    case getType(actions.list.request):
      return { ...state, isFetching: true }
    case getType(actions.list.success):
      return {
        ...state,
        users: model(state.users).insert(action.payload),
        isFetching: false,
      }
    case getType(actions.list.failure):
      return { ...state, isFetching: false }
    case getType(actions.item.request):
      return { ...state, isFetching: true }
    case getType(actions.item.success):
      return {
        ...state,
        users: model(state.users).insert([action.payload]),
        isFetching: false,
      }
    case getType(actions.item.failure):
      return { ...state, isFetching: false }
    default:
      return state
  }
}

export function selectors<State extends IStateWithKey>(state: State) {
  return {
    get state(): IState {
      return state[key]
    },
    get isFetching(): boolean {
      return this.state.isFetching
    },
    get users(): IUser[] {
      return model<IUser>(this.state.users).get()
    },
    getUser(id?: string | number): IUser | undefined {
      if (!id) return
      return model<IUser>(this.state.users).getItem(id)
    },
  }
}
