describe("Trips", () => {
  const baseUrl = "/trips"

  it("Should require authentication", () => {
    cy.checkForAuth(baseUrl)
  })
  describe("After authentication", () => {
    before(() => {
      cy.server()
      cy.route("GET", "/trips*").as("fetch_trips")
    })
    beforeEach(() => {
      cy.login(baseUrl)
    })
    it("Should fetch the data from apis", () => {
      cy.wait("@fetch_trips")
    })
    it("Should have a link to add new trip", () => {
      cy.get(`[href='${baseUrl}/new']`).click()
      cy.hasUrl(`${baseUrl}/new`)
    })
  })
})
