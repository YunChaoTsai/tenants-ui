describe("Simple Test", () => {
  it("works", () => {
    expect(true).to.equal(true)
  })
  it("visits the app", () => {
    cy.visit("/")
  })
})
