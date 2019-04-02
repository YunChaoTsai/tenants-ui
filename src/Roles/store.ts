import { createAsyncAction, getType, ActionType } from "typesafe-actions"

import { IBaseItem, IBaseState, model, init } from "./../model"

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

export interface IState {
  readonly isFetching: boolean
  readonly roles: IRoles
}

export interface IStateWithKey {
  readonly [key]: IState
}

const INITIAL_STATE: IState = {
  isFetching: true,
  roles: init<IRole>(),
}

export const actions = {
  list: createAsyncAction(
    "@ROLES/LIST_FETCH_REQUEST",
    "@ROLES/LIST_FETCH_SUCCESS",
    "@ROLES/LIST_FETCH_FAILED"
  )<any, IRole[], Error>(),
  item: createAsyncAction(
    "@ROLES/ITEM_FETCH_REQUEST",
    "@ROLES/ITEM_FETCH_SUCCESS",
    "@ROLES/ITEM_FETCH_FAILED"
  )<any, IRole, Error>(),
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
        roles: model(state.roles).insert(action.payload),
        isFetching: false,
      }
    case getType(actions.list.failure):
      return { ...state, isFetching: false }
    case getType(actions.item.request):
      return { ...state, isFetching: true }
    case getType(actions.item.success):
      return {
        ...state,
        roles: model(state.roles).insert([action.payload]),
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
    get roles(): IRole[] {
      return model<IRole>(this.state.roles).get()
    },
    getRole(id?: string | number): IRole | undefined {
      if (!id) return
      return model<IRole>(this.state.roles).getItem(id)
    },
  }
}
