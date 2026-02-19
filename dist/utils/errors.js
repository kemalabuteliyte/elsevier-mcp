import { ElsevierApiError } from "../client.js";
export function formatError(error) {
    if (error instanceof ElsevierApiError) {
        return `Elsevier API error (${error.status}): ${error.message}`;
    }
    if (error instanceof Error) {
        return `Error: ${error.message}`;
    }
    return `Unknown error: ${String(error)}`;
}
//# sourceMappingURL=errors.js.map