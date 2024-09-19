export function createAbortController(signal?: AbortSignal): AbortController {
    const abortController = new AbortController();
    if (signal?.aborted) {
        abortController.abort();
    } else {
        signal?.addEventListener('abort', () => abortController.abort(), { once: true });
    }
    return abortController;
}