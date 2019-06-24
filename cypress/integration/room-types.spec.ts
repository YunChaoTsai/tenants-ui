import * as faker from "faker"

describe("Room Types", () => {
  const baseUrl = "/room-types"

  describe("List", () => {
    it("Should require authentication", () => {
      cy.checkForAuth(baseUrl)
    })
    describe("After authentication", () => {
      before(() => {
        cy.server()
        cy.route("GET", "/room-types*").as("fetch_room_types")
      })
      beforeEach(() => {
        cy.login(baseUrl)
        cy.wait(1000)
      })
      it("Should fetch the data from apis", () => {
        cy.wait("@fetch_room_types")
      })
      it("Should have a link to new room type", () => {
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
        cy.wait(200)
      })
      it("Should have a form to create the room type", () => {
        cy.server()
        cy.route("POST", "/room-types*").as("save_room_types")
        const name = faker.random.word()
        const description = faker.random.words(10)
        cy.get("#name")
          .type(name)
          .should("have.value", name)
        cy.get("#description")
          .type(description)
          .should("have.value", description)
        cy.get("[type='submit']").click()
        cy.wait("@save_room_types")
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
