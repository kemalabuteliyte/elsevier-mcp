import { z } from "zod";
import { formatError } from "../utils/errors.js";
export function registerSerialTitleSearch(server, client) {
    server.tool("serial_title_search", "Search for academic journals and serial publications in Scopus by title, ISSN, publisher, subject area, or open access status.", {
        title: z
            .string()
            .optional()
            .describe("Journal title to search for (partial match supported)."),
        issn: z.string().optional().describe("ISSN to search for."),
        pub: z.string().optional().describe("Publisher name to filter by."),
        subj: z
            .string()
            .optional()
            .describe("Subject area code (e.g. 'COMP', 'MATH', 'MEDI', 'PHYS')."),
        content: z
            .string()
            .optional()
            .describe("Content type: 'journal', 'tradejournal', 'conferenceproceeding', 'bookseries'."),
        date: z.string().optional().describe("Date filter."),
        oa: z
            .enum(["all", "full", "partial", "none"])
            .optional()
            .describe("Open access status filter."),
        view: z
            .enum(["STANDARD", "ENHANCED", "CITESCORE"])
            .optional()
            .describe("Response detail level."),
        start: z
            .number()
            .int()
            .min(0)
            .optional()
            .describe("Offset for pagination."),
        count: z
            .number()
            .int()
            .min(1)
            .max(200)
            .optional()
            .describe("Number of results per page. Max 200."),
    }, async (args) => {
        try {
            if (!args.title && !args.issn && !args.pub && !args.subj) {
                return {
                    isError: true,
                    content: [
                        {
                            type: "text",
                            text: "At least one search criterion is required: title, issn, pub, or subj.",
                        },
                    ],
                };
            }
            const params = {
                title: args.title,
                issn: args.issn,
                pub: args.pub,
                subj: args.subj,
                content: args.content,
                date: args.date,
                oa: args.oa,
                view: args.view,
                start: args.start,
                count: args.count,
            };
            const data = await client.get("/content/serial/title", params);
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
export function registerSerialTitleRetrieval(server, client) {
    server.tool("serial_title_retrieval", "Retrieve detailed information about a specific journal or serial publication by its ISSN. Includes publisher, subject areas, and CiteScore metrics.", {
        issn: z
            .string()
            .describe("ISSN of the journal (e.g. '0140-6736' for The Lancet, '0028-0836' for Nature)."),
        view: z
            .enum(["STANDARD", "ENHANCED", "CITESCORE"])
            .optional()
            .describe("Response detail level."),
    }, async (args) => {
        try {
            const params = {
                view: args.view,
            };
            const data = await client.get(`/content/serial/title/issn/${args.issn}`, params);
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
//# sourceMappingURL=serial-title.js.map