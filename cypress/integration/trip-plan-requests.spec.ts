import * as faker from "faker"
import * as moment from "moment"

describe("Trip Plan Request", () => {
  const baseUrl = "/trip-plan-requests"
  describe("List", () => {
    it("Should require authentication", () => {
      cy.checkForAuth(baseUrl)
    })
    describe("After authentication", () => {
      before(() => {
        cy.server()
        cy.route("GET", /api\/trip-plan-requests/).as(
          "fetch_trip_plan_requests"
        )
      })
      beforeEach(() => {
        cy.login(baseUrl)
      })
      it("Should fetch the data from apis", () => {
        cy.wait("@fetch_trip_plan_requests")
      })
    })
  })
  describe("Item", () => {
    it("should require authentication", () => {
      cy.checkForAuth(`${baseUrl}/1`)
    })
    describe("After authentication", () => {
      let tripPlanRequestId = 1
      beforeEach(() => {
        cy.server()
        cy.login(`${baseUrl}`)
        cy.request({
          method: "POST",
          url: Cypress.config("apiBaseUrl") + "/trip-plan-requests",
          body: {
            name: faker.random.word(),
            phone_number: faker.phone.phoneNumber(),
            email: faker.internet.exampleEmail(),
            destination: faker.address.state(),
            start_date: moment(faker.date.future(1)).format(
              "YYYY-MM-DD hh:mm:ss"
            ),
            no_of_days: faker.random.number({ min: 1, max: 10, precision: 1 }),
            no_of_adults: faker.random.number({ min: 3, max: 6, precision: 1 }),
            no_of_childrent: faker.random.number({
              min: 0,
              max: 4,
              precision: 1,
            }),
          },
        })
          .then(resp => {
            tripPlanRequestId = resp.body.data.id
            return tripPlanRequestId
          })
          .then(tripPlanRequestId => {
            cy.visit(`${baseUrl}/${tripPlanRequestId}`)
            cy.route(
              "GET",
              new RegExp(`api/trip-plan-requests/${tripPlanRequestId}`, "gi")
            ).as("fetch_trip_plan_request_item")
          })
      })
      it("Should fetch data for trip plan request", () => {
        cy.wait("@fetch_trip_plan_request_item").then(response => {
          const data = (response.responseBody as any).data
          expect(data.id).to.eq(tripPlanRequestId)
        })
      })
      describe("After fetching", () => {
        beforeEach(() => {
          cy.wait("@fetch_trip_plan_request_item")
        })
        it("should a link to listing page", () => {
          cy.get(`[href="${baseUrl}"]`).should("exist")
        })
      })
    })
  })
})
