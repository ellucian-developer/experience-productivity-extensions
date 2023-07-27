/* eslint-disable no-underscore-dangle */
import { memoize, uniqueId } from 'lodash';
// import { eLog } from '@ellucian/experience-app-core';

const invokables = {};

const wrapObject = (obj) => JSON.stringify(obj);

// Mobile app appends 'Experience/APP_VERSION' to the user agent
// This helper looks at that and returns whether we are in the app
// Memoized for performance
export const isInNativeApp = memoize(_isInNativeApp);
export function _isInNativeApp() {
    return window.navigator.userAgent.includes('Experience/');
}

// Mobile app appends 'Experience/APP_VERSION' to the user agent
// This helper looks at that and returns the APP_VERSION
// Memoized for performance
export const getAppVersion = memoize(_getAppVersion);
export function _getAppVersion() {
    let appVersion = '';
    if (isInNativeApp()) {
        const ua = window.navigator.userAgent;
        const re = /Experience\/([\d+\\.]+)/;
        const match = ua.match(re);
        if (match?.length > 0) {
            appVersion = match[1];
        }
    }
    return appVersion;
}

/*
  App --> Web --> App
    web code (inside React components) calls setInvokable, passing in a funciton name and a handler.
    app uses injectJavaScript to call these functions via window.WEB_INVOKE
    WEB_INVOKE calls the web function and uses postMessage to send result back to app
*/
export const setInvokable = (fnName, webFunction) => {

    if (!fnName || !webFunction) {
        console.log({
            message: "Mandatory Paramters Function Name and/or Function Body is missing",
            opts: { marker: "setInvokable", component: "mobileAppUtil.setInvokable" }
        });
        return;
    }
    invokables[fnName] = webFunction;
};


window.APP_INVOKE_RESPONSE_HANDLERS = {};

window.WEB_INVOKE = (fnName, requestId, data) => {

    if (invokables[fnName]) {
        Promise.resolve(invokables[fnName](data))
            .then((result) => {
                window.ReactNativeWebView.postMessage(wrapObject({ type: 'response', requestId, result }));
            });
    } else {
        console.log({
            message: `Unable to invoke Function : ${fnName} from App`,
            opts: { marker: "WEB_INVOKE", component: "mobileAppUtil.WEB_INVOKE", correlationData: { requestId: requestId } }
        });
    }
};


/*
  Web --> App --> Web
    invokeNativeFunction returns a promise
    resolve function of promised is stored globally
    sends message to native app to do work
    when app has completed the work, it invokes the resolve function
*/
export const invokeNativeFunction = (name, paramsObject = {}, responseRequired = true) => {

    const requestId = uniqueId('web-mobileApp-web-');
    console.log({
        message: `Invoking native Function ${name}, request ${requestId}`,
        opts: { marker: "invokeNativeFunction", component: "mobileAppUtil.invokeNativeFunction", correlationData: { requestId: requestId } }
    });

    let promise;

    if (responseRequired) {
        promise = new Promise((resolve) => {
            window.APP_INVOKE_RESPONSE_HANDLERS[requestId] = resolve;
        });
    }

    if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(wrapObject({ type: 'request', fn: name, params: paramsObject, responseRequired, requestId }));
    } else {
        console.log({
            message: `No ReactNativeWebView to invoke native Function ${name}, request ${requestId}`,
            opts: { marker: "invokeNativeFunction", component: "mobileAppUtil.invokeNativeFunction", correlationData: { requestId: requestId } }
        });
    }

    return promise;
}
