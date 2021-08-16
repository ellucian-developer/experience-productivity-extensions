export function filterFiles(filesIn) {
	// filter out trashed items and limit to 10
	let filteredCount = 0;
	const files = filesIn.filter(file => {
		if (!file.trashed) {
			filteredCount++;
			return filteredCount <= 10
		} else {
			return false;
		}
	});

	return files;
}

export async function getDriveFiles() {
	const search = `mimeType != 'application/vnd.google-apps.folder'`;
	const { gapi } = window;
	const response = await gapi.client.drive.files.list({
		pageSize: 20,
		fields: 'nextPageToken, files(id, iconLink, name, lastModifyingUser, modifiedTime, trashed, viewedByMe, webViewLink)',
		// fields: '*',
		q: search
	});

	const data = JSON.parse(response.body);

	const files = filterFiles(data.files);

	return files;
}
