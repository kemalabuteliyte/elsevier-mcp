export declare class ElsevierApiError extends Error {
    status: number;
    constructor(status: number, message: string);
}
export declare class ElsevierClient {
    private apiKey;
    private instToken?;
    private authToken?;
    private authAttempted;
    constructor(apiKey: string, instToken?: string);
    private buildHeaders;
    private authenticate;
    private parseErrorMessage;
    get(path: string, params?: Record<string, string | number | undefined>): Promise<unknown>;
}
