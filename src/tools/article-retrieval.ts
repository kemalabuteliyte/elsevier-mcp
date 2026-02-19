import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { ElsevierClient } from "../client.js";
import { formatError } from "../utils/errors.js";

export function registerArticleRetrieval(
  server: McpServer,
  client: ElsevierClient,
): void {
  server.tool(
    "article_retrieval",
    "Retrieve full-text or metadata of a ScienceDirect article by DOI, PII, or EID. Access depends on your API key entitlements.",
    {
      id_type: z
        .enum(["doi", "pii", "eid"])
        .describe("Type of identifier to use for article retrieval."),
      id_value: z
        .string()
        .describe(
          "The identifier value. Example DOI: '10.1016/j.jclepro.2020.121092'.",
        ),
      view: z
        .enum(["META", "META_ABS", "FULL", "ENTITLED"])
        .optional()
        .describe(
          "Response detail level. META=metadata, META_ABS=metadata+abstract, FULL=full text, ENTITLED=entitlement check.",
        ),
      field: z
        .string()
        .optional()
        .describe("Comma-separated list of specific fields to return."),
    },
    async (args) => {
      try {
        const path = `/content/article/${args.id_type}/${args.id_value}`;
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
