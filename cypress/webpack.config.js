process.env.NODE_ENV = "test"
process.env.BABEL_ENV = "test"

module.exports = {
  resolve: {
    extensions: [".ts", ".js"],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: [/node_modules/],
        use: [
          {
            loader: require.resolve("babel-loader"),
            options: {
              customize: require.resolve(
                "babel-preset-react-app/webpack-overrides"
              ),
              presets: [require.resolve("babel-preset-react-app")],
            },
          },
        ],
      },
    ],
  },
}
