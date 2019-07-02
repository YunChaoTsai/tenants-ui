import * as faker from "faker"

describe("Reset passsword", () => {
  const baseUrl = "/reset-password"
  it("should redirect to home if invalid url", () => {
    cy.visit(baseUrl)
    cy.hasUrl("/")
  })
  it("should have a form to reset the password", () => {
    const email = faker.random.alphaNumeric(5) + faker.internet.exampleEmail()
    const token = faker.random.uuid()
    const password = faker.internet.password(10)
    cy.visit(
      `${baseUrl}?email=${encodeURIComponent(email)}&token=${encodeURIComponent(
        token
      )}`
    )
    cy.get("#password")
      .type(password)
      .should("have.value", password)
    cy.get("#password_confirmation")
      .type(password)
      .should("have.value", password)
    cy.server()
    cy.route("POST", /api\/passwords\/reset/).as("password_reset")
    cy.get("[type='submit']").click()
    cy.wait("@password_reset").then(response => {
      expect(response.status).to.eq(400)
    })
    cy.get("[role='alert']").should("exist")
  })
})
