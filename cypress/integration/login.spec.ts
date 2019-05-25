/**
 * Test the login flow
 */
describe("login flow", () => {
  beforeEach(() => {
    cy.server()
    cy.route("GET", "/me").as("check_auth")
    cy.route("POST", "/login").as("login")
  })

  it("Should redirect to `/login` with `?next=url` when not authenticated", () => {
    cy.visit("/trips")
    cy.wait("@check_auth")
    cy.url().should("include", "/login?next=/trips")
  })

  it("Should redirect to `/login` when not authenticated", () => {
    cy.visit("/trips")
    cy.wait("@check_auth")
    cy.url().should("include", "login")
  })

  it("Should autofocus the email field", () => {
    cy.visit("/login")
    cy.focused().should("have.id", "email")
  })

  it("Should show an error message for invalid credentials", () => {
    cy.login("/", "invalid@email.com", "invalid.password")
    cy.get(".error").should("exist")
  })

  it("Should login successfully when credentials are valid", () => {
    cy.visit("/login")
    cy.get("#email")
      .type("developer@local.com")
      .should("have.value", "developer@local.com")
    cy.get("#password")
      .type("welcome@tpdev")
      .should("have.value", "welcome@tpdev")
    cy.get("button").click()
    cy.wait("@login")
    cy.url().should("equal", "http://localhost:3000/")
  })

  it("Should have a forgot password", () => {
    cy.visit("/login")
    cy.contains("Forgot").as("forgot_password_link")
    cy.get("@forgot_password_link")
      .should("exist")
      .should("have.attr", "href")

    cy.get("@forgot_password_link").click()
    cy.url().should("include", "forgot-password")
  })
})
