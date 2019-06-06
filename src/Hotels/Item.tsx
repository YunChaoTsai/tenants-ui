import React, { useEffect, Fragment } from "react"
import { RouteComponentProps, Link, Router } from "@reach/router"
import { connect } from "react-redux"
import { AxiosInstance } from "axios"

import {
  IHotel,
  IStateWithKey,
  selectors,
  hotelActions as actions,
} from "./store"
import { ThunkDispatch, ThunkAction } from "./../types"
import Prices from "./Prices"
import AddPrices from "./AddPrices"
import { Dialog, useDialog } from "@tourepedia/dialog"
import Button from "@tourepedia/button"
import { AddContactForm } from "../Contacts"
import { withXHR, XHRProps } from "./../xhr"
import { Grid, Col } from "../Shared/Layout"

export function XHR(xhr: AxiosInstance) {
  return {
    getHotel(id: string): Promise<IHotel> {
      return xhr.get(`/hotels/${id}`).then(resp => resp.data.data)
    },
    createContact(id: string | number, contactData: any): Promise<IHotel> {
      return xhr
        .post(`/hotel-contacts`, {
          hotel_id: id,
          ...contactData,
        })
        .then(resp => resp.data.data)
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
    const hotelSelector = selectors(state).hotels
    return {
      isFetching: hotelSelector.isFetching,
      hotel: hotelSelector.getItem(hotelId),
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
  }, [hotelId, getHotel])
  return <Fragment>{render({ hotel, isFetching, hotelId, getHotel })}</Fragment>
})

export function Item({
  hotelId,
  navigate,
  xhr,
}: XHRProps & RouteComponentProps<{ hotelId: string }>) {
  const [isVisibleAddContact, showAddContact, hideAddContact] = useDialog()
  if (!hotelId) {
    navigate && navigate("/hotels")
    return null
  }
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
          name,
          stars,
          extra_bed_child_age_start,
          extra_bed_child_age_end,
          meal_plans,
          room_types,
          location,
          contacts,
          payment_preference,
        } = hotel
        return (
          <div>
            <Link to="..">Back</Link>
            <Grid>
              <Col>
                <h3>
                  {name} • {location.short_name} • {stars} Star
                </h3>
                <dl>
                  <dt>Meal Plans:</dt>
                  <dd>
                    {meal_plans.map(mealPlan => mealPlan.name).join(" • ")}
                  </dd>
                  <dt>Room Types:</dt>
                  <dd>
                    {room_types
                      .map(
                        roomType =>
                          `${roomType.name}(${
                            roomType.allowed_extra_beds
                          } AEBs)`
                      )
                      .join(" • ")}
                  </dd>
                  <dt>Payment Preference</dt>
                  <dd>
                    {payment_preference ? payment_preference.name : "NOT SET"}
                  </dd>
                  <dt>Extra bed child ages:</dt>
                  <dd>
                    From {extra_bed_child_age_start} to{" "}
                    {extra_bed_child_age_end} years
                  </dd>
                </dl>
              </Col>
              <Col sm={"auto"} xs={12}>
                <fieldset>
                  <legend>Contacts</legend>
                  <ul>
                    {(contacts || []).map(contact => (
                      <li key={contact.id}>
                        {contact.name} {contact.phone_number}&lt;{contact.email}
                        &gt;
                      </li>
                    ))}
                  </ul>
                  <Dialog
                    open={isVisibleAddContact}
                    onClose={hideAddContact}
                    closeButton
                  >
                    <Dialog.Header>
                      <Dialog.Title>Add Contact</Dialog.Title>
                    </Dialog.Header>
                    <Dialog.Body>
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
                    </Dialog.Body>
                  </Dialog>
                  <Button onClick={showAddContact}>Add Contact</Button>
                </fieldset>
              </Col>
            </Grid>
            <hr />
            <div>
              <div className="clearfix mb-4">
                <Link to="add-prices" className="btn btn-primary float-right">
                  Add Prices
                </Link>
                <h4>Prices</h4>
              </div>
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
