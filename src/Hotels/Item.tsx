import React, { useEffect, useCallback } from "react"
import { RouteComponentProps, Link, Router } from "@reach/router"
import { useSelector } from "react-redux"
import { AxiosInstance } from "axios"

import { IHotel, IStateWithKey, selectors, actions } from "./store"
import { ThunkAction } from "./../types"
import { Dialog, useDialog } from "@tourepedia/dialog"
import { Button } from "@tourepedia/ui"
import { AddContactForm } from "../Contacts"
import { withXHR, XHRProps } from "./../xhr"
import { Grid, Col } from "../Shared/Layout"
import { useThunkDispatch } from "../utils"
import Spinner from "../Shared/Spinner"
import { HotelPricesList } from "../HotelPrices"

export function XHR(xhr: AxiosInstance) {
  return {
    async getHotel(id: string): Promise<IHotel> {
      return xhr.get(`/hotels/${id}`).then(resp => resp.data.data)
    },
    async createContact(
      id: string | number,
      contactData: any
    ): Promise<IHotel> {
      return xhr
        .post(`/hotel-contacts`, {
          hotel_id: id,
          ...contactData,
        })
        .then(resp => resp.data.data)
    },
  }
}

export const getHotelAction = (
  id: string
): ThunkAction<Promise<IHotel>> => async (dispatch, _, { xhr }) => {
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

function useHotelState(hotelId?: number | string) {
  interface StateProps {
    isFetching: boolean
    hotel?: IHotel
  }
  return useSelector<IStateWithKey, StateProps>(state => {
    const hotelSelector = selectors(state)
    return {
      isFetching: hotelSelector.isFetching,
      hotel: hotelSelector.getItem(hotelId),
    }
  })
}

function useHotelFetch() {
  const dispatch = useThunkDispatch()
  return useCallback((hotelId: string) => dispatch(getHotelAction(hotelId)), [
    dispatch,
  ])
}

export function useHotel(hotelId?: string, shouldFetch: boolean = false) {
  const state = useHotelState(hotelId)
  const fetchHotel = useHotelFetch()
  useEffect(() => {
    if (shouldFetch) {
      hotelId && fetchHotel(hotelId)
    }
  }, [fetchHotel, hotelId, shouldFetch])
  return {
    ...state,
    fetchHotel,
  }
}

export function Item({
  hotelId,
  navigate,
  xhr,
}: XHRProps & RouteComponentProps<{ hotelId: string }>) {
  const [isVisibleAddContact, showAddContact, hideAddContact] = useDialog()
  const { hotel, isFetching, fetchHotel: getHotel } = useHotel(hotelId, true)
  if (!hotelId) {
    navigate && navigate("/hotels")
    return null
  }
  if (isFetching)
    return (
      <div className="text-center">
        <Spinner />
      </div>
    )
  if (!hotel) return null
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
            <dd>{meal_plans.map(mealPlan => mealPlan.name).join(" • ")}</dd>
            <dt>Room Types:</dt>
            <dd>
              {room_types
                .map(
                  roomType =>
                    `${roomType.name}(${roomType.allowed_extra_beds} AEBs)`
                )
                .join(" • ")}
            </dd>
            <dt>Payment Preference</dt>
            <dd>{payment_preference ? payment_preference.name : "NOT SET"}</dd>
            <dt>Extra bed child ages:</dt>
            <dd>
              From {extra_bed_child_age_start} to {extra_bed_child_age_end}{" "}
              years
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
            <Dialog open={isVisibleAddContact} onClose={hideAddContact}>
              <Dialog.Header closeButton>
                <Dialog.Title>Add Contact</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                <AddContactForm
                  onCancel={hideAddContact}
                  onCreate={async ({ name, email, phone_number, country }) => {
                    return XHR(xhr)
                      .createContact(hotelId, {
                        name,
                        email,
                        phone_number,
                        country_id: country ? country.id : undefined,
                      })
                      .then(hotel => {
                        getHotel(hotelId)
                        return hotel
                      })
                  }}
                />
              </Dialog.Body>
            </Dialog>
            <Button onClick={showAddContact} data-testid="add_contact">
              Add Contact
            </Button>
          </fieldset>
        </Col>
      </Grid>
      <div className="mt-4">
        <Link
          to={`/hotel-prices/new?id=${hotel.id}`}
          className="btn float-right"
        >
          Add Prices
        </Link>
        <h3>Prices</h3>
        <Router>
          <HotelPricesList hotelId={hotel.id} path="/" />
        </Router>
      </div>
    </div>
  )
}

export default withXHR(Item)
