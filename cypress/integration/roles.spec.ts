import * as faker from "faker"

describe("Roles", () => {
  const baseUrl = "/roles"
  describe("List", () => {
    it("should require authentication", () => {
      cy.checkForAuth(baseUrl)
    })
    describe("After authetication", () => {
      beforeEach(() => {
        cy.server()
        cy.route("GET", "/roles*").as("get_roles")
        cy.login(baseUrl)
      })
      it("should get a list of roles", () => {
        cy.wait("@get_roles")
      })
      it("should have a link to add new roles", () => {
        cy.get(`[href='${baseUrl}/new']`).should("exist")
      })
    })
  })
  describe("New Role", () => {
    it("should require authentication", () => {
      cy.checkForAuth(`${baseUrl}/new`)
    })
    describe("After authentication", () => {
      beforeEach(() => {
        cy.server()
        cy.route("POST", "/roles*").as("create_role")
        cy.login(`${baseUrl}/new`)
      })
      it("should allow to register a new role", () => {
        const name = faker.name.jobTitle()
        cy.get("#name")
          .type(name)
          .should("have.value", name)
        cy.get("[type='submit']").click()
        cy.wait("@create_role").then(response => {
          const data = (response.responseBody as any).data
          cy.hasUrl(`${baseUrl}/${data.id}`)
        })
      })
    })
  })
  describe("Item", () => {
    const roleId = 1
    it("should require authentication", () => {
      cy.checkForAuth(`${baseUrl}/${roleId}`)
    })
    describe("After authentication", () => {
      beforeEach(() => {
        cy.server()
        cy.route("GET", `/roles/${roleId}`).as("get_role")
        cy.login(`${baseUrl}/${roleId}`)
      })
      it("should fetch data from api", () => {
        cy.wait("@get_role").then(response => {
          const role = (response.responseBody as any).data
          expect(role.id).to.eq(roleId)
        })
      })
    })
  })
})
