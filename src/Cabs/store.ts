import { createAsyncAction, getType, ActionType } from "typesafe-actions"

import { IBaseItem, IBaseState, model, init } from "./../model"

export const key = "CAB_LIST_STATE"

import { store as cabTypeStore } from "./../CabTypes"

export interface ICab extends IBaseItem {
  id: number
  name: string
  number_plate: string
  created_at: string
  updated_at: string
  cab_type: cabTypeStore.ICabType
}

export interface ICabs extends IBaseState<ICab> {}

export interface IState {
  readonly isFetching: boolean
  readonly cabs: ICabs
}

export interface IStateWithKey {
  readonly [key]: IState
}

const INITIAL_STATE: IState = {
  isFetching: true,
  cabs: init<ICab>(),
}

export const actions = {
  list: createAsyncAction(
    "@CABS/LIST_FETCH_REQUEST",
    "@CABS/LIST_FETCH_SUCCESS",
    "@CABS/LIST_FETCH_FAILED"
  )<any, ICab[], Error>(),
  item: createAsyncAction(
    "@CABS/ITEM_FETCH_REQUEST",
    "@CABS/ITEM_FETCH_SUCCESS",
    "@CABS/ITEM_FETCH_FAILED"
  )<any, ICab, Error>(),
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
        cabs: model(state.cabs).insert(action.payload),
        isFetching: false,
      }
    case getType(actions.list.failure):
      return { ...state, isFetching: false }
    case getType(actions.item.request):
      return { ...state, isFetching: true }
    case getType(actions.item.success):
      return {
        ...state,
        cabs: model(state.cabs).insert([action.payload]),
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
    get cabs(): ICab[] {
      return model<ICab>(this.state.cabs).get()
    },
    getCab(id?: string | number): ICab | undefined {
      if (!id) return
      return model<ICab>(this.state.cabs).getItem(id)
    },
  }
}
