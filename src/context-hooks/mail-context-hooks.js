import { createContext, useContext } from 'react';

export const Context = createContext()

export function useMail() {
    return useContext(Context);
}
