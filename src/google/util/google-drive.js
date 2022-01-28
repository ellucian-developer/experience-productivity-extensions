// Copyright 2021-2022 Ellucian Company L.P. and its affiliates.

export async function getDriveFiles() {
	const search = 'mimeType != \'application/vnd.google-apps.folder\' and trashed = false';
	const { gapi } = window;
	const response = await gapi.client.drive.files.list({
		pageSize: 10,
		fields: 'nextPageToken, files(id, iconLink, name, lastModifyingUser, modifiedTime, trashed, viewedByMe, webViewLink)',
		// fields: '*',
		q: search
	});

	const {files} = JSON.parse(response.body);

	return files;
}
