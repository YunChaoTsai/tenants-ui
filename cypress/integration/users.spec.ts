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
    it("should require authentication", () => {
      cy.checkForAuth(`${baseUrl}/new`)
    })
    describe("After authentication", () => {
      beforeEach(() => {
        cy.server()
        cy.route("POST", "/users*").as("create_user")
        cy.login(`${baseUrl}/new`)
      })
      it("should allow to register a new user", () => {
        const name = faker.random.words(2)
        const email = faker.internet.exampleEmail()
        const password = faker.internet.password(10)
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
        cy.wait("@create_user").then(response => {
          const data = (response.responseBody as any).data
          cy.hasUrl(`${baseUrl}/${data.id}`)
        })
      })
    })
  })
})
