const wp = require("@cypress/webpack-preprocessor")
require("dotenv").config()

module.exports = (on, config) => {
  // `on` is used to hook into various events Cypress emits
  const options = {
    webpackOptions: require("../webpack.config"),
  }
  on("file:preprocessor", wp(options))
  // `config` is the resolved Cypress config
  config.baseUrl = process.env.APP_URL
  return config
}
