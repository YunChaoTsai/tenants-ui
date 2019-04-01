import { createAsyncAction, getType, ActionType } from "typesafe-actions"
import { IBaseItem, IBaseState, init, model } from "./../model"

export const key = "MEAL_PLANS_STATE"

export interface IMealPlan extends IBaseItem {
  id: number
  name: string
  description: string
}

export interface IMealPlans extends IBaseState<IMealPlan> {}

export interface IState {
  readonly isFetching: boolean
  readonly mealPlans: IMealPlans
}

export interface IStateWithKey {
  readonly [key]: IState
}

const INITIAL_STATE: IState = {
  isFetching: true,
  mealPlans: init<IMealPlan>(),
}

export const actions = {
  list: createAsyncAction(
    "@MEAL_PLANS/LIST_FETCH_REQUEST",
    "@MEAL_PLANS/LIST_FETCH_SUCCESS",
    "@MEAL_PLANS/LIST_FETCH_FAILED"
  )<any, IMealPlan[], Error>(),
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
        mealPlans: model(state.mealPlans).insert(action.payload),
        isFetching: false,
      }
    case getType(actions.list.failure):
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
    get mealPlans(): IMealPlan[] {
      return model<IMealPlan>(this.state.mealPlans).get()
    },
    getMealPlan(id?: string | number): IMealPlan | undefined {
      if (!id) return
      return model<IMealPlan>(this.state.mealPlans).getItem(id)
    },
  }
}
