import { sql } from "bun";

const toArrayLiteral = (strings?: string[]) => {
  if (!strings || strings.length === 0) return;
  return sql`${`{${strings.join(",")}}`}::text[]`;
};

export default toArrayLiteral;