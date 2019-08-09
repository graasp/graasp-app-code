const path = require('path');
const glob = require('glob');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const InterpolateHtmlPlugin = require('interpolate-html-plugin');
const ScriptExtHtmlWebpackPlugin = require('script-ext-html-webpack-plugin');

// from: https://github.com/facebook/create-react-app/blob/master/packages/react-scripts/config/env.js
// grab react app environment variables
const REACT_APP = /^REACT_APP_/i;
const REACT_ENV = Object.keys(process.env)
  .filter(key => REACT_APP.test(key))
  .reduce(
    (env, key) => {
      // eslint-disable-next-line no-param-reassign
      env[key] = process.env[key];
      return env;
    },
    {
      // minified version should always be in production
      NODE_ENV: 'production',
      // minified version should always relative base
      PUBLIC_URL: '.',
    }
  );

module.exports = {
  entry: {
    'bundle.js': glob
      .sync('build/static/?(js|css)/*.?(js|css)')
      .map(f => path.resolve(__dirname, f)),
  },
  output: {
    filename: 'dist/bundle.min.js',
    publicPath: `${__dirname}`,
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [
    new UglifyJsPlugin(),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'public/index.html',
      inlineSource: '.(js|css)$',
    }),
    new ScriptExtHtmlWebpackPlugin({
      inline: 'bundle',
      preload: /\.js$/,
    }),
    new InterpolateHtmlPlugin(REACT_ENV),
  ],
};
