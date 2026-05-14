import { JsonSqlParser, type ParseResult } from './parser';

export interface SqlGeneratorOptions {
  indent?: string;
  uppercaseKeywords?: boolean;
  trimWhitespace?: boolean;
}

export class SqlGenerator {
  private parser: typeof JsonSqlParser;
  private options: Required<SqlGeneratorOptions>;

  constructor(options: SqlGeneratorOptions = {}) {
    this.parser = JsonSqlParser;
    this.options = {
      indent: options.indent ?? '  ',
      uppercaseKeywords: options.uppercaseKeywords ?? true,
      trimWhitespace: options.trimWhitespace ?? true,
    };
  }

  generate(jsonString: string, params?: Record<string, unknown>): ParseResult {
    let result = this.parser.parse(jsonString, params);

    if (!result.error && this.options.uppercaseKeywords) {
      result.sql = this.formatKeywords(result.sql);
    }

    if (!result.error && this.options.trimWhitespace) {
      result.sql = this.trimSql(result.sql);
    }

    return result;
  }

  private formatKeywords(sql: string): string {
    const keywords = [
      'SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'JOIN', 'LEFT', 'RIGHT', 'INNER', 'OUTER',
      'ON', 'AS', 'IN', 'NOT', 'NULL', 'IS', 'LIKE', 'BETWEEN', 'ORDER', 'BY', 'GROUP',
      'HAVING', 'LIMIT', 'OFFSET', 'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE',
      'CREATE', 'TABLE', 'ALTER', 'DROP', 'INDEX', 'VIEW', 'DISTINCT', 'COUNT', 'SUM',
      'AVG', 'MAX', 'MIN', 'UNION', 'ALL', 'EXISTS', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END',
    ];

    let result = sql;
    for (const keyword of keywords) {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      result = result.replace(regex, keyword);
    }

    return result;
  }

  private trimSql(sql: string): string {
    return sql
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .join('\n');
  }

  format(sql: string, indentLevel = 0): string {
    const indent = this.options.indent.repeat(indentLevel);
    let result = indent + sql;

    result = result.replace(
      /\b(SELECT|FROM|WHERE|AND|OR|JOIN|ORDER BY|GROUP BY|HAVING|LIMIT)\b/gi,
      '\n' + indent + '$1'
    );

    return result.trim();
  }

  validateSyntax(sql: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    const unclosedParens = (sql.match(/\(/g) || []).length - (sql.match(/\)/g) || []).length;
    if (unclosedParens !== 0) {
      errors.push(`Unclosed parentheses: ${Math.abs(unclosedParens)} ${unclosedParens > 0 ? 'more opening' : 'more closing'}`);
    }

    const unclosedQuotes = (sql.match(/'/g) || []).length % 2;
    if (unclosedQuotes !== 0) {
      errors.push('Unclosed single quotes');
    }

    const doubleQuotes = (sql.match(/"/g) || []).length % 2;
    if (doubleQuotes !== 0) {
      errors.push('Unclosed double quotes');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

export function generateSql(jsonString: string, params?: Record<string, unknown>, options?: SqlGeneratorOptions): ParseResult {
  const generator = new SqlGenerator(options);
  return generator.generate(jsonString, params);
}
