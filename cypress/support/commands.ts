const loginUrl = "/login"

function login(
  redirectTo = "/",
  email = "developer@local.com",
  password = "welcome@tpdev"
) {
  cy.request({
    method: "POST",
    url: Cypress.config("apiBaseUrl") + "/login",
    body: {
      email,
      password,
    },
  }).then(resp => {
    window.localStorage.setItem("access_token", resp.body.access_token)
  })
  cy.visit(redirectTo)
}
Cypress.Commands.add("login", login)

function hasUrl(url: string) {
  const baseUrl = Cypress.config("baseUrl")
  cy.url().should("equal", baseUrl + url)
}
Cypress.Commands.add("hasUrl", hasUrl)

function checkForAuth(url: string) {
  cy.visit(url)
  cy.wait(100)
  cy.hasUrl(`${loginUrl}?next=${url}`)
}
Cypress.Commands.add("checkForAuth", checkForAuth)

declare namespace Cypress {
  interface Chainable {
    login: typeof login
    hasUrl: typeof hasUrl
    checkForAuth: typeof checkForAuth
  }
  interface ConfigOptions {
    apiBaseUrl: string
  }
}
