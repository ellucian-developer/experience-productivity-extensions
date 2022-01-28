// Copyright 2021-2022 Ellucian Company L.P. and its affiliates.

import { createContext, useContext } from 'react';

export const Context = createContext()

export function useDrive() {
    return useContext(Context);
}
