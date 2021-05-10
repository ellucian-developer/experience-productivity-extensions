import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';

import { useAuth } from './auth-context';

const Context = createContext()

export function DriveProvider({children}) {
    const { gapi, loggedIn } = useAuth();

    const [files, setFiles] = useState();

    const contextValue = useMemo(() => {
        return {
            files
        }
    }, [ files ]);

	useEffect(() => {
		if (gapi && loggedIn) {

			(async () => {
				const search = `mimeType != 'application/vnd.google-apps.folder'`;
				try {
					const response = await gapi.client.drive.files.list({
						pageSize: 10,
						fields: 'nextPageToken, files(id, iconLink, name, lastModifyingUser, modifiedTime, webViewLink)',
						q: search
					});

					const data = JSON.parse(response.body);
					setFiles(() => data.files);
				} catch (error) {
					console.error('gapi failed', error);
				}
			})();
		}
	}, [ gapi, loggedIn ])

    if (process.env.NODE_ENV === 'development') {
        useEffect(() => {
            console.log('DriveProvider mounted');

            return () => {
                console.log('DriveProvider unmounted');
            }
        }, []);
    }

    return (
        <Context.Provider value={contextValue}>
            {children}
        </Context.Provider>
    )
}

DriveProvider.propTypes = {
    children: PropTypes.object.isRequired
}

export function useDrive() {
    return useContext(Context);
}
