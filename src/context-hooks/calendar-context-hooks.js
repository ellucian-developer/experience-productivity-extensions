import { createContext, useContext } from 'react';

export const Context = createContext({})

export function useCalendar() {
    return useContext(Context);
}