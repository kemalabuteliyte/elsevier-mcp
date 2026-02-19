import { z } from "zod";
import { formatError } from "../utils/errors.js";
export function registerPlumXMetrics(server, client) {
    server.tool("plumx_metrics", "Retrieve PlumX Metrics for a scholarly document. Returns aggregate altmetric counts including citations, usage, captures, mentions, and social media activity.", {
        id_type: z
            .enum(["doi", "pmid", "pmcid", "isbn", "elsevierId", "elsevierPii"])
            .describe("Type of identifier. Common options: 'doi' for DOI, 'pmid' for PubMed ID, 'isbn' for books."),
        id_value: z
            .string()
            .describe("The identifier value. Example DOI: '10.1016/j.cell.2020.04.045'."),
    }, async (args) => {
        try {
            const path = `/analytics/plumx/${args.id_type}/${args.id_value}`;
            const data = await client.get(path);
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
//# sourceMappingURL=plumx-metrics.js.map