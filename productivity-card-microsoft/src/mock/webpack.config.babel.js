/* eslint-disable new-parens, no-useless-escape */
const webpack = require('webpack');
const path = require('path');
const LodashModuleReplacementPlugin = require('lodash-webpack-plugin');
const fs = require('fs-extra');
const json5 = require('json5');

function processExtensionJson() {
    // to support a extension.json5 either one gets parsed and stored as JSON in .dist
    const buildDir = path.resolve(__dirname, 'build');
    // eslint-disable-next-line no-sync
    fs.ensureDirSync(buildDir);

    // attempt to load, parse json5 and write to JSON
    const extensionJson5Path ='./extension.json5';
    const extensionJsonPath = './extension.json';
    const buildExtensionJsonPath = path.resolve(buildDir, 'extension.json');
    try {
        // eslint-disable-next-line no-sync
        const data = fs.readFileSync(extensionJson5Path);
        console.log('Processing extension.json5 ...');
        const extension = json5.parse(data)

        // eslint-disable-next-line no-sync
        fs.writeJsonSync(buildExtensionJsonPath, extension);
    } catch(error) {
        try {
            // eslint-disable-next-line no-sync
            fs.copyFileSync(extensionJsonPath, buildExtensionJsonPath);
        } catch(error) {
            const message = 'extension.json is missing\n\n';
            console.error(message);
            // eslint-disable-next-line no-process-exit
            process.exit(1);
        }
    }
}

processExtensionJson();

const config = {
    entry: {
        mock: './src/mock/index.jsx'
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js',
        publicPath: '/'
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                use: 'babel-loader',
                exclude: /node_modules/
            },
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    'css-loader'
                ]
            },
            {
                test: /\.scss$/,
                use: [
                    'style-loader',
                    'css-loader',
                    'sass-loader'
                ]
            },
            {
                test: /\.svg$/,
                use: 'file-loader'
            }
        ]
    },
    resolve: {
        extensions: [
            '.js',
            '.jsx'
        ]
    },
    devServer: {
        contentBase: './dist',
        historyApiFallback: true
    },
    plugins: [
        new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /en/),
        new LodashModuleReplacementPlugin({
            'paths': true
        })
    ]
}

module.exports = config;