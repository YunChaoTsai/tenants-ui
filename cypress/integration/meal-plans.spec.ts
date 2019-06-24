import * as faker from "faker"

const baseUrl = "/meal-plans"

describe("Meal Plans", () => {
  describe("List", () => {
    it("Should require authentication", () => {
      cy.checkForAuth(baseUrl)
    })
    describe("After authentication", () => {
      before(() => {
        cy.server()
        cy.route("GET", "/meal-plans*").as("fetch_meal_plans")
      })
      beforeEach(() => {
        cy.login(baseUrl)
        cy.wait(1000)
      })
      it("Should fetch the data from apis", () => {
        cy.wait("@fetch_meal_plans")
      })
      it("Should have a link to new meal plan", () => {
        cy.get(`[href='${baseUrl}/new']`).click()
        cy.hasUrl(`${baseUrl}/new`)
      })
    })
  })
  describe("New Item", () => {
    it("Should require authentication", () => {
      cy.visit(`${baseUrl}/new`)
      cy.wait(1000)
      cy.hasUrl(`/login?next=${baseUrl}/new`)
    })
    describe("After authentication", () => {
      beforeEach(() => {
        cy.login(`${baseUrl}/new`)
        cy.wait(1000)
      })
      it("Should have a form to create the meal plan", () => {
        cy.server()
        cy.route("POST", "/meal-plans*").as("save_meal_plans")
        const name = faker.random.word()
        const description = faker.random.words(10)
        cy.get("#name")
          .type(name)
          .should("have.value", name)
        cy.get("#description")
          .type(description)
          .should("have.value", description)
        cy.get("[type='submit']").click()
        cy.wait("@save_meal_plans")
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
