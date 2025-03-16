export module TextUtils {
    export const escapeMarkdown = (text: string): string => text.replace(/([_*~`|])/g, '\\$1');

    export const extractText = (text: string): string => text.replace(/[^a-zA-Z\dÀ-ž\s]/g, '');

    export const extractEmojis = (text: string): Array<string> | null => {
        const regex = /(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/g;
        return [...text.matchAll(regex)].map(match => match[0]);
    };

    export const replaceAll = (str, mapObj) => {
        const re = new RegExp(Object.keys(mapObj).join("|"), "gi");

        return str.replace(re, (matched) => {
            return mapObj[matched.toLowerCase()];
        });
    }
}
