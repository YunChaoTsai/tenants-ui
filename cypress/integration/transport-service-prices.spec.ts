import * as faker from "faker"
import * as moment from "moment"

describe("Transport Service Prices", () => {
  const baseUrl = "/transport-service-prices"
  describe("List", () => {
    it("Should require authentication", () => {
      cy.checkForAuth(baseUrl)
    })
    describe("After authentication", () => {
      before(() => {
        cy.server()
        cy.route("GET", "/cab-prices*").as("fetch_transport_service_prices")
      })
      beforeEach(() => {
        cy.login(baseUrl)
      })
      it("Should fetch the data from apis", () => {
        cy.wait("@fetch_transport_service_prices")
      })
      it("Should have a link to add new prices", () => {
        cy.get(`[href='${baseUrl}/new']`).should("exist")
      })
      it("should have a link to calculate price", () => {
        cy.get(`[href="${baseUrl}/calculate-price"]`).should("exist")
      })
    })
  })
  describe("New Transport Service Price", () => {
    it("Should require authentication", () => {
      cy.checkForAuth(`${baseUrl}/new`)
    })
    describe("After Authentication", () => {
      beforeEach(() => {
        cy.login(`${baseUrl}/new`)
        cy.server()
      })
      it("Should allow use to save new prices", () => {
        cy.get("form").should("exist")
        const startDate = faker.date.future(0.2)
        const endDate = faker.date.future(0.1, startDate)
        const perKmCharges = faker.random
          .number({ min: 8, max: 20, precision: 1 })
          .toString()
        const minKmsPerDay = faker.random
          .number({ min: 200, max: 600, precision: 1 })
          .toString()
        const tollChargesPerKm = faker.random
          .number({ min: 0, max: 2, precision: 0.1 })
          .toString()
        const nightChargesPerKm = faker.random
          .number({ min: 0, max: 2, precision: 0.1 })
          .toString()
        const parkingChargesPerKm = faker.random
          .number({ min: 0, max: 2, precision: 0.1 })
          .toString()
        cy.get("#prices\\.0\\.start_date")
          .type(moment(startDate).format("YYYY-MM-DD"))
          .should("have.value", moment(startDate).format("YYYY-MM-DD"))
        cy.get("#prices\\.0\\.end_date")
          .type(moment(endDate).format("YYYY-MM-DD"))
          .should("have.value", moment(endDate).format("YYYY-MM-DD"))
        cy.selectOption("#prices\\.0\\.cab_type")
        cy.selectOption("#prices\\.0\\.transport_service")
        cy.get("#prices\\.0\\.per_km_charges")
          .clear()
          .type(perKmCharges)
          .should("have.value", perKmCharges)
        cy.get("#prices\\.0\\.minimum_km_per_day")
          .clear()
          .type(minKmsPerDay)
          .should("have.value", minKmsPerDay)
        cy.get("#prices\\.0\\.toll_charges")
          .clear()
          .type(tollChargesPerKm)
          .should("have.value", tollChargesPerKm)
        cy.get("#prices\\.0\\.night_charges")
          .clear()
          .type(nightChargesPerKm)
          .should("have.value", nightChargesPerKm)
        cy.get("#prices\\.0\\.parking_charges")
          .clear()
          .type(parkingChargesPerKm)
          .should("have.value", parkingChargesPerKm)
        cy.get('[type="submit"]').click()
        cy.hasUrl(baseUrl)
      })
      it("Should have a way to come back to listing", () => {
        cy.contains("Cancel").click()
        cy.hasUrl(baseUrl)
      })
    })
  })
})
