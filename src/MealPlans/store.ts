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

export const key = "MEAL_PLANS_STATE"

export interface IMealPlan extends IBaseItem {
  id: number
  name: string
  description: string
}

export interface IMealPlans extends IBaseState<IMealPlan> {}

export interface IState extends IModelState<IMealPlan> {}

export interface IStateWithKey {
  readonly [key]: IState
}

const INITIAL_STATE: IState = {
  isFetching: true,
  state: init<IMealPlan>(),
}

export const actions = {
  list: createAsyncAction(
    "@MEAL_PLANS/LIST_FETCH_REQUEST",
    "@MEAL_PLANS/LIST_FETCH_SUCCESS",
    "@MEAL_PLANS/LIST_FETCH_FAILED"
  )<any, { data: IMealPlan[]; meta: IMeta }, Error>(),
}

export type TActions = ActionType<typeof actions>

export const reducer = createReducer<IMealPlan, IState>(
  INITIAL_STATE,
  actions as any
)

export function selectors<State extends IStateWithKey>(state: State) {
  const myState = state[key]
  return {
    ...model<IMealPlan>(myState.state),
    get state(): IState {
      return myState
    },
    get isFetching(): boolean {
      return this.state.isFetching
    },
  }
}
