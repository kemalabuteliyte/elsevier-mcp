import { z } from "zod";
import { formatError } from "../utils/errors.js";
export function registerAffiliationSearch(server, client) {
    server.tool("affiliation_search", "Search for academic institutions and research affiliations in Scopus. Returns affiliation names, locations, document counts, and identifiers. Use field codes: AFFIL(), AF-ID(), CITY(), COUNTRY().", {
        query: z
            .string()
            .describe("Affiliation search query. Examples: 'AFFIL(Harvard)', 'CITY(Boston) AND COUNTRY(United States)', 'AF-ID(60007776)'"),
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
        sort: z.string().optional().describe("Sort order."),
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
                start: args.start,
                count: args.count,
                sort: args.sort,
                view: args.view,
                field: args.field,
                facets: args.facets,
            };
            const data = await client.get("/content/search/affiliation", params);
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
//# sourceMappingURL=affiliation-search.js.map