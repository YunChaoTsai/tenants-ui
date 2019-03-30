import { searchToQuery, queryToSearch } from "./utils"

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
})
