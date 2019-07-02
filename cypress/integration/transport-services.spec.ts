import * as faker from "faker"

describe("Transport Services", () => {
  const baseUrl = "/transport-services"

  describe("List", () => {
    it("Should require authentication", () => {
      cy.checkForAuth(baseUrl)
    })
    describe("After authentication", () => {
      before(() => {
        cy.server()
        cy.route("GET", /api\/transport-services/).as(
          "fetch_transport_services"
        )
      })
      beforeEach(() => {
        cy.login(baseUrl)
      })
      it("Should fetch the data from apis", () => {
        cy.wait("@fetch_transport_services")
      })
      it("Should have a link to new transport service", () => {
        cy.get(`[href='${baseUrl}/new']`).click()
        cy.hasUrl(`${baseUrl}/new`)
      })
    })
  })
  describe("New Item", () => {
    it("Should require authentication", () => {
      cy.visit(`${baseUrl}/new`)
      cy.hasUrl(`/login?next=${baseUrl}/new`)
    })
    describe("After authentication", () => {
      beforeEach(() => {
        cy.login(`${baseUrl}/new`)
      })
      it("Should have a form to create the transport service", () => {
        cy.server()
        cy.route("POST", /api\/transport-services/).as(
          "save_transport_services"
        )
        cy.route("GET", /api\/locations/).as("fetch_locations")
        const distance = Math.max(100, faker.random.number(1000)).toString()
        const includeSigtseeing = faker.random.boolean()
        cy.get("#via\\.0")
          .as("via_1")
          .type("Jaipur")
          .wait("@fetch_locations")
          .selectOption("@via_1")
        cy.getByText(/add more destinations/gi).click()
        cy.get("#via\\.1")
          .as("via_2")
          .type("Ajmer")
          .wait("@fetch_locations")
          .selectOption("@via_2")
        cy.get("#distance")
          .clear()
          .type(distance)
          .should("have.value", distance)
        if (includeSigtseeing) {
          cy.get("#is_sightseeing").check()
        }
        cy.get("[type='submit']").click()
        cy.wait("@save_transport_services")
        cy.hasUrl(baseUrl)
        cy.get("#q")
          .type("Jaipur")
          .should("have.value", "Jaipur")
        cy.get("#q").type("{enter}")
        // test the newly added value is present in the list
        cy.contains("Jaipur").should("exist")
      })
      it("Should have a button to cancel and go back", () => {
        cy.contains("Cancel").click()
        cy.hasUrl(baseUrl)
      })
    })
  })
})
