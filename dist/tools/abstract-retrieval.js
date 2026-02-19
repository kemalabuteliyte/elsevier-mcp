import { z } from "zod";
import { formatError } from "../utils/errors.js";
export function registerAbstractRetrieval(server, client) {
    server.tool("abstract_retrieval", "Retrieve detailed metadata and abstract for a specific Scopus document by its identifier. Supports lookup by Scopus ID, EID, DOI, PII, or PubMed ID.", {
        id_type: z
            .enum(["scopus_id", "eid", "doi", "pii", "pubmed_id"])
            .describe("Type of identifier to use for retrieval."),
        id_value: z
            .string()
            .describe("The identifier value. Examples: DOI '10.1016/j.jclepro.2020.121092', Scopus ID '85028623301', EID '2-s2.0-85028623301'."),
        view: z
            .enum(["META", "META_ABS", "FULL", "REF", "ENTITLED"])
            .optional()
            .describe("Response detail level. META=metadata, META_ABS=metadata+abstract, FULL=all details, REF=references, ENTITLED=entitlement check."),
        field: z
            .string()
            .optional()
            .describe("Comma-separated list of specific fields to return."),
    }, async (args) => {
        try {
            const path = `/content/abstract/${args.id_type}/${args.id_value}`;
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
//# sourceMappingURL=abstract-retrieval.js.map