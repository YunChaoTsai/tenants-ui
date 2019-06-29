const loginUrl = "/login"

function login(
  redirectTo = "/",
  email = "developer@local.com",
  password = "welcome@tpdev"
) {
  cy.server()
  cy.route("GET", "/me").as("fetch_me")
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
  cy.wait("@fetch_me")
}
Cypress.Commands.add("login", login)

function hasUrl(url: string) {
  const baseUrl = Cypress.config("baseUrl")
  cy.url().should("equal", baseUrl + url)
}
Cypress.Commands.add("hasUrl", hasUrl)

function checkForAuth(url: string) {
  cy.visit(url)
  cy.wait(1)
  cy.hasUrl(`${loginUrl}?next=${url}`)
}
Cypress.Commands.add("checkForAuth", checkForAuth)

function selectOption(inputSelector: string, ...indexes: Array<number>) {
  return cy
    .get(inputSelector)
    .click()
    .then($input => {
      const $container = $input.parent()
      function selectOption(index: number) {
        cy.wrap($container.find(`> ol > :nth-child(${index})`)).click()
      }
      if (indexes.length === 0) {
        indexes = [1]
      }
      indexes.forEach(selectOption)
      return cy.get(inputSelector)
    })
}
Cypress.Commands.add("selectOption", selectOption)

declare namespace Cypress {
  interface Chainable {
    login: typeof login
    hasUrl: typeof hasUrl
    checkForAuth: typeof checkForAuth
    selectOption: typeof selectOption
  }
  interface ConfigOptions {
    apiBaseUrl: string
  }
}
