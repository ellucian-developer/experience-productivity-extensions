import { dispatch } from './events';
import log from 'loglevel';
const logger = log.getLogger('Google');

function loadScript({ src, identifier }) {
    logger.debug(`google-scripts loadScript for ${src} : ${identifier}`);
    return new Promise(resolve => {
        const element = document.getElementsByTagName('script')[0];
        const js = document.createElement('script');
        js.id = identifier;
        js.src = src;
        js.async = true;
        js.defer = true;
        element.parentNode.insertBefore(js, element);
        js.onload = () => {
            resolve(window[identifier]);
        }
    });
}

// initializes GAPI. Needed context is stored globally in window.
async function loadGoogleScripts({ providerId }) {
    const { gapi, google } = window;

    if (!gapi && !google) {
        logger.debug(`google-scripts ${providerId} loading scripts`);
        await Promise.all([
            loadScript({
                src: '//accounts.google.com/gsi/client',
                identifier: 'google-script'
            }),
            loadScript({
                src: '//apis.google.com/js/api.js',
                identifier: 'gapi-script'
            })
        ]);

        logger.debug(`google-scripts ${providerId} loaded scripts`);
    }
}

// initializes GAPI. Needed context is stored globally in window.
function initGapi({ providerId }){
    const { gapi } = window;

    if ( gapi && typeof gapi.load === 'function') {
        logger.debug(`google-scripts ${providerId} initializing gapi`);
            const discoveryDocs = [
                'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest',
                'https://gmail.googleapis.com/$discovery/rest?version=v1'
            ];

            return new Promise(resolve => {
                gapi.load('client', async () => {
                    await gapi.client.init({
                        discoveryDocs
                    });
                    resolve();
                })

            });
    } else {
        logger.debug(`google-scripts ${providerId} initGapi gapi not ready`);
        return Promise.reject(new Error('initGapi failed'));
    }
}

// initialize the auth2 token client. Needed context is stored globally in window.
const googleScope = 'email https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/gmail.readonly';
function initAuth2TokenClient({ clientId, providerId }){
    const { google, googleScriptContext: { tokenClient } = {} } = window;

    if ( google && !tokenClient ) {
        logger.debug(`google-scripts ${providerId} initializaing TokenClient`);
        const now = new Date();
        const newTokenClient = google.accounts.oauth2.initTokenClient({
            'client_id': clientId,
            scope: googleScope,
            callback: (tokenResponse) => {
                logger.debug(`google-scripts ${providerId} token callback: ${JSON.stringify(tokenResponse)}`);
                if (tokenResponse && tokenResponse.access_token) {
                    dispatch('google-event', {
                        reason: 'user-authenticated',
                        authUser: tokenResponse.authuser,
                        accessToken: tokenResponse.access_token,
                        expiresIn: now.setSeconds(now.getSeconds() + tokenResponse.expires_in)
                    });
                }
            }
        });

        window.googleScriptContext.tokenClient = newTokenClient;
    }
}

async function doInitialize(options) {
    try {
        await loadGoogleScripts(options);
        await initGapi(options);
        initAuth2TokenClient(options);

        window.googleScriptContext.state = 'ready';
        logger.debug(`google-scripts ${options.providerId} doInitialize done: 'ready'`);

        dispatch('google-event', {
            reason: 'ready'
        })
    } catch (error) {
        dispatch('google-event', {
            reason: 'error'
        })
    }
}

export function initialize(options) {
    const { googleScriptContext = {} } = window;
    window.googleScriptContext = googleScriptContext;
    const { state = 'init' } = googleScriptContext;

    if (state === 'init') {
        logger.debug(`google-scripts ${options.providerId} first to initialize`);
        googleScriptContext.state = 'initializing';
        doInitialize(options);

        return 'initializing';
    } else if (state === 'ready') {
        logger.debug(`google-scripts ${options.providerId} ready`);
        return 'ready';
    }

    logger.debug(`google-scripts ${options.providerId} already initializing`);
    return 'initializing';
}

export function getTokenClient(){
    const { googleScriptContext: { tokenClient } = {} } = window;

    return tokenClient;
}
