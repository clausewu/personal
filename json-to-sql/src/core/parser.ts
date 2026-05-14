export interface SqlNode {
  type: string;
  sql?: string;
  params?: Record<string, unknown>;
  args?: Record<string, unknown>;
  children?: Record<string, SqlNode>;
}

export interface ParseResult {
  sql: string;
  error?: string;
}

export class JsonSqlParser {
  static parse(jsonString: string, initialParams?: Record<string, unknown>): ParseResult {
    try {
      const parsed = JSON.parse(jsonString) as { entry?: string; nodes?: Record<string, SqlNode> };
      if (!parsed.nodes) {
        return { sql: '', error: 'Invalid JSON structure: missing nodes' };
      }

      const params = { ...initialParams };
      const entry = parsed.entry || Object.keys(parsed.nodes)[0];

      if (!entry || !parsed.nodes[entry]) {
        return { sql: '', error: `Entry point "${entry}" not found` };
      }

      const sql = this.resolveNode(parsed.nodes, entry, params);
      return { sql };
    } catch (e) {
      const error = e instanceof Error ? e.message : 'Unknown parse error';
      return { sql: '', error: `JSON parse error: ${error}` };
    }
  }

  private static resolveNode(
    nodes: Record<string, SqlNode>,
    nodeName: string,
    params: Record<string, unknown>,
    callArgs?: string | Record<string, unknown>
  ): string {
    const node = nodes[nodeName];
    if (!node) {
      throw new Error(`Node "${nodeName}" not found`);
    }

    let result = node.sql || '';

    const staticParams = { ...params };
    if (node.params) {
      Object.assign(staticParams, node.params);
    }

    const runtimeParams = { ...params };
    if (callArgs) {
      if (typeof callArgs === 'string') {
        result = result.replace(/\{callArgs\}/g, callArgs);
      } else {
        Object.assign(runtimeParams, callArgs);
      }
    }

    result = this.replaceParams(result, runtimeParams);
    result = this.resolveNestedCalls(result, nodes, runtimeParams);

    return result;
  }

  private static replaceParams(sql: string, params: Record<string, unknown>): string {
    let result = sql;
    for (const [key, value] of Object.entries(params)) {
      const placeholder = new RegExp(`\\{${key}\\}`, 'g');
      result = result.replace(placeholder, String(value));
    }
    return result;
  }

  private static resolveNestedCalls(
    sql: string,
    nodes: Record<string, SqlNode>,
    params: Record<string, unknown>
  ): string {
    let result = sql;
    let match;

    const regex = /@(\w+)\s*\(/g;
    const processedParts: string[] = [];
    let lastIndex = 0;

    while ((match = regex.exec(sql)) !== null) {
      const funcName = match[1];
      const startIndex = match.index;

      processedParts.push(sql.slice(lastIndex, startIndex));

      const endIndex = this.findMatchingParen(sql, startIndex + match[0].length - 1);

      if (endIndex === -1) {
        processedParts.push(sql.slice(startIndex));
        lastIndex = sql.length;
        break;
      }

      const callExpr = sql.slice(startIndex, endIndex + 1);
      const innerContent = sql.slice(startIndex + match[0].length, endIndex);

      const args = this.parseArgs(innerContent);
      const resolvedInner = this.resolveNestedCalls(innerContent, nodes, params);
      const resolvedCall = this.replaceArgs(resolvedInner, args);

      try {
        const resolvedResult = this.resolveNode(nodes, funcName, params, resolvedCall);
        processedParts.push(resolvedResult);
      } catch {
        processedParts.push(callExpr);
      }

      lastIndex = endIndex + 1;
      regex.lastIndex = lastIndex;
    }

    if (lastIndex < sql.length) {
      processedParts.push(sql.slice(lastIndex));
    }

    result = processedParts.join('');

    const simplePattern = /@(\w+)/g;
    result = result.replace(simplePattern, (_full, name: string) => {
      if (nodes[name]) {
        try {
          return this.resolveNode(nodes, name, params);
        } catch {
          return _full;
        }
      }
      return _full;
    });

    return result;
  }

  private static findMatchingParen(sql: string, startIndex: number): number {
    let depth = 1;
    for (let i = startIndex + 1; i < sql.length; i++) {
      const char = sql[i];
      if (char === '(') {
        depth++;
      } else if (char === ')') {
        depth--;
        if (depth === 0) {
          return i;
        }
      } else if (char === "'" || char === '"') {
        const quote = char;
        i++;
        while (i < sql.length && sql[i] !== quote) {
          if (sql[i] === '\\') i++;
          i++;
        }
      }
    }
    return -1;
  }

  private static parseArgs(content: string): Record<string, string> {
    const args: Record<string, string> = {};
    if (!content.trim()) {
      return args;
    }

    let depth = 0;
    let current = '';
    let key = '';

    for (let i = 0; i < content.length; i++) {
      const char = content[i];

      if ((char === "'" || char === '"') && (i === 0 || content[i - 1] !== '\\')) {
        let j = i + 1;
        while (j < content.length && content[j] !== char) {
          if (content[j] === '\\') j++;
          j++;
        }
        current += content.slice(i, j + 1);
        i = j;
        continue;
      }

      if (char === '(' || char === ')' || char === '[' || char === ']') {
        depth += char === '(' || char === '[' ? 1 : -1;
        current += char;
        continue;
      }

      if (char === '=' && depth === 0 && key === '') {
        key = current.trim();
        current = '';
        continue;
      }

      if (char === ',' && depth === 0) {
        if (key) {
          args[key.trim()] = current.trim();
        }
        key = '';
        current = '';
        continue;
      }

      current += char;
    }

    if (key || current.trim()) {
      args[key.trim() || 'value'] = current.trim();
    }

    return args;
  }

  private static replaceArgs(content: string, args: Record<string, unknown>): string {
    let result = content;
    for (const [key, value] of Object.entries(args)) {
      const pattern = new RegExp(`\\b${key}\\b`, 'g');
      result = result.replace(pattern, String(value));
    }
    return result;
  }
}

export function parseJsonToSql(jsonString: string, params?: Record<string, unknown>): ParseResult {
  return JsonSqlParser.parse(jsonString, params);
}
