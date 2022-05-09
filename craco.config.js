const webpack = require("webpack");

/**
 * Fallbacks are required due to webpack 5 no longer supplying node polyfills by default
 * Rather than eject from CRA, we use craco to patch in what we need. What is included here is
 * only what is required to resolve all compiler errors.
 * See https://github.com/facebook/create-react-app/issues/11756
 */

module.exports = {
    webpack: {
        configure: {
            resolve: {
                fallback: {
                    path: require.resolve("path-browserify"),
                }
            },
            externals: {
                "Buffer": "Buffer",
                "crypto": "Crypto",
                "stream": "stream"
            },
            plugins: [
                new webpack.ProvidePlugin({
                    Buffer: ["buffer", "Buffer"],

                }),
                new webpack.DefinePlugin({
                    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
                    'process.env.NODE_DEBUG': JSON.stringify(process.env.NODE_DEBUG),
                    'process.type': JSON.stringify(process.type),
                    'process.version': JSON.stringify(process.version),
                })
            ],
        }
    },
};