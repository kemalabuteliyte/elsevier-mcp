import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { ElsevierClient } from "../client.js";
import { formatError } from "../utils/errors.js";

export function registerAffiliationRetrieval(
  server: McpServer,
  client: ElsevierClient,
): void {
  server.tool(
    "affiliation_retrieval",
    "Retrieve detailed information about a specific academic institution or research affiliation from Scopus by affiliation ID or EID. Includes document counts, author lists, and address details.",
    {
      id_type: z
        .enum(["affiliation_id", "eid"])
        .describe("Type of identifier to use for affiliation retrieval."),
      id_value: z
        .string()
        .describe(
          "The identifier value. Example affiliation ID: '60007776' (MIT), EID: '10-s2.0-60007776'.",
        ),
      view: z
        .enum(["LIGHT", "STANDARD", "DOCUMENTS", "AUTHORS", "ENTITLED"])
        .optional()
        .describe(
          "Response detail level. LIGHT=basic info, STANDARD=full profile, DOCUMENTS=with document list, AUTHORS=with author list, ENTITLED=entitlement check.",
        ),
      field: z
        .string()
        .optional()
        .describe(
          "Comma-separated list of specific fields to return. Not compatible with DOCUMENTS or AUTHORS views.",
        ),
    },
    async (args) => {
      try {
        const path = `/content/affiliation/${args.id_type}/${args.id_value}`;
        const params: Record<string, string | undefined> = {
          view: args.view,
          field: args.field,
        };

        const data = await client.get(path, params);
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
