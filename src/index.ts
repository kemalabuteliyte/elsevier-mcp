#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { ElsevierClient } from "./client.js";
import { registerScopusSearch } from "./tools/scopus-search.js";
import { registerAuthorSearch } from "./tools/author-search.js";
import { registerAffiliationSearch } from "./tools/affiliation-search.js";
import { registerAbstractRetrieval } from "./tools/abstract-retrieval.js";
import { registerAuthorRetrieval } from "./tools/author-retrieval.js";
import { registerArticleRetrieval } from "./tools/article-retrieval.js";
import {
  registerSerialTitleSearch,
  registerSerialTitleRetrieval,
} from "./tools/serial-title.js";
import { registerAffiliationRetrieval } from "./tools/affiliation-retrieval.js";
import { registerSubjectClassifications } from "./tools/subject-classifications.js";
import { registerCitationCount } from "./tools/citation-count.js";
import { registerCitationsOverview } from "./tools/citations-overview.js";
import { registerPlumXMetrics } from "./tools/plumx-metrics.js";

async function main() {
  const apiKey = process.env.ELSEVIER_API_KEY;
  if (!apiKey) {
    console.error(
      "ELSEVIER_API_KEY environment variable is required. Get one at https://dev.elsevier.com",
    );
    process.exit(1);
  }

  const instToken = process.env.ELSEVIER_INST_TOKEN;
  const enableAll = process.env.ELSEVIER_ENABLE_ALL_TOOLS === "true";
  const client = new ElsevierClient(apiKey, instToken);

  const server = new McpServer({
    name: "elsevier",
    version: "1.0.0",
  });

  // Tools that work with a free API key
  registerScopusSearch(server, client);
  registerAbstractRetrieval(server, client);
  registerArticleRetrieval(server, client);
  registerSerialTitleSearch(server, client);
  registerSerialTitleRetrieval(server, client);
  registerSubjectClassifications(server, client);

  // Tools that require institutional access or additional API subscriptions.
  // Enable by setting ELSEVIER_ENABLE_ALL_TOOLS=true
  if (enableAll) {
    registerAuthorSearch(server, client);
    registerAffiliationSearch(server, client);
    registerAuthorRetrieval(server, client);
    registerAffiliationRetrieval(server, client);
    registerCitationCount(server, client);
    registerCitationsOverview(server, client);
    registerPlumXMetrics(server, client);
    console.error("Elsevier MCP server running on stdio (all 13 tools enabled)");
  } else {
    console.error("Elsevier MCP server running on stdio (6 tools enabled — set ELSEVIER_ENABLE_ALL_TOOLS=true for all 13)");
  }

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
