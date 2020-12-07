const path = require('path');

module.exports = {
  mode: 'production',
  entry: "./src/index.ts",
  output: {
	path: path.resolve(__dirname, 'public'),
    filename: './js/wptextileplugin_admin.js'
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js", ".json"],
    alias: {
      'util': 'util',
      'buffer': 'buffer',
    }
  },
  module: {
    rules: [
      // all files with a '.ts' or '.tsx' extension will be handled by 'ts-loader'
      { test: /\.tsx?$/, use: ["ts-loader"], exclude: /node_modules/ },
    ],
  },
};