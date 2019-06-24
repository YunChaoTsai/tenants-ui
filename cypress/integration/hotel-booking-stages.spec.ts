import * as faker from "faker"

describe("Hotel Booking Stages", () => {
  const baseUrl = "/hotel-booking-stages"

  describe("List", () => {
    it("Should require authentication", () => {
      cy.checkForAuth(baseUrl)
    })
    describe("After authentication", () => {
      before(() => {
        cy.server()
        cy.route("GET", "/hotel-booking-stages*").as(
          "fetch_hotel_booking_stages"
        )
      })
      beforeEach(() => {
        cy.login(baseUrl)
        cy.wait(1000)
      })
      it("Should fetch the data from apis", () => {
        cy.wait("@fetch_hotel_booking_stages")
      })
      it("Should have a link to new hotel booking stage", () => {
        cy.get(`[href='${baseUrl}/new']`).click()
        cy.hasUrl(`${baseUrl}/new`)
      })
    })
  })
  describe("New Item", () => {
    it("Should require authentication", () => {
      cy.checkForAuth(`${baseUrl}/new`)
    })
    describe("After authentication", () => {
      beforeEach(() => {
        cy.login(`${baseUrl}/new`)
        cy.wait(1000)
      })
      it("Should have a form to create the hotel booking stage", () => {
        cy.server()
        cy.route("POST", "/hotel-booking-stages*").as(
          "save_hotel_booking_stages"
        )
        const name = faker.random.word()
        const description = faker.random.words(10)
        cy.get("#name")
          .type(name)
          .should("have.value", name)
        cy.get("#description")
          .type(description)
          .should("have.value", description)
        cy.get("[type='submit']").click()
        cy.wait("@save_hotel_booking_stages")
        cy.hasUrl(baseUrl)
        cy.get("#q")
          .type(name)
          .should("have.value", name)
        cy.get("#q").type("{enter}")
        // test the newly added value is present in the list
        cy.contains(name).should("exist")
        cy.contains(description).should("exist")
      })
      it("Should have a button to cancel and go back", () => {
        cy.contains("Cancel").click()
        cy.hasUrl(baseUrl)
      })
    })
  })
})
