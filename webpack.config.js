const path = require('path')
const HTMLWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const TerserWebpackPlugin = require('terser-webpack-plugin')
const OptimizeCssAssetsWebpackPlugin = require('optimize-css-assets-webpack-plugin')

const isDev = process.env.NODE_ENV === 'development'
const isProd = !isDev

const optimization = () => {
  const config = {
    splitChunks: {
      chunks: 'all'
    }
  }

  if (isProd) {
    config.minimizer = [
      new OptimizeCssAssetsWebpackPlugin(),
      new TerserWebpackPlugin()
    ]
  }

  return config
}

const babelOptions = (...presets) => {
  const options = {
    presets: ['@babel/preset-env'],
    plugins: ['@babel/plugin-proposal-class-properties']
  }

  if (presets.length) options.presets.push(...presets)

  return options
}

const loaders = (...opts) => {
  const ldrs = [
    {
      loader: 'babel-loader',
      options: babelOptions(...opts)
    }
  ]

  if (isDev) ldrs.push('eslint-loader')

  return ldrs
}

module.exports = {
  mode: 'development',
  entry: {
    main: ['@babel/polyfill', './src/index.tsx']
  },
  output: {
    filename: '[name].[contenthash].js',
    path: path.resolve(__dirname, 'dist')
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.png', '.svg', '.json']
  },
  optimization: optimization(),
  devServer: {
    port: 3000,
    open: true
  },
  devtool: isDev ? 'source-map' : false,
  plugins: [
    new HTMLWebpackPlugin({
      template: './public/index.html',
      minify: {
        collapseWhitespace: isProd
      }
    }),
    new CleanWebpackPlugin(),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, 'public/favicon.ico'),
          to: path.resolve(__dirname, 'dist')
        }
      ]
    }),
    new MiniCssExtractPlugin({
      filename: '[name].[contenthash].css'
    })
  ],
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader']
      },
      {
        test: /\.(png|jpg|jpeg|svg|gif)$/,
        use: ['file-loader']
      },
      {
        test: /\.(ttf|woff|woff2|eot)$/,
        use: ['file-loader']
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: babelOptions()
          }
        ]
      },
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: loaders('@babel/preset-typescript')
      },
      {
        test: /\.jsx$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: babelOptions('@babel/preset-react')
          }
        ]
      },
      {
        test: /\.tsx$/,
        exclude: /node_modules/,
        use: loaders('@babel/preset-typescript', '@babel/preset-react')
      }
    ]
  }
}
