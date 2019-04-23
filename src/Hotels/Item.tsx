import React, { useEffect, Fragment } from "react"
import { RouteComponentProps, Link, Router } from "@reach/router"
import { connect } from "react-redux"
import { AxiosInstance } from "axios"

import { IHotel, IStateWithKey, selectors, actions } from "./store"
import { ThunkDispatch, ThunkAction } from "./../types"
import Prices from "./Prices"
import AddPrices from "./AddPrices"
import { Dialog, useDialog } from "./../Shared/Dialog"
import Button from "@tourepedia/button"
import { AddContactForm } from "../Contacts"
import { withXHR, XHRProps } from "./../xhr"

export function XHR(xhr: AxiosInstance) {
  return {
    getHotel(id: string): Promise<IHotel> {
      return xhr.get(`/hotels/${id}`).then(resp => resp.data.hotel)
    },
    createContact(id: string | number, contactData: any): Promise<IHotel> {
      return xhr
        .post(`/hotel-contacts`, {
          hotel_id: id,
          ...contactData,
        })
        .then(resp => resp.data.hotel)
    },
  }
}

export const getHotel = (id: string): ThunkAction<Promise<IHotel>> => (
  dispatch,
  getState,
  { xhr }
) => {
  dispatch(actions.item.request())
  return XHR(xhr)
    .getHotel(id)
    .then(hotel => {
      dispatch(actions.item.success(hotel))
      return hotel
    })
    .catch(error => {
      dispatch(actions.item.failure(error))
      return Promise.reject(error)
    })
}

interface StateProps {
  isFetching: boolean
  hotel?: IHotel
}
interface DispatchProps {
  getHotel: (hotelId: string) => Promise<IHotel>
}
interface OwnProps {
  hotelId?: string
  render: (
    props: StateProps & DispatchProps & { hotelId?: string }
  ) => React.ReactNode
}

const connectWithItem = connect<
  StateProps,
  DispatchProps,
  OwnProps,
  IStateWithKey
>(
  (state, { hotelId }) => {
    const hotelSelector = selectors(state)
    return {
      isFetching: hotelSelector.isFetching,
      hotel: hotelSelector.getHotel(hotelId),
    }
  },
  (dispatch: ThunkDispatch) => ({
    getHotel: (hotelId: string) => dispatch(getHotel(hotelId)),
  })
)

interface ItemProps extends StateProps, DispatchProps, OwnProps {}

export const HotelDataProvider = connectWithItem(function HotelDataProvider({
  isFetching,
  hotel,
  getHotel,
  hotelId,
  render,
}: ItemProps) {
  useEffect(() => {
    hotelId && getHotel(hotelId)
  }, [])
  return <Fragment>{render({ hotel, isFetching, hotelId, getHotel })}</Fragment>
})

export function Item({
  hotelId,
  navigate,
  xhr,
}: XHRProps & RouteComponentProps<{ hotelId: string }>) {
  if (!hotelId) {
    navigate && navigate("/hotels")
    return null
  }
  const [isVisibleAddContact, showAddContact, hideAddContact] = useDialog()
  return (
    <HotelDataProvider
      hotelId={hotelId}
      render={({ hotel, isFetching, getHotel }) => {
        if (isFetching) return "Loading..."
        if (!hotel) {
          navigate && navigate("/hotels")
          return null
        }
        const {
          id,
          name,
          extra_bed_child_age_start,
          extra_bed_child_age_end,
          meal_plans,
          room_types,
          location,
          contacts,
        } = hotel
        return (
          <div>
            <Link to="..">Back</Link>
            <h3>
              {name} - {location.short_name}
            </h3>
            <div>
              Extra bed child ages: From {extra_bed_child_age_start} To{" "}
              {extra_bed_child_age_end}
            </div>
            <div>
              Meal Plans:{" "}
              {meal_plans.map(mealPlan => (
                <span key={mealPlan.id}>{mealPlan.name}</span>
              ))}
            </div>
            <div>
              Room Types:{" "}
              {room_types.map(roomType => (
                <span key={roomType.id}>{roomType.name}</span>
              ))}
            </div>
            <div>
              <h4>Contacts</h4>
              <ul>
                {(contacts || []).map(contact => (
                  <li key={contact.id}>
                    {contact.name} {contact.phone_number}&lt;{contact.email}&gt;
                  </li>
                ))}
              </ul>
              <Dialog
                open={isVisibleAddContact}
                onClose={hideAddContact}
                closeButton
              >
                <div style={{ padding: "10px" }}>
                  <h3>Add Contact</h3>
                  <AddContactForm
                    onCancel={hideAddContact}
                    onCreate={({
                      name,
                      email,
                      phone_number,
                      phone_number_dial_code,
                    }) => {
                      return XHR(xhr)
                        .createContact(hotelId, {
                          name,
                          email,
                          phone_number,
                          country_dial_code_id: phone_number_dial_code
                            ? phone_number_dial_code.id
                            : null,
                        })
                        .then(hotel => {
                          getHotel(hotelId)
                          return hotel
                        })
                    }}
                  />
                </div>
              </Dialog>
              <Button onClick={showAddContact}>Add Contact</Button>
            </div>
            <div>
              <h4>Prices</h4>
              <Link to="add-prices">Add Prices</Link>
              <Router>
                <AddPrices path="add-prices" hotel={hotel} />
                <Prices path="/" hotel={hotel} />
              </Router>
            </div>
          </div>
        )
      }}
    />
  )
}

export default withXHR(Item)
