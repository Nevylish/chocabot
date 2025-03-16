import fetch from "node-fetch";
import {ChocaBot} from "../index";
import {Buffer} from "buffer";

export module Functions {

    export const getRandomInt = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;

    export const contains = (target, pattern) => {
        let value = 0;
        pattern.forEach((word) => {
            value = value + target.startsWith(word);
        });
        return (value === 1);
    }

    export const disableButtons = (components) => {
        for (let x = 0; x < components.length; x++) {
            for (let y = 0; y < components[x].components.length; y++) {
                components[x].components[y].disabled = true;
            }
        }
        return components;
    }

    export const generateRandomString = (length) => {
        let result = '';
        let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz012345678901234567890123456789';
        let charactersLength = characters.length;
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() *
                charactersLength));
        }
        return result;
    }

    export const isAlphanumeric = (text: string): boolean => /^[a-zA-Z\d]+$/.test(text);

    export const jsonToBase64 = (json: object) => {
        return Buffer.from(JSON.stringify(json)).toString("base64");
    };

    export const rgbToHex = (r: number, g: number, b: number): string => '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);

    export const shortener = async (url: string, keywordPrefix?: string) => {
        const request = process.env.SHORTENER_URI +
            `?signature=${process.env.SHORTENER_SIGNATURE}` +
            "&action=shorturl" +
            "&expiry=clock" + // Expiry plugin required (https://github.com/joshp23/YOURLS-Expiry)
            "&age=1" + // Parameter for expiry plugin
            "&ageMod=day" + // Parameter for expiry plugin
            `&keyword=${keywordPrefix ?? ChocaBot.user.username}_` + generateRandomString(12) + /*TODO: Replace random string to unique id*/
            "&format=json" +
            "&url=" + url

        return await fetch(request)
            .then(response => response.json())
            .then(data => data.shorturl)
            .catch(() => "Erreur");
    }

}
