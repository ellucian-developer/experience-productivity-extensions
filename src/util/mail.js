// Copyright 2021-2022 Ellucian Company L.P. and its affiliates.

import {
    fountain400,
    iris400,
    kiwi400,
    meadow400,
    purple400,
    saffron400,
    tangerine400
} from '@ellucian/react-design-system/core/styles/tokens';

const colors = [ fountain400, iris400, kiwi400, meadow400, purple400, saffron400, tangerine400 ];
export function pickAvatarColor(email, colorsContext) {
    const { colorsUsed, colorsByUser } = colorsContext;
    let color = colorsByUser[email];
    if (!color) {
        let colorsLeft = colors.filter( c => !colorsUsed.includes(c) );
        if (colorsLeft.length === 0) {
            colorsLeft = colors;
        }

        const colorIndex = Math.floor(Math.random() * colorsLeft.length);
        color = colorsLeft[colorIndex];
        colorsUsed.push(color);
        colorsByUser[email] = color;
    }

    return color;
}

export function isToday(dateToCheck) {
    const today = new Date();
    return today.getFullYear() === dateToCheck.getFullYear() &&
        today.getMonth() === dateToCheck.getMonth() &&
        today.getDate() === dateToCheck.getDate()
}

export function getInitials(fromName) {
    let fromInitials = '';
    if (fromName.slice(0, 1) === '"') {
        fromInitials = fromName.slice(1, 2);
    } else if (fromName.includes(',')) {
        // last name first name separated by comma
        // eslint-disable-next-line no-unused-vars
        const [_, lastName = '', firstName = ''] = fromName.match(/([^, ]+),[ ]*([^ ]*)/);
        fromInitials = `${lastName.slice(0, 1)}${firstName.slice(0, 1)}`
    } else {
        const [firstName = '', lastName = ''] = fromName.split(' ');
        fromInitials = `${firstName.slice(0, 1)}${lastName.slice(0, 1)}`
    }
    return fromInitials;
}
