import { createAsyncAction, getType, ActionType } from "typesafe-actions"
import {
  IBaseItem,
  IBaseState,
  init,
  model,
  IModelState,
  createReducer,
  IMeta,
} from "./../model"

export const key = "TRIP_SOURCES_STATE"

export interface ITripSource extends IBaseItem {
  id: number
  name: string
  short_name: string
}

export interface ITripSources extends IBaseState<ITripSource> {}

export interface IState extends IModelState<ITripSource> {}

export interface IStateWithKey {
  readonly [key]: IState
}

const INITIAL_STATE: IState = {
  isFetching: true,
  state: init<ITripSource>(),
}

export const actions = {
  list: createAsyncAction(
    "@TRIP_SOURCES/LIST_FETCH_REQUEST",
    "@TRIP_SOURCES/LIST_FETCH_SUCCESS",
    "@TRIP_SOURCES/LIST_FETCH_FAILED"
  )<any, { data: ITripSource[]; meta: IMeta }, Error>(),
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
