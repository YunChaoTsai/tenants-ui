import React from "react"
import ReactDOM from "react-dom"
import { Provider } from "react-redux"
import { combineReducers } from "redux"
import { HelmetProvider } from "react-helmet-async"

import App from "./App"
import * as serviceWorker from "./serviceWorker"
import configureStore from "./configureStore"
import { store as authStore, AuthUserProvider } from "./Auth"
import { store as roleStore } from "./Roles"
import { store as userStore } from "./Users"
import { store as mealPlanStore } from "./MealPlans"
import { store as roomTypeStore } from "./RoomTypes"
import { store as locationStore } from "./Locations"
import { store as hotelStore } from "./Hotels"
import { store as cabTypeStore } from "./CabTypes"
import { store as cabStore } from "./Cabs"
import { store as tripStore } from "./Trips"
import { store as tripSourceStore } from "./TripSources"
import { store as tripStageStore } from "./TripStages"
import { store as transportServiceStore } from "./TransportServices"
import { store as transportServicePriceStore } from "./TransportServicePrices"
import { store as hotelPaymentPreferenceStore } from "./HotelPaymentPreferences"
import { store as hotelBookingStageStore } from "./HotelBookingStages"
import { store as tripPlanRequestStore } from "./TripPlanRequests"
import { store as tenantStore } from "./Tenants"
import { store as hotelPriceStore } from "./HotelPrices"
import { store as notificationStore } from "./Notifications"
import { IAppState } from "./types"
import xhr, { XHRContext } from "./xhr"

const rootReducer = combineReducers<IAppState>({
  [authStore.key]: authStore.reducer,
  [roleStore.key]: roleStore.reducer,
  [userStore.key]: userStore.reducer,
  [mealPlanStore.key]: mealPlanStore.reducer,
  [roomTypeStore.key]: roomTypeStore.reducer,
  [locationStore.key]: locationStore.reducer,
  [hotelStore.key]: hotelStore.reducer,
  [cabTypeStore.key]: cabTypeStore.reducer,
  [cabStore.key]: cabStore.reducer,
  [tripStore.key]: tripStore.reducer,
  [tripSourceStore.key]: tripSourceStore.reducer,
  [tripStageStore.key]: tripStageStore.reducer,
  [transportServiceStore.key]: transportServiceStore.reducer,
  [transportServicePriceStore.key]: transportServicePriceStore.reducer,
  [hotelPaymentPreferenceStore.key]: hotelPaymentPreferenceStore.reducer,
  [hotelBookingStageStore.key]: hotelBookingStageStore.reducer,
  [tripPlanRequestStore.key]: tripPlanRequestStore.reducer,
  [tenantStore.key]: tenantStore.reducer,
  [hotelPriceStore.key]: hotelPriceStore.reducer,
  [notificationStore.key]: notificationStore.reducer,
})

const store = configureStore<IAppState>(rootReducer, {
  thunkExtraAgrs: { xhr },
})

const app = (
  <Provider store={store}>
    <HelmetProvider>
      <XHRContext.Provider value={xhr}>
        <AuthUserProvider>
          <App />
        </AuthUserProvider>
      </XHRContext.Provider>
    </HelmetProvider>
  </Provider>
)

ReactDOM.render(app, document.getElementById("root"))

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister()
