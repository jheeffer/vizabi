'use strict';
/*eslint no-process-env:0*/

var path = require('path');
var Clean = require('clean-webpack-plugin');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var CompressionPlugin = require('compression-webpack-plugin');

var bourbon = require('node-bourbon').includePaths;

var config = {
  template: 'index.tmpl.html',
  index: 'index.html',
  src: './client/src',
  dest: './client/dist/tools'
};

var isProduction = process.env.NODE_ENV === 'production';

var absSrc = path.join(__dirname, config.src);
var absDest = path.join(__dirname, config.dest);
var wConfig = {
  debug: true,
  profile: true,
  cache: true,
  devtool: isProduction ? 'sourcemaps' : 'eval',
  context: path.join(__dirname, config.src),
  entry: {
    'vizabi-tools': './js/app.js',
    angular: ['angular', 'angular-route', 'angular-touch', 'd3']
  },
  output: {
    path: absDest,
    publicPath: '/tools/',
    filename: 'components/[name]-[hash:6].js',
    chunkFilename: 'components/[name]-[hash:6].js'
  },
  resolve: {
    root: [absSrc],
    modulesDirectories: ['./components', 'node_modules'],
    extensions: ['', '.js', '.png', '.gif', '.jpg']
  },
  module: {
    //noParse: new RegExp(require.resolve("vizabi"), 'ig'),
    loaders: [
      {
        test: require.resolve('vizabi'),
        loader: 'imports?this=>window'
      },
      {
        test: /\.scss/,
        //loader: 'style!css!sass?includePaths[]=' + bourbon
        loader: ExtractTextPlugin.extract('style-loader', 'css-loader?sourceMap&root=' + absSrc + '!sass-loader?includePaths[]=' + bourbon)
      },
      {
        test: /\.css$/,
        loader: ExtractTextPlugin.extract('style-loader', 'css-loader?sourceMap&root=' + absSrc)
        //loader: 'style!css'//?root=' + absSrc
      },
      {
        test: /\.(png|jpg|gif)$/,
        loader: 'url?name=assets/img/[name].[ext]&limit=10000'
      },
      {
        test: /\.html$/,
        loader: 'html?name=[name].[ext]&root=' + absSrc
      },

      {
        test: /\.woff(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'url?name=assets/fonts/[name].[ext]&limit=10000&mimetype=application/font-woff'
      },
      {
        test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'url?name=assets/fonts/[name].[ext]&limit=10000&mimetype=application/font-woff'
      },
      {
        test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'url?name=assets/fonts/[name].[ext]&limit=10000&mimetype=application/octet-stream'
      },
      {test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, loader: 'file?name=assets/fonts/[name].[ext]'},
      {
        test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'url?name=assets/fonts/[name].[ext]&limit=10000&mimetype=image/svg+xml'
      }
    ]
  },
  plugins: [
    new Clean([config.dest]),
    new webpack.DefinePlugin({
      _isDev: !isProduction
    }),
    new ExtractTextPlugin('[name]-[hash:6].css'),
    new HtmlWebpackPlugin({
      filename: config.index,
      template: path.join(config.src, config.template),
      chunks: ['angular', 'vizabi-tools'],
      minify: true
    })
  ],
  pushPlugins: function () {
    if (!isProduction) {
      return;
    }

    console.log('Adding production plugins');
    this.plugins.push.apply(this.plugins, [
      // production only
      new webpack.optimize.UglifyJsPlugin(),
      new CompressionPlugin({
        asset: '{file}.gz',
        algorithm: 'gzip',
        regExp: /\.js$|\.html|\.css|.map$/,
        threshold: 10240,
        minRatio: 0.8
      })
    ]);
  },
  stats: {colors: true, progress: true, children: false},
  devServer: {
    contentBase: config.dest,
    publicPath: '/tools/',
    noInfo: true,
    hot: true,
    inline: true,
    historyApiFallback: true,
    devtool: 'eval',
    proxy: {
      '*/api/*': 'http://localhost:' + process.env.PORT || '3001'
    }
  }
};

wConfig.pushPlugins();

module.exports = wConfig;
