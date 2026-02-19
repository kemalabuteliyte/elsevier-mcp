import { z } from "zod";
import { formatError } from "../utils/errors.js";
export function registerScopusSearch(server, client) {
    server.tool("scopus_search", "Search the Scopus database of abstracts and citations. Returns metadata about scholarly documents including titles, authors, DOIs, citation counts. Use Scopus field codes in queries: TITLE(), AUTH(), AFFIL(), DOI(), KEY(), PUBYEAR, etc.", {
        query: z
            .string()
            .describe("Scopus Boolean search query. Examples: 'TITLE(machine learning)', 'AUTH(Smith) AND PUBYEAR > 2020', 'AFFIL(MIT) AND KEY(quantum computing)'"),
        start: z
            .number()
            .int()
            .min(0)
            .optional()
            .describe("Offset for pagination (0-based). Default: 0."),
        count: z
            .number()
            .int()
            .min(1)
            .max(25)
            .optional()
            .describe("Number of results to return. Max 25. Default: 25."),
        sort: z
            .string()
            .optional()
            .describe("Sort order. Examples: 'relevancy', 'citedby-count', 'pubyear', 'coverDate'. Prefix with '-' for descending."),
        date: z
            .string()
            .optional()
            .describe("Date range filter. Format: 'YYYY' for single year, 'YYYY-YYYY' for range."),
        view: z
            .enum(["STANDARD", "COMPLETE"])
            .optional()
            .describe("Response detail level. STANDARD=basic fields, COMPLETE=all fields."),
        field: z
            .string()
            .optional()
            .describe("Comma-separated fields to return (e.g. 'dc:title,dc:creator,prism:doi,citedby-count')."),
        subj: z
            .string()
            .optional()
            .describe("Subject area filter. Comma-separated codes (e.g. 'COMP,MATH')."),
        facets: z
            .string()
            .optional()
            .describe("Facet fields for aggregation (e.g. 'subjarea(count=5)')."),
    }, async (args) => {
        try {
            const params = {
                query: args.query,
                start: args.start,
                count: args.count,
                sort: args.sort,
                date: args.date,
                view: args.view,
                field: args.field,
                subj: args.subj,
                facets: args.facets,
            };
            const data = await client.get("/content/search/scopus", params);
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
//# sourceMappingURL=scopus-search.js.map