import { createAsyncAction, getType, ActionType } from "typesafe-actions"
import {
  IBaseItem,
  IBaseState,
  init,
  model,
  IModelState,
  IMeta,
  createReducer,
} from "./../model"

export const key = "TRIP_STAGES_STATE"

export interface ITripStage extends IBaseItem {
  id: number
  name: string
  description: string
}

export interface ITripStages extends IBaseState<ITripStage> {}

export interface IState extends IModelState<ITripStage> {}

export interface IStateWithKey {
  readonly [key]: IState
}

const INITIAL_STATE: IState = {
  isFetching: true,
  state: init<ITripStage>(),
}

export const actions = {
  list: createAsyncAction(
    "@TRIP_STAGES/LIST_FETCH_REQUEST",
    "@TRIP_STAGES/LIST_FETCH_SUCCESS",
    "@TRIP_STAGES/LIST_FETCH_FAILED"
  )<undefined, { data: ITripStage[]; meta: IMeta }, Error>(),
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
