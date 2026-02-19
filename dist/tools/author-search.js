import { z } from "zod";
import { formatError } from "../utils/errors.js";
export function registerAuthorSearch(server, client) {
    server.tool("author_search", "Search for authors in the Scopus database. Returns author profiles including name, affiliation, document count, and identifiers. Use field codes: AUTHLASTNAME(), AUTHFIRST(), AFFIL(), ORCID().", {
        query: z
            .string()
            .describe("Author search query. Examples: 'AUTHLASTNAME(Einstein)', 'AUTHFIRST(Albert) AND AUTHLASTNAME(Einstein)', 'AFFIL(Stanford)'"),
        co_author: z
            .string()
            .optional()
            .describe("Author ID to find co-authors of (overrides query parameter)."),
        start: z
            .number()
            .int()
            .min(0)
            .optional()
            .describe("Offset for pagination (0-based)."),
        count: z
            .number()
            .int()
            .min(1)
            .max(25)
            .optional()
            .describe("Number of results per page. Max 25."),
        sort: z
            .string()
            .optional()
            .describe("Sort order (e.g. 'relevancy', 'document-count')."),
        view: z
            .enum(["STANDARD", "COMPLETE"])
            .optional()
            .describe("Response detail level."),
        field: z
            .string()
            .optional()
            .describe("Comma-separated list of specific fields to return."),
        facets: z
            .string()
            .optional()
            .describe("Facet fields for aggregation."),
    }, async (args) => {
        try {
            const params = {
                query: args.query,
                "co-author": args.co_author,
                start: args.start,
                count: args.count,
                sort: args.sort,
                view: args.view,
                field: args.field,
                facets: args.facets,
            };
            const data = await client.get("/content/search/author", params);
            return {
                content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
            };
        }
        catch (error) {
            return {
                isError: true,
                content: [{ type: "text", text: formatError(error) }],
            };
        }
    });
}
//# sourceMappingURL=author-search.js.map