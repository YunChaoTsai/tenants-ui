import * as faker from "faker"

describe("Users", () => {
  const baseUrl = "/users"
  describe("List", () => {
    it("should require authentication", () => {
      cy.checkForAuth(baseUrl)
    })
    describe("After authetication", () => {
      beforeEach(() => {
        cy.server()
        cy.route("GET", "/users*").as("get_users")
        cy.login(baseUrl)
      })
      it("should get a list of users", () => {
        cy.wait("@get_users")
      })
      it("should have a link to add new users", () => {
        cy.get(`[href='${baseUrl}/new']`).should("exist")
      })
    })
  })
  describe("New User", () => {
    const baseUrl = "/users/new"
    it("should require authentication", () => {
      cy.checkForAuth(baseUrl)
    })
    describe("After authentication", () => {
      beforeEach(() => {
        cy.server()
        cy.route("POST", "/users*").as("create_user")
        cy.login(baseUrl)
      })
      it.only("should allow to register a new user", () => {
        const name = faker.random.word()
        const email = faker.internet.exampleEmail()
        const password = faker.random.uuid()
        cy.get("#name")
          .type(name)
          .should("have.value", name)
        cy.get("#email")
          .type(email)
          .should("have.value", email)
        cy.get("#password")
          .type(password)
          .should("have.value", password)
        cy.get("#password_confirmation")
          .type(password)
          .should("have.value", password)
        cy.get("[type='submit']").click()
        cy.wait("@create_user")
        cy.url().should("not.contain", "/users/new")
      })
    })
  })
})
