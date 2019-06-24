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
        cy.route("GET", "/hotel-payment-preferences*").as(
          "fetch_payment_preferences"
        )
      })
      beforeEach(() => {
        cy.login(baseUrl)
        cy.wait(1000)
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
        cy.wait(1000)
      })
      it("Should have a form to create the payment preference", () => {
        cy.server()
        cy.route("POST", "/hotel-payment-preferences*").as(
          "save_payment_preferences"
        )
        cy.get("#breakdowns\\.0\\.reference").as("breakdown")
        cy.get("@breakdown").click()
        cy.get(".select [role='listbox'] [role='option']:first-child").as(
          "first_breakdown"
        )
        cy.get("@first_breakdown").click()
        cy.get("@first_breakdown")
          .invoke("text")
          .then(firstBreakDown => {
            cy.get("@breakdown")
              .invoke("val")
              .should(value => {
                expect(value).to.be.eq(firstBreakDown)
              })
          })
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
