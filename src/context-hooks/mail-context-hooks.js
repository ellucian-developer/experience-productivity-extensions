// Copyright 2021-2023 Ellucian Company L.P. and its affiliates.

import { createContext, useContext } from 'react';

export const Context = createContext()

export function useMail() {
    return useContext(Context);
}
