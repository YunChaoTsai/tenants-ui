import * as faker from "faker"

describe("Cab Types", () => {
  const baseUrl = "/cab-types"

  describe("List", () => {
    it("Should require authentication", () => {
      cy.checkForAuth(baseUrl)
    })
    describe("After authentication", () => {
      before(() => {
        cy.server()
        cy.route("GET", /api\/cab-types/).as("fetch_cab_types")
      })
      beforeEach(() => {
        cy.login(baseUrl)
      })
      it("Should fetch the data from apis", () => {
        cy.wait("@fetch_cab_types")
      })
      it("Should have a link to new cab type", () => {
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
      it("Should have a form to create the cab type", () => {
        cy.server()
        cy.route("POST", /api\/cab-types/).as("save_cab_types")
        cy.route("GET", /api\/locations/).as("fetch_locations")
        const name = faker.company.companyName()
        const capacity = faker.random.number(10).toString()
        cy.get("#name")
          .clear()
          .type(name)
          .should("have.value", name)
        cy.get("#capacity")
          .clear()
          .type(capacity)
          .should("have.value", capacity)
        cy.get("[type='submit']").click()
        cy.wait("@save_cab_types")
        cy.hasUrl(baseUrl)
        cy.get("#q")
          .type(name)
          .should("have.value", name)
        cy.get("#q").type("{enter}")
        // test the newly added value is present in the list
        cy.contains(name).should("exist")
      })
      it("Should have a button to cancel and go back", () => {
        cy.contains("Cancel").click()
        cy.hasUrl(baseUrl)
      })
    })
  })
})
