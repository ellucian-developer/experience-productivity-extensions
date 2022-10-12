// Copyright 2021-2022 Ellucian Company L.P. and its affiliates.

const dotenv = require('dotenv');
const packageJson = require('./w75_package.json');
const extensionConfig = require('./w75_onedrive-extension.js');
const Dotenv = require('dotenv-webpack');

dotenv.config();

const { webpackConfigBuilder } = require('@ellucian/experience-extension');

module.exports = async (env, options) => {

    const additionalDotEnvFile = options.mode === 'development' ? '.env.dev' : '.env.prod';
    dotenv.config({ path: additionalDotEnvFile});

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

    // this is needed for @ellucian/experience-extension-hooks
    webpackConfig.module.rules.forEach( rule => {
        if (rule.loader === 'babel-loader') {
            rule.exclude = /node_modules\/(?!(@ellucian)\/)/
        }
    })

    return webpackConfig;
};
