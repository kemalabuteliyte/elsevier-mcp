import { z } from "zod";
import { formatError } from "../utils/errors.js";
export function registerSubjectClassifications(server, client) {
    server.tool("subject_classifications", "Retrieve subject area classifications used in Scopus or ScienceDirect. Useful for finding subject codes to filter searches. Returns classification codes, abbreviations, and descriptions.", {
        source: z
            .enum(["scopus", "scidir"])
            .describe("Classification source. 'scopus' for Scopus ASJC codes, 'scidir' for ScienceDirect subject areas."),
        description: z
            .string()
            .optional()
            .describe("Filter by description (case-insensitive partial match). Example: 'computer' to find Computer Science areas."),
        detail: z
            .string()
            .optional()
            .describe("Filter by detail attribute (case-insensitive partial match)."),
        code: z
            .string()
            .optional()
            .describe("Filter by exact code. Scopus example: '1106', ScienceDirect example: '391'."),
        abbrev: z
            .string()
            .optional()
            .describe("Filter by exact abbreviation. Examples: 'AGRI', 'COMP', 'MEDI'."),
        field: z
            .string()
            .optional()
            .describe("Specific fields to return (comma-delimited). Options: 'code', 'abbrev', 'detail', 'description'."),
    }, async (args) => {
        try {
            const path = `/content/subject/${args.source}`;
            const params = {
                description: args.description,
                detail: args.detail,
                code: args.code,
                abbrev: args.abbrev,
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
//# sourceMappingURL=subject-classifications.js.map