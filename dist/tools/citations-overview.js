import { z } from "zod";
import { formatError } from "../utils/errors.js";
export function registerCitationsOverview(server, client) {
    server.tool("citations_overview", "Get a detailed citation overview for a Scopus document, including yearly citation breakdowns. Can filter by date range, exclude self-citations, and exclude book citations.", {
        scopus_id: z
            .string()
            .optional()
            .describe("Scopus ID of the document."),
        doi: z.string().optional().describe("DOI of the document."),
        pii: z.string().optional().describe("PII of the document."),
        pubmed_id: z
            .string()
            .optional()
            .describe("PubMed ID of the document."),
        date: z
            .string()
            .optional()
            .describe("Date range filter. Format: 'YYYY-YYYY' (e.g. '2018-2024')."),
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
            .optional()
            .describe("Maximum number of citation results to return."),
        sort: z
            .string()
            .optional()
            .describe("Sort order. Options: '+sort-year' (ascending), '-sort-year' (descending), 'rowTotal'."),
        citation: z
            .enum(["exclude-self", "exclude-books"])
            .optional()
            .describe("Citation filter. 'exclude-self' removes self-citations, 'exclude-books' removes book citations."),
        author_id: z
            .string()
            .optional()
            .describe("Author ID to filter citations by a specific author."),
        view: z
            .string()
            .optional()
            .describe("Response detail level. Default: STANDARD."),
        field: z
            .string()
            .optional()
            .describe("Comma-separated list of specific fields to return."),
    }, async (args) => {
        try {
            if (!args.scopus_id && !args.doi && !args.pii && !args.pubmed_id) {
                return {
                    isError: true,
                    content: [
                        {
                            type: "text",
                            text: "At least one document identifier is required: scopus_id, doi, pii, or pubmed_id.",
                        },
                    ],
                };
            }
            const params = {
                scopus_id: args.scopus_id,
                doi: args.doi,
                pii: args.pii,
                pubmed_id: args.pubmed_id,
                date: args.date,
                start: args.start,
                count: args.count,
                sort: args.sort,
                citation: args.citation,
                author_id: args.author_id,
                view: args.view,
                field: args.field,
            };
            const data = await client.get("/content/abstract/citations", params);
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
//# sourceMappingURL=citations-overview.js.map