const BASE_URL = "https://api.elsevier.com";
export class ElsevierApiError extends Error {
    status;
    constructor(status, message) {
        super(message);
        this.status = status;
        this.name = "ElsevierApiError";
    }
}
export class ElsevierClient {
    apiKey;
    instToken;
    authToken;
    authAttempted = false;
    constructor(apiKey, instToken) {
        this.apiKey = apiKey;
        this.instToken = instToken;
    }
    buildHeaders() {
        const headers = {
            "X-ELS-APIKey": this.apiKey,
            Accept: "application/json",
        };
        if (this.instToken) {
            headers["X-ELS-Insttoken"] = this.instToken;
        }
        if (this.authToken) {
            headers["X-ELS-Authtoken"] = this.authToken;
        }
        return headers;
    }
    async authenticate() {
        // Try Scopus platform first, then ScienceDirect
        for (const platform of ["SCOPUS", "SCIDIR"]) {
            try {
                const url = new URL("/authenticate", BASE_URL);
                url.searchParams.set("platform", platform);
                const headers = {
                    "X-ELS-APIKey": this.apiKey,
                    Accept: "application/json",
                };
                if (this.instToken) {
                    headers["X-ELS-Insttoken"] = this.instToken;
                }
                const response = await fetch(url.toString(), { headers });
                if (response.status === 200) {
                    const body = await response.json();
                    // The authenticate API returns the authtoken in the response
                    const token = body?.["authenticate-response"]?.authtoken ??
                        body?.authtoken ??
                        body?.["authentication-token"];
                    if (token) {
                        this.authToken = token;
                        console.error(`[elsevier-mcp] IP authentication succeeded (platform: ${platform})`);
                        return true;
                    }
                }
                // Status 300 means multiple choices — try first available choice
                if (response.status === 300) {
                    const body = await response.json();
                    const choices = body?.["authenticate-response"]?.choice ??
                        body?.choice;
                    if (Array.isArray(choices) && choices.length > 0) {
                        const choiceId = choices[0]?.["@id"] ?? choices[0]?.id ?? choices[0];
                        const retryUrl = new URL("/authenticate", BASE_URL);
                        retryUrl.searchParams.set("platform", platform);
                        retryUrl.searchParams.set("choice", String(choiceId));
                        const retryResponse = await fetch(retryUrl.toString(), { headers });
                        if (retryResponse.status === 200) {
                            const retryBody = await retryResponse.json();
                            const token = retryBody?.["authenticate-response"]?.authtoken ??
                                retryBody?.authtoken ??
                                retryBody?.["authentication-token"];
                            if (token) {
                                this.authToken = token;
                                console.error(`[elsevier-mcp] IP authentication succeeded with choice (platform: ${platform})`);
                                return true;
                            }
                        }
                    }
                }
            }
            catch {
                // Authentication attempt failed for this platform, try next
            }
        }
        console.error("[elsevier-mcp] IP authentication failed — your IP may not be on an institutional network");
        return false;
    }
    parseErrorMessage(status, statusText, body) {
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const b = body;
            const err = b?.["service-error"]?.status ??
                b?.error ??
                b?.["error-response"];
            if (err && typeof err === "object") {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const e = err;
                return `HTTP ${status}: ${e.statusText ?? e.statusCode ?? ""} - ${e.detail ?? e.message ?? JSON.stringify(err)}`;
            }
        }
        catch {
            // fall through
        }
        return `HTTP ${status}: ${statusText}`;
    }
    async get(path, params) {
        const url = new URL(path, BASE_URL);
        if (params) {
            for (const [key, value] of Object.entries(params)) {
                if (value !== undefined) {
                    url.searchParams.set(key, String(value));
                }
            }
        }
        // First attempt
        const response = await fetch(url.toString(), { headers: this.buildHeaders() });
        if (response.ok) {
            return response.json();
        }
        // On 401: try IP authentication once, then retry
        if (response.status === 401 && !this.authAttempted) {
            this.authAttempted = true;
            let errorBody;
            try {
                errorBody = await response.json();
            }
            catch {
                errorBody = null;
            }
            console.error("[elsevier-mcp] Got 401 — attempting IP-based authentication...");
            const authenticated = await this.authenticate();
            if (authenticated) {
                // Retry the original request with the new authtoken
                const retryResponse = await fetch(url.toString(), {
                    headers: this.buildHeaders(),
                });
                if (retryResponse.ok) {
                    return retryResponse.json();
                }
                // Retry also failed
                let retryBody;
                try {
                    retryBody = await retryResponse.json();
                }
                catch {
                    retryBody = null;
                }
                throw new ElsevierApiError(retryResponse.status, this.parseErrorMessage(retryResponse.status, retryResponse.statusText, retryBody));
            }
            // Authentication failed, throw original 401 error
            throw new ElsevierApiError(response.status, this.parseErrorMessage(response.status, response.statusText, errorBody));
        }
        // Non-401 errors or auth already attempted
        let errorBody;
        try {
            errorBody = await response.json();
        }
        catch {
            errorBody = null;
        }
        throw new ElsevierApiError(response.status, this.parseErrorMessage(response.status, response.statusText, errorBody));
    }
}
//# sourceMappingURL=client.js.map