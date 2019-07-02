import * as faker from "faker"

describe("Cabs", () => {
  const baseUrl = "/cabs"
  describe("List", () => {
    it("Should require authentication", () => {
      cy.checkForAuth(baseUrl)
    })
    describe("After authentication", () => {
      before(() => {
        cy.server()
        cy.route("GET", /api\/cabs/).as("fetch_cabs")
      })
      beforeEach(() => {
        cy.login(baseUrl)
      })
      it("Should fetch the data from apis", () => {
        cy.wait("@fetch_cabs")
      })
      it("Should have a link to new cab", () => {
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
      it("Should have a form to create the cab", () => {
        cy.server()
        cy.route("POST", /api\/cabs/).as("save_cabs")
        const name = faker.random.words(2)
        const numberPlate =
          faker.address.stateAbbr() +
          faker.random.number(100).toString() +
          " " +
          faker.random.alphaNumeric(2).toUpperCase() +
          " " +
          faker.random.number({ min: 1000, max: 9999 })
        cy.get("#name")
          .type(name)
          .should("have.value", name)
        cy.get("#cab_type")
          .as("cab_type")
          .type("med")
          .selectOption("@cab_type")
        cy.get("#number_plate")
          .type(numberPlate)
          .should("have.value", numberPlate)
        cy.get("[type='submit']").click()
        cy.wait("@save_cabs").then(response => {
          const cab = (response.responseBody as any).data
          cy.hasUrl(`${baseUrl}/${cab.id}`)
          cy.visit(baseUrl)
          cy.get("#q")
            .type(name)
            .should("have.value", name)
          cy.get("#q").type("{enter}")
          // test the newly added value is present in the list
          cy.contains(name).should("exist")
        })
      })
      it("Should have a button to cancel and go back", () => {
        cy.contains("Cancel").click()
        cy.hasUrl(baseUrl)
      })
    })
  })
})
