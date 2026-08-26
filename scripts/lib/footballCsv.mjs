import { createHash } from "node:crypto";

export function* iterateCsvRows(text) {
  let row = [];
  let field = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (quoted) {
      if (char === '"' && text[index + 1] === '"') {
        field += '"';
        index += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') quoted = true;
    else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(field.replace(/\r$/, ""));
      yield row;
      row = [];
      field = "";
    } else {
      field += char;
    }
  }

  if (quoted) throw new Error("CSV ended inside a quoted field.");
  if (field.length > 0 || row.length > 0) {
    row.push(field.replace(/\r$/, ""));
    yield row;
  }
}

export function parseCsv(text) {
  return [...iterateCsvRows(text)];
}

export function gitBlobSha1(text) {
  const body = Buffer.from(text, "utf8");
  return createHash("sha1")
    .update(Buffer.from(`blob ${body.length}\0`, "utf8"))
    .update(body)
    .digest("hex");
}
