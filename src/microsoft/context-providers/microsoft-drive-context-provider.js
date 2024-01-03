// Copyright 2021-2023 Ellucian Company L.P. and its affiliates.

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
// eslint-disable-next-line camelcase
import { unstable_batchedUpdates } from 'react-dom';

import { getFileTypeIconUriByExtension } from '@microsoft/mgt-components/dist/es6/styles/fluent-icons';

import { useAuth } from '../../context-hooks/auth-context-hooks';
import { Context } from '../../context-hooks/drive-context-hooks';
import { expMobileExtensionId } from '../../../microsoft-extension'
import log from 'loglevel';
const logger = log.getLogger('Microsoft');

const refreshInterval = 60000;

export function getFileIcon(file) {
    const re = /(?:\.([^.]+))?$/;
    let fileType = 'folder';
    if (file.package === undefined && file.folder === undefined) {
        fileType = re.exec(file.name)[1] ? re.exec(file.name)[1].toLowerCase() : 'null'
    } else if (file.package !== undefined) {
        fileType = file.package.type === 'oneNote' ? 'onetoc' : 'folder'
    }
    let fileIconSrc = getFileTypeIconUriByExtension(fileType, 48, 'svg');
    if (fileIconSrc == null) {
        fileIconSrc = getFileTypeIconUriByExtension('genericfile', 48, 'svg');
    }
    return fileIconSrc;
}

export function getFilteredFiles(files) {
    const filteredFiles = files.filter(file => {
        if (file.folder === undefined) {
            file.iconLink = getFileIcon(file);
            file.iconSize = '24';
            file.lastModifyingUser = file.lastModifiedBy ? file.lastModifiedBy.user : {};
            delete file.lastModifiedBy;
            file.modifiedTime = file.lastModifiedDateTime;
            delete file.lastModifiedDateTime;
            file.webViewLink = file.webUrl;
            delete file.webUrl;
            return true;
        } else { return false }
    })
    const totalFileCount = filteredFiles.length;
    if (totalFileCount > 10) {
        for (let index = totalFileCount; index > 9; index--) {
            filteredFiles.splice(index, 1);
        }
    }
    return filteredFiles;
}

export function MicrosoftDriveProvider({children}) {
    const { client, loggedIn, setLoggedIn } = useAuth();
    const [error, setError] = useState(false);
    const [state, setState] = useState('load');
    const [files, setFiles] = useState();

    const refresh = useCallback(async () => {
        if (loggedIn) {
            // if not force load and not curent visible, skip it
            if (state === 'refresh' && document.hidden) {
                logger.debug(`OneDrive skipping refresh when document is hideen`);
                return;
            }
            logger.debug(`${files === undefined ? 'loading' : 'refreshing'} OneDrive files`);

            try {
                const response = await client.api(
                    `/me/drive/search(q='')?$orderby=lastModifiedDateTime%20desc&$top=20&$select=id,name,file,folder,package,webUrl,lastModifiedBy,lastModifiedDateTime`
                ).get();

                const files = response.value;
                // filter out folders and transform
                const filteredFiles = getFilteredFiles(files);
                unstable_batchedUpdates(() => {
                    setFiles(() => filteredFiles);
                    setState('loaded');
                })
            } catch (error) {
                // check whether we are in the native app
                if (window?.isInNativeApp ? !window.isInNativeApp() : true) {
                    // did we get logged out or credentials were revoked?
                    if (error && error.status === 401) {
                        setLoggedIn(false);
                    } else {
                        logger.error('OneDrive msal failed', error);
                        unstable_batchedUpdates(() => {
                            setState(() => ({ error: 'api' }));
                            setError(error);
                        })
                    }
                } else if (window?.invokeNativeFunction) {
                    window.invokeNativeFunction('acquireMobileToken', {randomVal: Math.random(), expMobileExtensionId}, false)
                }
            }
        }
    }, [loggedIn, state])

    useEffect(() => {
        if (loggedIn && (state === 'load' || state === 'refresh')) {
            refresh();
        } else if (!loggedIn && state === 'loaded') {
            // force refresh when logged back in
            setFiles(undefined);
            setState('load');
        }
    }, [loggedIn, refresh, state])

    useEffect(() => {
        let timerId;

        function startInteval() {
            stopInteval();
            // only start if document isn't hidden
            if (!document.hidden) {
                logger.debug('Microsoft drive starting interval');

                timerId = setInterval(() => {
                    setState('refresh');
                }, refreshInterval);
            }
        }

        function stopInteval() {
            if (timerId) {
                logger.debug('Microsoft drive stopping interval');
                clearInterval(timerId)
                timerId = undefined;
            }
        }

        function visibilitychangeListener() {
            logger.debug('Microsoft drive visiblity changed');
            if (document.hidden) {
                stopInteval();
            } else {
                setState('refresh');
                startInteval();
            }
        }

        if (loggedIn) {
            document.addEventListener('visibilitychange', visibilitychangeListener);
            startInteval();
        }

        return () => {
            document.removeEventListener('visibilitychange', visibilitychangeListener);
            if (timerId) {
                clearInterval(timerId)
            }
        }
    }, [loggedIn, setState]);

    const contextValue = useMemo(() => {
        return {
            error,
            files,
            refresh: () => { setState('refresh') }
        }
    }, [ error, files, setState ]);

    useEffect(() => {
        logger.debug('MicrosoftDriveProvider mounted');

        return () => {
            logger.debug('MicrosoftDriveProvider unmounted');
        }
    }, []);

    return (
        <Context.Provider value={contextValue}>
            {children}
        </Context.Provider>
    )
}

MicrosoftDriveProvider.propTypes = {
    children: PropTypes.object.isRequired
}
