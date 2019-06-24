describe("Hotels", () => {
  const baseUrl = "/hotels"
  describe("List", () => {
    it("Should require authentication", () => {
      cy.checkForAuth(baseUrl)
    })
    describe("After authentication", () => {
      before(() => {
        cy.server()
        cy.route("GET", "/hotels*").as("fetch_hotels")
      })
      beforeEach(() => {
        cy.login(baseUrl)
      })
      it("Should fetch the data from apis", () => {
        cy.wait("@fetch_hotels")
      })
      it("Should have a link to add new hotel", () => {
        cy.get(`[href='${baseUrl}/new']`).click()
        cy.hasUrl(`${baseUrl}/new`)
      })
    })
  })
  describe("New Hotel", () => {
    it("Should require authentication", () => {
      cy.checkForAuth(`${baseUrl}/new`)
    })
    describe("After Authentication", () => {
      beforeEach(() => {
        cy.login(`${baseUrl}/new`)
      })
      it.only("Should allow use to save a hotel", () => {
        cy.get("form").should("exist")
      })
      it("Should have a way to come back to listing", () => {
        cy.contains("Cancel").click()
        cy.hasUrl(baseUrl)
      })
    })
  })
})
