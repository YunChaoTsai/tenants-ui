import { createAsyncAction, ActionType } from "typesafe-actions"
import {
  IBaseItem,
  IBaseState,
  init,
  model,
  IModelState,
  IMeta,
  createReducer,
} from "./../model"

export const key = "ROOM_TYPES_STATE"

export interface IRoomType extends IBaseItem {
  id: number
  name: string
  description: string
}

export interface IRoomTypes extends IBaseState<IRoomType> {}

export interface IState extends IModelState<IRoomType> {}

export interface IStateWithKey {
  readonly [key]: IState
}

const INITIAL_STATE: IState = {
  isFetching: true,
  state: init<IRoomType>(),
}

export const actions = {
  list: createAsyncAction(
    "@ROOM_TYPES/LIST_FETCH_REQUEST",
    "@ROOM_TYPES/LIST_FETCH_SUCCESS",
    "@ROOM_TYPES/LIST_FETCH_FAILED"
  )<undefined, { data: IRoomType[]; meta: IMeta }, Error>(),
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
