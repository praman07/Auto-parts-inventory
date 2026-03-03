
export async function fetchWithRetry(url: string, options: RequestInit = {}, retries = 3, backoff = 1000) {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(url, options);
            if (!response.ok) {
                // Throw to trigger retry on 5xx errors (like 502 Bad Gateway / Timeout)
                if (response.status >= 500) {
                    throw new Error(`Server Error: ${response.status}`);
                }
                // Don't retry client errors (4xx)
                const errData = await response.json().catch(() => null);
                throw new Error(errData?.error || `HTTP Error: ${response.status}`);
            }
            return await response.json();
        } catch (error: any) {
            console.warn(`[API Client] Fetch failed for ${url}. Attempt ${i + 1} of ${retries}. Error:`, error.message);
            if (i === retries - 1) throw error; // Rethrow on last attempt

            // Wait before retrying (exponential backoff)
            await new Promise((res) => setTimeout(res, backoff * Math.pow(2, i)));
        }
    }
}
