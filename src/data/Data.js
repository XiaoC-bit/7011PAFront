
import { atom } from "jotai";


export const formState = atom({
    key: 'formState',
    default: {
        configForm: {},
        testModeConfig: {},
    },
});
