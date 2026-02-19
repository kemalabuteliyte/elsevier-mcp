import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { ElsevierClient } from "../client.js";
import { formatError } from "../utils/errors.js";

export function registerCitationCount(
  server: McpServer,
  client: ElsevierClient,
): void {
  server.tool(
    "citation_count",
    "Get citation counts for one or more Scopus documents. Supports batch lookup by providing comma-separated identifiers. Returns total citation count for each document.",
    {
      scopus_id: z
        .string()
        .optional()
        .describe(
          "Scopus ID(s). Comma-separated for batch (e.g. '85028623301,85084609197').",
        ),
      doi: z
        .string()
        .optional()
        .describe(
          "DOI(s). Comma-separated for batch (e.g. '10.1016/j.cell.2020.04.045').",
        ),
      pii: z
        .string()
        .optional()
        .describe("PII(s). Comma-separated for batch."),
      pubmed_id: z
        .string()
        .optional()
        .describe("PubMed ID(s). Comma-separated for batch."),
    },
    async (args) => {
      try {
        if (!args.scopus_id && !args.doi && !args.pii && !args.pubmed_id) {
          return {
            isError: true,
            content: [
              {
                type: "text",
                text: "At least one identifier is required: scopus_id, doi, pii, or pubmed_id.",
              },
            ],
          };
        }

        const params: Record<string, string | undefined> = {
          scopus_id: args.scopus_id,
          doi: args.doi,
          pii: args.pii,
          pubmed_id: args.pubmed_id,
        };

        const data = await client.get(
          "/content/abstract/citation-count",
          params,
        );
        return {
          content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
        };
      } catch (error) {
        return {
          isError: true,
          content: [{ type: "text", text: formatError(error) }],
        };
      }
    },
  );
}
