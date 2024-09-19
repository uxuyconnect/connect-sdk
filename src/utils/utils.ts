//@ts-nocheck
import qs from 'qs';
import * as  UUID from 'uuid';
// import type { DeviceInfo } from '../types';






export const tgUtils = {
    decodeTelegramUrlParameters: function decodeTelegramUrlParameters(encodedParameters, isObject = true) {
        const decodedParams = encodedParameters
            .replaceAll('--', '%')
            .replaceAll('__', '=')
            .replaceAll('-', '&')
            .replaceAll('%5F', '_')
            .replaceAll('%2D', '-')
            .replaceAll('%2E', '.');
        if (isObject) return qs.parse(decodedParams);
        return decodedParams;
    },
    stringify: function stringify(obj) {
        const params = new URLSearchParams();

        function buildParams(prefix, value) {
            if (Array.isArray(value)) {
                value.forEach((v, i) => {
                    if (/\[\]$/.test(prefix)) {
                        params.append(prefix, v);
                    } else {
                        buildParams(`${prefix}[${typeof v === 'object' ? i : ''}]`, v);
                    }
                });
            } else if (typeof value === 'object') {
                for (const key in value) {
                    buildParams(`${prefix}[${key}]`, value[key]);
                }
            } else {
                params.append(prefix, value);
            }
        }

        for (const key in obj) {
            buildParams(key, obj[key]);
        }

        return params.toString();
    },
    encodeTelegramUrlParameters: function encodeTelegramUrlParameters(parameters, isObject = true) {

        if (isObject) {

            parameters = tgUtils.stringify(parameters)
            //  parameters = qs.stringify(parameters)

        }
        return parameters
            .replaceAll('.', '%2E')
            .replaceAll('-', '%2D')
            .replaceAll('_', '%5F')
            .replaceAll('&', '-')
            .replaceAll('=', '__')
            .replaceAll('%', '--');
    },
    openAndroidLink: (() => {
        let lastClickTime = new Date().getTime()
        let lastClick = false
        document.addEventListener('click', function () {
            lastClick = true
            lastClickTime = new Date().getTime()
        }, false)
        return function openAndroidLink(url) {
            var pageHidden = false;

            // const timer = setTimeout(function () {
            //     if (!pageHidden) {

            //         console.log('openAndroidLink timeout...........', pageHidden)
            //         // Telegram?.WebApp?.openLink?.(url)
            //         // window.open(url, '_blank');
            //     }
            // }, 3000);

            // if (true) {

                // var a = document.createElement('A');
                // a.href = url;
                // var iframeContEl = document.body;
                // var iframeEl = document.createElement('iframe');
                // iframeEl.id = 'uxuy_tg_iframe1';
                // iframeEl.style.visibility = 'hidden';
                // iframeEl.style.position = 'fixed';
                // iframeEl.style.bottom = '0';
                // iframeEl.style.left = '0';
                // iframeEl.style.width = '0px';
                // iframeEl.style.height = '0px';
                // iframeEl.style.border = 'none';
                // iframeContEl.appendChild(iframeEl);
                // var pageHidden = false;
                // window.addEventListener('visibilitychange', function () {
                //     pageHidden = document.hidden || document.webkitHidden || document.mozHidden || document.msHidden;
                // }, false);
                // window.addEventListener('pagehide', function () {
                //     pageHidden = true;
                // }, false);
                // window.addEventListener('blur', function () {
                //     pageHidden = true;
                // }, false);
                // if (iframeEl !== null) {
                //     iframeEl.src = url;
                // }
                // setTimeout(function () {
                // location.href = url;
                    // window.location = url;
                    // iframeContEl?.removeChild?.(iframeEl)
                // }, 1000);
                // return
            // }
            // lastClick = false
            location.href = url
            // Telegram?.WebApp?.openTelegramLink?.(url)
        }

    })(),


    opendeepLink: function opendeepLink(paramsStr, {
        domain = "UXUYbot",
        appname = "app",
    }) {
        var protoUrl = `tg:\/\/resolve?domain=${domain}&appname=${appname}&startapp=${paramsStr}`;
        if (true) {
            var iframeContEl = document.body;
            var iframeEl = document.createElement('iframe');
            iframeEl.id = 'uxuy_tg_iframe';
            iframeEl.style.visibility = 'hidden';
            iframeEl.style.position = 'fixed';
            iframeEl.style.bottom = '0';
            iframeEl.style.left = '0';
            iframeEl.style.width = '0px';
            iframeEl.style.height = '0px';
            iframeEl.style.border = 'none';
            iframeContEl.appendChild(iframeEl);
            var pageHidden = false;
            window.addEventListener('visibilitychange', function () {
                pageHidden = document.hidden || document.webkitHidden || document.mozHidden || document.msHidden;
            }, false);
            window.addEventListener('pagehide', function () {
                pageHidden = true;
            }, false);
            window.addEventListener('blur', function () {
                pageHidden = true;
            }, false);
            if (iframeEl !== null) {
                iframeEl.src = protoUrl;
            }
            !false && setTimeout(function () {

                if (!pageHidden) {
                    window.location = protoUrl;
                }
                iframeContEl?.removeChild?.(iframeEl)
            }, 2000);
        } else if (protoUrl) {
            setTimeout(function () {
                window.location = protoUrl;
            }, 100);
        }
    }
}

export function getUUid() {
    return UUID.v4();
};

export function getPlatform() {
    const platform =
        (window.navigator as any)?.userAgentData?.platform ||
        window.navigator.platform;

    const userAgent = window.navigator.userAgent;

    const macosPlatforms = ["macOS", "Macintosh", "MacIntel", "MacPPC", "Mac68K"];
    const windowsPlatforms = ["Win32", "Win64", "Windows", "WinCE"];
    const iphonePlatforms = ["iPhone"];
    const iosPlatforms = ["iPad", "iPod"];

    // let os: DeviceInfo["platform"] | null = null;
    let os = null;

    if (macosPlatforms.indexOf(platform) !== -1) {
        os = "mac";
    } else if (iphonePlatforms.indexOf(platform) !== -1) {
        os = "iphone";
    } else if (iosPlatforms.indexOf(platform) !== -1) {
        os = "ipad";
    } else if (windowsPlatforms.indexOf(platform) !== -1) {
        os = "windows";
    } else if (/Android/.test(userAgent)) {
        os = "linux";
    } else if (/Linux/.test(platform)) {
        os = "linux";
    }

    return os!;
}

export default {}
