import * as faker from "faker"

describe("Hotels", () => {
  const baseUrl = "/hotels"
  describe("List", () => {
    it("Should require authentication", () => {
      cy.checkForAuth(baseUrl)
    })
    describe("After authentication", () => {
      before(() => {
        cy.server()
        cy.route("GET", /api\/hotels/).as("fetch_hotels")
      })
      beforeEach(() => {
        cy.login(baseUrl)
      })
      it("Should fetch the data from apis", () => {
        cy.wait("@fetch_hotels")
      })
      it("Should have a link to add new hotel", () => {
        cy.get(`[href='${baseUrl}/new']`).should("exist")
      })
      it("should have a link to calculate price", () => {
        cy.get(`[href="${baseUrl}/calculate-price"]`).should("exist")
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
        cy.server()
        cy.route("GET", /api\/locations/).as("fetch_locations")
        cy.route("POST", /api\/hotels/).as("store_hotel")
      })
      it("Should allow use to save a hotel", () => {
        cy.get("form").should("exist")
        const name = faker.company.companyName()
        const stars = faker.random
          .number({ min: 1, max: 5, precision: 1 })
          .toString()
        cy.get("#name")
          .type(name)
          .should("have.value", name)
        cy.get("#location")
          .as("location_input")
          .type("Jaipur")
          .wait("@fetch_locations")
          .selectOption("@location_input", 1)
        cy.selectOption("#payment_preference", 1)
        cy.selectOption("#meal_plans", 1, 2, 3)
        cy.get("#stars")
          .clear()
          .type(stars)
          .should("have.value", stars)
        cy.selectOption("#room_types\\.0\\.room_types", 1, 2, 3)
        cy.get("#room_types\\.0\\.allowed_extra_beds")
          .clear()
          .type("1")
          .should("have.value", "1")
        const e_b_c_a_s = faker.random
          .number({ min: 2, max: 8, precision: 1 })
          .toString()
        const e_b_c_a_e = faker.random
          .number({ min: parseInt(e_b_c_a_s) + 4, max: 14, precision: 1 })
          .toString()
        cy.get("#extra_bed_child_age_start")
          .clear()
          .type(e_b_c_a_s)
          .should("have.value", e_b_c_a_s)
        cy.get("#extra_bed_child_age_end")
          .clear()
          .type(e_b_c_a_e)
          .should("have.value", e_b_c_a_e)
        cy.get("[type='submit']").click()
        cy.wait("@store_hotel").then(response => {
          const data = (response.responseBody as any).data
          cy.hasUrl(`${baseUrl}/${data.id}`)
        })
      })
      it("Should have a way to come back to listing", () => {
        cy.contains("Cancel").click()
        cy.hasUrl(baseUrl)
      })
    })
  })
  describe("Item", () => {
    it("should require authentication", () => {
      cy.checkForAuth(`${baseUrl}/1`)
    })
    describe("After authentication", () => {
      let hotelId = 1
      beforeEach(() => {
        cy.server()
        cy.route("GET", /api\/hotels\/1/).as("fetch_hotel")
        cy.route("GET", /api\/hotel-prices/).as("fetch_prices")
        cy.login(`${baseUrl}/1`)
      })
      it("Should fetch data for hotel", () => {
        cy.wait("@fetch_hotel").then(response => {
          const hotel = (response.responseBody as any).data
          expect(hotel.id).to.eq(1)
        })
      })
      describe("After fetching", () => {
        beforeEach(() => {
          cy.wait("@fetch_hotel")
        })
        it("should a link to listing page", () => {
          cy.get(`[href="${baseUrl}"]`).should("exist")
        })
        it("should have a link to add new hotel", () => {
          cy.get(`[href="${baseUrl}/new"]`).should("exist")
        })
        it("should render a list of meal plans", () => {
          cy.getByText("Meal Plans:").should("exist")
        })
        it("should render a list of room types", () => {
          cy.getByText("Room Types:").should("exist")
        })
        it("should render hotel's payment preferences", () => {
          cy.getByText("Payment Preference").should("exist")
        })
        it("should have a link to calculate price", () => {
          cy.get(`[href="${baseUrl}/calculate-price"]`).should("exist")
        })
        it("should have a link to add prices", () => {
          cy.get(`[href="${baseUrl}/${hotelId}/add-prices"]`)
        })
        it("should fetch the prices", () => {
          cy.wait("@fetch_prices")
        })
        describe("Add Contact", () => {
          beforeEach(() => {
            cy.getByTestId("add_contact").as("add_contact")
          })
          it("should have button to add contact", () => {
            cy.get("@add_contact").should("exist")
          })
          it("should open a dialog with Add Contact as title", () => {
            cy.get("@add_contact").click()
            cy.get("[role='dialog']")
              .as("dialog")
              .should("exist")
            cy.get("[role='dialog'] .dialog-title").should(
              "contain",
              "Add Contact"
            )
          })
        })
      })
    })
  })
})
