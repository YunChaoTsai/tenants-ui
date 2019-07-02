describe("Logout", () => {
  const baseUrl = "/logout"
  it("should require authentication", () => {
    cy.checkForAuth("")
  })
  describe("After authentication", () => {
    beforeEach(() => {
      cy.login()
      cy.server()
      cy.route("POST", /api\/logout/).as("logout_request")
    })
    it("should logout the user", () => {
      cy.visit(baseUrl)
      cy.wait("@logout_request")
      cy.url().should("contain", "/login")
    })
  })
})
