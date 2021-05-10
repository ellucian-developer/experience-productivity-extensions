require('dotenv').config();
const packageJson = require('./package.json');
const extensionConfig = require('./extension.js');
const Dotenv = require('dotenv-webpack');
 
const { webpackConfigBuilder } = require('@ellucian/experience-extension');

module.exports = async (env, options) => {

    // Generate Webpack configuration based on the extension.js file
    // and any optional env flags  ("--env verbose", "--env upload", etc)
    const webpackConfig = await webpackConfigBuilder({
        extensionConfig: extensionConfig,
        extensionVersion: packageJson.version,
        mode: options.mode || 'production',
        verbose: env.verbose || process.env.EXPERIENCE_EXTENSION_VERBOSE || false,
        upload: env.upload || process.env.EXPERIENCE_EXTENSION_UPLOAD || false,
        forceUpload: env.forceUpload || process.env.EXPERIENCE_EXTENSION_FORCE_UPLOAD || false,
        uploadToken: process.env.EXPERIENCE_EXTENSION_UPLOAD_TOKEN
    });

    // For advanced scenarios, dynamically modify webpackConfig here.

    webpackConfig.plugins.push(new Dotenv());

    const {module: {rules} } = webpackConfig;

    // remove the bogus svg rule
    const bogusRule = rules.findIndex(rule => rule.test.toString().includes('.svg$') );
    if (bogusRule >= 0) {
        rules.splice(bogusRule, 1);
    }

    rules.push({
        test: /\.(jpg|png|ttf)$/,
        use: [
            {
                loader: 'url-loader'
            }
        ]
    })

    webpackConfig.module.rules.unshift({
        test: /\.svg$/,
        use: [
            {
               loader: 'svg-url-loader'
            }
        ]
    })

    webpackConfig.module.rules.forEach( rule => {
        if (rule.loader === 'babel-loader' || rule.loader === 'eslit-loader') {
            rule.exclude = /node_modules\/(?!(@ellucian)\/)/
        }
    })

    return webpackConfig;
};