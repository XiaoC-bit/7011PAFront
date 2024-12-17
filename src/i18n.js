// src/i18n.js
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// 异步加载语言文件
const loadLanguageResources = async () => {
    const languages = ["en", "zh"]; // 语言列表
    const resources = {};

    await Promise.all(
        languages.map(async (lang) => {
            try {
                const response = await fetch(`/locales/${lang}.json`);
                if (response.ok) {
                    const data = await response.json();
                    resources[lang] = { translation: data };
                } else {
                    console.warn(`Failed to load language file for ${lang}`);
                }
            } catch (error) {
                console.error(`Error loading ${lang} language file:`, error);
            }
        })
    );

    return resources;
};

const initI18next = async () => {
    const resources = await loadLanguageResources(); // 加载语言资源
    i18n
        .use(initReactI18next) // 将 i18next 绑定到 React
        .init({
            resources, // 加载的翻译资源
            lng: "zh", // 默认语言
            fallbackLng: "en", // 缺失翻译时的回退语言
            interpolation: {
                escapeValue: false, // React 不需要转义
            },
        });
};

export default initI18next;
