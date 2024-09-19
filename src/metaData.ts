import { initOptions } from "./types";

export function getSyncSiteMetadata(metaData?:initOptions["metaData"]) {

    let hostname = window.location.hostname
    try {
        hostname =  new URL(metaData?.url || "")?.hostname || hostname
    } catch (error) {
        console.warn(`new URL(${metaData?.url}) error`)
    }

    

    return {
        url: metaData?.url || "",
        hostname,
        name: metaData?.name || getSiteName(window),
        icon: metaData?.icon || getSyncSiteIcon(window),
        direct_link: metaData?.direct_link,
        description: metaData?.description

    };
}

/**
 * Get site metadata.
 *
 * @returns The site metadata.
 */
export async function getSiteMetadata() {
    return {
        hostname: window.location.hostname,
        name: getSiteName(window),
        icon: await getSiteIcon(window),
    };
}

/**
 * Extract a name for the site from the DOM.
 *
 * @param windowObject - The window object to extract the site name from.
 * @returns The site name.
 */
function getSiteName(windowObject: typeof window): string {
    const { document } = windowObject;

    const siteName: HTMLMetaElement | null = document.querySelector(
        'head > meta[property="og:site_name"]',
    );
    if (siteName) {
        return siteName.content;
    }

    const metaTitle: HTMLMetaElement | null = document.querySelector(
        'head > meta[name="title"]',
    );
    if (metaTitle) {
        return metaTitle.content;
    }

    if (document.title && document.title.length > 0) {
        return document.title;
    }

    return window.location.hostname;
}

function getSyncSiteIcon(
    windowObject: typeof window,
): String | null {
    const { document } = windowObject;
    const icons: NodeListOf<HTMLLinkElement> = document.querySelectorAll(
        'head > link[rel~="icon"]',
    );
    for (const icon of Array.from(icons)) {
        if (icon) {
            return icon.href;
        }
    }
    return null;
}


/**
 * Extract an icon for the site from the DOM.
 *
 * @param windowObject - The window object to extract the site icon from.
 * @returns An icon URL, if one exists.
 */
async function getSiteIcon(
    windowObject: typeof window,
): Promise<string | null> {
    const { document } = windowObject;

    const icons: NodeListOf<HTMLLinkElement> = document.querySelectorAll(
        'head > link[rel~="icon"]',
    );
    for (const icon of Array.from(icons)) {
        if (icon && (await imgExists(icon.href))) {
            return icon.href;
        }
    }

    return null;
}


/**
 * Return whether the given image URL exists.
 *
 * @param url - The url of the image.
 * @returns Whether the image exists.
 */
async function imgExists(url: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
        try {
            const img = document.createElement('img');
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
            img.src = url;
        } catch (error) {
            reject(error);
        }
    });
}