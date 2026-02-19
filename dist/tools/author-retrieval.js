import { z } from "zod";
import { formatError } from "../utils/errors.js";
export function registerAuthorRetrieval(server, client) {
    server.tool("author_retrieval", "Retrieve a detailed author profile from Scopus by author ID, EID, or ORCID. Includes publication metrics, subject areas, and affiliation history.", {
        id_type: z
            .enum(["author_id", "eid", "orcid"])
            .describe("Type of identifier to use for author retrieval."),
        id_value: z
            .string()
            .describe("The identifier value. Examples: author ID '7004367821', ORCID '0000-0002-1825-0097', EID 'aut-id:7004367821'."),
        view: z
            .enum(["LIGHT", "STANDARD", "ENHANCED", "METRICS"])
            .optional()
            .describe("Response detail level. LIGHT=basic, STANDARD=includes documents, ENHANCED=full profile, METRICS=citation metrics."),
        field: z
            .string()
            .optional()
            .describe("Comma-separated list of specific fields to return."),
    }, async (args) => {
        try {
            const path = `/content/author/${args.id_type}/${args.id_value}`;
            const params = {
                view: args.view,
                field: args.field,
            };
            const data = await client.get(path, params);
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
//# sourceMappingURL=author-retrieval.js.map