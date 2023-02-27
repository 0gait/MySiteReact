const merge = require('webpack-merge');
const webpack = require('webpack');
const common = require('./webpack.common.js');
const fs = require("fs");
const eula = "https://www.devexpress.com/Support/EULAs";

module.exports = merge(common, {
  entry: {
    "dx-diagram.min": "./src/index.ts",
  },
  mode: 'production',
  plugins: [
    new webpack.BannerPlugin({
      banner: fs.readFileSync('./.license-header', 'utf8')
        .replace("[version]", require("./package.json").version)
        .replace("[year]", new Date().getFullYear())
        .replace("[eula]", eula)
        .replace("[date]", new Date().toDateString()),
      test: /\.(js|css|scss)$/
    })
  ],
});