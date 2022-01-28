// Copyright 2021-2022 Ellucian Company L.P. and its affiliates.

export function prepareFiles(files, dateFormater, dateFormaterWithYear) {
    files?.map((file) => {
        const { lastModifyingUser, modifiedTime: fileModifiedTime } = file;
    const fileModified = new Date(fileModifiedTime);
    file.modified = new Date().getFullYear() === fileModified.getFullYear()
        ? dateFormater.format(fileModified)
        : dateFormaterWithYear.format(fileModified);
    file.modifiedBy = lastModifyingUser ? lastModifyingUser.displayName : 'unknown';
    return true;
});
}
