describe("login flow", () => {
  const baseUrl = "/login"

  beforeEach(() => {
    cy.server()
    cy.route("GET", "/api/me").as("check_auth")
    cy.route("POST", /api\/login/).as("login")
  })

  it("Should redirect to `/login` with `?next=url` when not authenticated", () => {
    cy.visit("/trips")
    cy.wait("@check_auth")
    cy.url().should("include", `${baseUrl}?next=/trips`)
  })

  it("Should redirect to `/login` when not authenticated", () => {
    cy.visit("/trips")
    cy.wait("@check_auth")
    cy.url().should("include", "login")
  })

  it("Should autofocus the email field", () => {
    cy.visit(baseUrl)
    cy.focused().should("have.id", "email")
  })

  it("Should show an error message for invalid credentials", () => {
    cy.visit(baseUrl)
    cy.wait("@check_auth")
    cy.get("#email")
      .type("invalid@email.com")
      .should("have.value", "invalid@email.com")
    cy.get("#password")
      .type("whatonworldisthispassword")
      .should("have.value", "whatonworldisthispassword")
    cy.get("[type='submit']").click()
    cy.wait("@login")
    cy.get("[role='alert']").should("exist")
  })

  it("Should login successfully when credentials are valid", () => {
    cy.visit(baseUrl)
    cy.wait("@check_auth")
    cy.get("#email")
      .type("developer@local.com")
      .should("have.value", "developer@local.com")
    cy.get("#password")
      .type("welcome@tpdev")
      .should("have.value", "welcome@tpdev")
    cy.get("[type='submit']").click()
    cy.wait("@login")
    cy.hasUrl("/")
  })
  it("Should redirect to dashboard if the user is already logged in", () => {
    cy.login("/")
    cy.visit("/login")
    cy.wait(100)
    cy.hasUrl("/")
  })

  it("Should have a forgot password link", () => {
    cy.visit(baseUrl)
    cy.get("[href='/forgot-password']").click()
    cy.hasUrl("/forgot-password")
  })
})
