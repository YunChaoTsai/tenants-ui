import * as faker from "faker"

describe("Hotel Payment Preferences", () => {
  const baseUrl = "/hotel-payment-preferences"

  describe("List", () => {
    it("Should require authentication", () => {
      cy.checkForAuth(baseUrl)
    })
    describe("After authentication", () => {
      before(() => {
        cy.server()
        cy.route("GET", /api\/hotel-payment-preferences/).as(
          "fetch_payment_preferences"
        )
      })
      beforeEach(() => {
        cy.login(baseUrl)
      })
      it("Should fetch the data from apis", () => {
        cy.wait("@fetch_payment_preferences")
      })
      it("Should have a link to new hotel payment preference", () => {
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
        cy.server()
        cy.route("POST", /api\/hotel-payment-preferences/).as(
          "save_payment_preferences"
        )
        cy.route("GET", /api\/hotel-payment-preferences\/references/).as(
          "fetch_payment_references"
        )
      })
      it("Should have a form to create the payment preference", () => {
        cy.wait("@fetch_payment_references")
        cy.selectOption("#breakdowns\\.0\\.reference")
        const dayOffset = faker.random.number({ min: -10, max: 100 }).toString()
        cy.get("#breakdowns\\.0\\.day_offset")
          .clear()
          .type(dayOffset)
          .should("have.value", dayOffset)
        cy.get("#breakdowns\\.0\\.amount_share")
          .clear()
          .type("100")
          .should("have.value", "100")
        cy.get("[type='submit']").click()
        cy.wait("@save_payment_preferences")
        cy.hasUrl(baseUrl)
      })
      it("Should have a button to cancel and go back", () => {
        cy.contains("Cancel").click()
        cy.hasUrl(baseUrl)
      })
    })
  })
})
