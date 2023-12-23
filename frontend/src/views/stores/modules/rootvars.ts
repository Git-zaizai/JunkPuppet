import { create } from "zustand"

interface RootVars {
    isTheme: string,
    themeToken: any
}
interface RootVarsStore extends RootVars {
    getRootVars: () => RootVars
    setRootVars: (_state: RootVars) => void,
    isThemeToggle: () => void
}
export const useRootVarsStore = create<RootVarsStore>((set, get) => {
    return {
        isTheme: 'dark',
        themeToken: {
            colorPrimary: '#63e2b7',
            colorInfo: '#63e2b7',
            colorSuccess: '#63e2b7'
        },
        isThemeToggle: () => {
            set((_state) => ({
                isTheme: _state.isTheme === 'dark' ? 'default' : 'dark',
                themeToken: _state.isTheme === 'dark' ? {
                    colorPrimary: '#18a058',
                    colorInfo: '#18a058',
                    colorSuccess: '#18a058'
                } : {
                    colorPrimary: '#63e2b7',
                    colorInfo: '#63e2b7',
                    colorSuccess: '#63e2b7',
                }
            }))
        },
        getRootVars: () => get(),
        setRootVars: (value: any) => {
            set((_state) => ({ ..._state, ...value }))
        },
    }
})