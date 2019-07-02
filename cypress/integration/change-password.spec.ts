describe("Change Password", () => {
  const baseUrl = "/settings/change-password"
  it("should require authetication", () => {
    cy.checkForAuth(baseUrl)
  })
  describe("After authentication", () => {
    beforeEach(() => {
      cy.login(baseUrl)
    })
    it("should have a form to update the password", () => {
      cy.get("form").should("exist")
      const currentPassword = "welcome@tpdev"
      cy.get("#current")
        .type(currentPassword)
        .should("have.value", currentPassword)
      cy.get("#password")
        .type(currentPassword)
        .should("have.value", currentPassword)
      cy.get("#password_confirmation")
        .type(currentPassword)
        .should("have.value", currentPassword)
      cy.server()
      cy.route("POST", /api\/passwords/).as("update_password")
      cy.get("[type='submit']").click()
      cy.wait("@update_password")
      cy.hasUrl("/")
    })
  })
})
