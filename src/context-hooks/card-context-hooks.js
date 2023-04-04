// Copyright 2021-2023 Ellucian Company L.P. and its affiliates.

import { createContext, useContext } from 'react';

export const Context = createContext()

export function useIntl() {
    const context = useContext(Context);

    return {
        intl: context.intl
    };
}

export function useComponents() {
    const context = useContext(Context);

    return context.components;
}
