import TerserPlugin from "terser-webpack-plugin";

export default {
  output: {
    filename: 'bundle.js',
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({ extractComments: false }),
    ],
  },
  mode: 'production',
}