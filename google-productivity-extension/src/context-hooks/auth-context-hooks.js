import { createContext, useContext } from 'react';

export const Context = createContext({})

export function useAuth() {
    return useContext(Context);
}