import { createAsyncAction, ActionType } from "typesafe-actions"

import {
  IBaseItem,
  IBaseState,
  IModelState,
  model,
  init,
  createReducer,
} from "./../model"

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

export interface IState extends IModelState<ICab> {
  readonly isFetching: boolean
}

export interface IStateWithKey {
  readonly [key]: IState
}

const INITIAL_STATE: IState = {
  isFetching: true,
  state: init<ICab>(),
}

export const actions = {
  list: createAsyncAction(
    "@CABS/LIST_FETCH_REQUEST",
    "@CABS/LIST_FETCH_SUCCESS",
    "@CABS/LIST_FETCH_FAILED"
  )<any, { data: ICab[]; meta: any }, Error>(),
  item: createAsyncAction(
    "@CABS/ITEM_FETCH_REQUEST",
    "@CABS/ITEM_FETCH_SUCCESS",
    "@CABS/ITEM_FETCH_FAILED"
  )<any, ICab, Error>(),
}

export type TActions = ActionType<typeof actions>

export const reducer = createReducer<ICab, IState>(
  INITIAL_STATE,
  actions as any
)

export function selectors<State extends IStateWithKey>(state: State) {
  const myState: IState = state[key]
  return {
    ...model<ICab>(myState.state),
    get state(): IState {
      return myState
    },
    get isFetching(): boolean {
      return this.state.isFetching
    },
  }
}
