import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { ElsevierClient } from "../client.js";
import { formatError } from "../utils/errors.js";

export function registerFulltextRetrieval(
  server: McpServer,
  client: ElsevierClient,
): void {
  server.tool(
    "fulltext_retrieval",
    "Retrieve the full text of a ScienceDirect article as clean plain text. Requires institutional access or entitlements for most articles.",
    {
      id_type: z
        .enum(["doi", "pii", "eid"])
        .describe("Type of identifier to use for article retrieval."),
      id_value: z
        .string()
        .describe(
          "The identifier value. Example DOI: '10.1016/j.jclepro.2020.121092'.",
        ),
    },
    async (args) => {
      try {
        const path = `/content/article/${args.id_type}/${args.id_value}`;
        const data = await client.get(path, {}, "text/plain");
        return {
          content: [{ type: "text", text: String(data) }],
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
