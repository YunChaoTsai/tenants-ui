describe("Meal Plans", () => {
  it("Should require authentication", () => {
    cy.visit("/meal-plans")
    cy.wait(1000)
    cy.url().should("contains", "/login?next=/meal-plans")
  })
  describe("After authentication", () => {
    before(() => {
      cy.login("/meal-plans")
    })
    beforeEach(() => {
      cy.server()
      cy.route("GET", "/meal-plans*").as("fetch_meal_plans")
    })
    it("Should fetch the data from apis", () => {
      cy.wait("@fetch_meal_plans")
    })
    it("Should have a link to new meal plan", () => {
      cy.contains("New Meal Plan").should("have.attr", "href")
    })
  })
})
