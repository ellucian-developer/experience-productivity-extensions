import { createContext, useContext } from 'react';

export const Context = createContext()

export function useDrive() {
    return useContext(Context);
}
