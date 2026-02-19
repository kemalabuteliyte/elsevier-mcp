# elsevier-mcp

MCP server for the [Elsevier Developer APIs](https://dev.elsevier.com). Gives Claude Code access to Scopus, ScienceDirect, and other Elsevier academic databases.

## Quick Start

1. Get a free API key at [dev.elsevier.com](https://dev.elsevier.com)

2. Add to your Claude Code settings (`~/.claude.json`):

```json
{
  "mcpServers": {
    "elsevier": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "elsevier-mcp"],
      "env": {
        "ELSEVIER_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

3. Restart Claude Code. Done.

### Install from GitHub

```bash
git clone https://github.com/kemalabut/elsevier-mcp.git
cd elsevier-mcp
npm install
```

Then add to your Claude Code settings:

```json
{
  "mcpServers": {
    "elsevier": {
      "type": "stdio",
      "command": "node",
      "args": ["/absolute/path/to/elsevier-mcp/dist/index.js"],
      "env": {
        "ELSEVIER_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

Or via CLI:

```bash
claude mcp add elsevier -e ELSEVIER_API_KEY=your_key -- node /absolute/path/to/elsevier-mcp/dist/index.js
```

## Available Tools

These 6 tools work with a free Elsevier API key:

| Tool | Description |
|------|-------------|
| `scopus_search` | Search Scopus for scholarly documents by query |
| `abstract_retrieval` | Retrieve abstract/metadata by DOI, Scopus ID, EID, PII, or PubMed ID |
| `article_retrieval` | Retrieve ScienceDirect article by DOI, PII, or EID |
| `serial_title_search` | Search for journals by title, ISSN, publisher, or subject |
| `serial_title_retrieval` | Retrieve journal details by ISSN |
| `subject_classifications` | Look up Scopus/ScienceDirect subject area codes and descriptions |

## Enabling All Tools (Institutional Access)

7 additional tools require institutional network access, an institutional token, or additional API subscriptions. Enable with `ELSEVIER_ENABLE_ALL_TOOLS=true`:

```json
{
  "mcpServers": {
    "elsevier": {
      "type": "stdio",
      "command": "node",
      "args": ["/absolute/path/to/elsevier-mcp/dist/index.js"],
      "env": {
        "ELSEVIER_API_KEY": "your_api_key_here",
        "ELSEVIER_INST_TOKEN": "your_institutional_token",
        "ELSEVIER_ENABLE_ALL_TOOLS": "true"
      }
    }
  }
}
```

| Tool | Description | Requires |
|------|-------------|----------|
| `author_search` | Search for authors in Scopus | Institutional access |
| `affiliation_search` | Search for institutions and affiliations | Institutional access |
| `author_retrieval` | Retrieve author profile by ID, EID, or ORCID | Institutional access |
| `affiliation_retrieval` | Retrieve institution details by ID or EID | Institutional access |
| `citation_count` | Get citation counts (supports batch lookup) | API subscription |
| `citations_overview` | Detailed citation overview with yearly breakdowns | API subscription |
| `plumx_metrics` | PlumX altmetrics (usage, captures, social media) | Institutional access |

To get institutional access:
- Connect from a university/institutional network with a Scopus subscription
- Or request an institutional token from `apisupport@elsevier.com`
- The server automatically attempts IP-based authentication on 401 errors

## Example Queries

Scopus search uses Boolean syntax with field codes:

- `TITLE(machine learning) AND PUBYEAR > 2020`
- `AUTH(Einstein) AND TITLE(relativity)`
- `AFFIL(MIT) AND KEY(quantum computing) AND PUBYEAR = 2024`
- `DOI(10.1016/j.jclepro.2020.121092)`

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `ELSEVIER_API_KEY` | Yes | API key from dev.elsevier.com |
| `ELSEVIER_INST_TOKEN` | No | Institutional token for expanded access |
| `ELSEVIER_ENABLE_ALL_TOOLS` | No | Set to `true` to enable all 13 tools |

## Troubleshooting

- **401 error**: Your API key lacks entitlements for this endpoint. You may need institutional access or an institutional token.
- **403 error**: Your API key doesn't have the required subscription for this resource.
- **429 error**: Rate limit exceeded. Elsevier quotas reset weekly.
- **No results**: Try broadening your query or using different field codes.

## License

MIT
