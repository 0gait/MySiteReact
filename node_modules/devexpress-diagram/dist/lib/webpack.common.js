'use strict';
const TerserPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const path = require('path');

module.exports = {
    entry: {
        "dx-diagram": "./src/index.ts"
    },
    output: {
        library: ["DevExpress", 'diagram'],
        libraryTarget: "umd",
        filename: './[name].js',
        path: path.resolve("./dist"),
        globalObject: 'this'
    },
    module: {
        rules: [
            {
                test : /\.scss$/,
                use : [
					{
						loader: MiniCssExtractPlugin.loader
					},
					{
						loader: 'css-loader?-url'
					},
					{
						loader: 'sass-loader'
					}
                ]
            },
            {   
                test: /\.tsx?$/,
                use: 'ts-loader'
            },
        ]
    },
    resolve: {
        extensions: [ '.ts', '.tsx', '.js', '.scss' ]
    },
    optimization: {
        minimize: true,
        minimizer: [new TerserPlugin({
          test: /\.min\.js$/
        }),
        new OptimizeCSSAssetsPlugin({
            assetNameRegExp: /\.min\.css$/g
        })
        ]
      },
      plugins: [
        new MiniCssExtractPlugin({
          
        }),
      ],
};