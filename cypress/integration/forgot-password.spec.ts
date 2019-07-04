describe("Forgot password fow", () => {
  const baseUrl = "/forgot-password"

  beforeEach(() => {
    cy.server()
    cy.route("GET", /api\/me/).as("check_auth")
    cy.route("POST", /api\/passwords\/reset/).as("forgot_password")
  })

  describe("Success", () => {
    beforeEach(() => {
      cy.visit(baseUrl)
    })
    it("Should check for login status", () => {
      cy.wait("@check_auth")
    })

    it("Should autofocus the email field", () => {
      cy.focused().should("have.id", "email")
    })

    it("Should be a successfull reset request", () => {
      cy.on("window:alert", str => {
        expect(str).to.equal(
          `Please check your inbox for password reset instructions.`
        )
      })
      cy.get("#email").type("developer@local.com")
      cy.get("button[type='submit']").click()
      cy.wait("@forgot_password")
    })
  })
  it("Should have a link to login", () => {
    cy.visit(baseUrl)
    cy.get("[href='/login']").click()
    cy.hasUrl("/login")
  })
  it("Should show error for bad requests", () => {
    cy.visit(baseUrl)
    cy.get("#email").type("invalid@emailaddress.com")
    cy.get("button[type='submit']").click()
    cy.wait("@forgot_password")
    cy.get("[role='alert'").should("exist")
  })
  it("Should redirect to dashboard if the user is logged in", () => {
    cy.login()
    cy.visit(baseUrl)
    cy.wait(1)
    cy.url().should("not.contains", baseUrl)
    cy.url().should("not.contains", "/login")
    cy.hasUrl("/")
  })
})
