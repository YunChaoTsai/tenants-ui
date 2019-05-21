import { searchToQuery, queryToSearch, numberToLocalString } from "./utils"

describe("Utils:", () => {
  describe("searchToQuery:", () => {
    it("should return `{}` for undefined or empty search", () => {
      expect(searchToQuery()).toEqual({})
      expect(searchToQuery("")).toEqual({})
    })
    it("should return `{'a': 1}` for `?a=1`", () => {
      expect(searchToQuery(`?a=1`)).toEqual({ a: "1" })
    })
  })

  describe("queryToSearch:", () => {
    it("should return `` for undefined or empty query", () => {
      expect(queryToSearch()).toEqual(``)
      expect(queryToSearch({})).toEqual(``)
    })
    it("should return `?a=1` for `{'a': '1'}`", () => {
      expect(queryToSearch({ a: "1" })).toEqual(`?a=1`)
    })
  })

  describe("numberToLocalString", () => {
    it("should return a string with same value when number of digits is less then 3", () => {
      expect(numberToLocalString(1)).toEqual("1")
      expect(numberToLocalString(12)).toEqual("12")
      expect(numberToLocalString(123)).toEqual("123")
    })
    it("should add `,` after each 3 digits from right to left", () => {
      expect(numberToLocalString(1234)).toEqual("1,234")
      expect(numberToLocalString(123456789)).toEqual("123,456,789")
    })
    it("should not add `,` after decimal point", () => {
      expect(numberToLocalString(123456789.123123)).toEqual(
        "123,456,789.123123"
      )
      expect(numberToLocalString(0.123123)).toEqual("0.123123")
    })
  })
})
