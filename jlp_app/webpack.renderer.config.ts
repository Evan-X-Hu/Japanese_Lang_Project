import type { Configuration } from 'webpack';

import { rules } from './webpack.rules';
import { plugins } from './webpack.plugins';

// CSS Modules for *.module.css files
rules.push({
  test: /\.module\.css$/,
  use: [
    { loader: 'style-loader' },
    { loader: 'css-loader', options: { modules: true } },
  ],
});

// Plain CSS for everything else
rules.push({
  test: /\.css$/,
  exclude: /\.module\.css$/,
  use: [{ loader: 'style-loader' }, { loader: 'css-loader' }],
});

export const rendererConfig: Configuration = {
  module: {
    rules,
  },
  plugins,
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css'],
  },
};
