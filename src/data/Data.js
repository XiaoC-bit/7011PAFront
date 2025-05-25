
import { atom } from "jotai";


export const formState = atom({
    configForm: {},         // ✅ 你原本的字段，保留！仍然是当前值
    configFormInitial: {},  // 🆕 初始值
    testModeConfig: {},
    testModeConfigInitial: {},
    dirty: false,
});

export const currentMethod = atom('');

//是否首次创建方法
export const isFirstCreateMethodState = atom(false);

export const hasChangeMethodState = atom(false);
