describe("Forgot password fow", () => {
  beforeEach(() => {
    cy.server()
    cy.route("GET", "/me").as("check_auth")
    cy.route("POST", "/passwords/reset").as("forgot_password")
  })

  describe("Success", () => {
    before(() => {
      cy.visit("/forgot-password")
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
    cy.visit("/forgot-password")
    cy.contains("Login").as("login_link")
    cy.get("@login_link").should("have.attr", "href")
    cy.get("@login_link").click()
    cy.url().should("contains", "/login")
  })
  it("Should show error for bad requests", () => {
    cy.visit("/forgot-password")
    cy.get("#email").type("invalid@emailaddress.com")
    cy.get("button[type='submit']").click()
    cy.wait("@forgot_password")
    cy.get(".error").should("exist")
  })
  it("Should redirect to dashboard if the user is logged in", () => {
    cy.login()
    cy.visit("/forgot-password")
    cy.wait(1000)
    cy.url().should("not.contains", "/forgot-password")
    cy.url().should("not.contains", "/login")
  })
})
