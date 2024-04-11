// Copyright 2021-2023 Ellucian Company L.P. and its affiliates.

const dotenv = require('dotenv');
const packageJson = require('./package.json');
const extensionConfig = require('./microsoft-extension.js');
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
        uploadToken: process.env.EXPERIENCE_EXTENSION_UPLOAD_TOKEN,
        liveReload: env.liveReload || false,
        port: process.env.PORT || 8082
    });

    // For advanced scenarios, dynamically modify webpackConfig here.
    webpackConfig.plugins.push(new Dotenv());

    return webpackConfig;
};
