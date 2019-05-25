function login(
  redirectTo = "/",
  email = "developer@local.com",
  password = "welcome@tpdev"
) {
  cy.server()
  cy.route("POST", "/login").as("login")
  cy.visit(`/login?next=${redirectTo}`)
  cy.get("#email").type(email)
  cy.get("#password").type(password)
  cy.get("button").click()
  cy.wait("@login")
}

declare namespace Cypress {
  interface Chainable {
    login: typeof login
  }
}

Cypress.Commands.add("login", login)
