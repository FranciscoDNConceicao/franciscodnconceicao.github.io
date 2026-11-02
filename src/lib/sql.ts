/**
 * A tiny, read-only SQL engine: enough of PostgreSQL's SELECT and psql's meta-commands to query
 * a few in-memory tables. Error messages follow PostgreSQL's wording.
 */

export type Value = string | number | boolean | null
export type Row = Record<string, Value>

export interface Column {
  name: string
  type: 'text' | 'integer' | 'boolean'
  nullable?: boolean
}

export interface Table {
  columns: Column[]
  rows: Row[]
}

export type Database = Record<string, Table>

export type Result =
  | { kind: 'rows'; title?: string; columns: string[]; rows: Value[][] }
  | { kind: 'text'; text: string }
  | { kind: 'error'; text: string }
  | { kind: 'clear' }

class SqlError extends Error {}

// ---------- Tokens ----------

interface Token {
  type: 'word' | 'quoted' | 'number' | 'string' | 'symbol'
  value: string
  upper: string
}

function tokenize(sql: string): Token[] {
  const tokens: Token[] = []
  let i = 0
  while (i < sql.length) {
    const ch = sql[i]
    if (/\s/.test(ch)) {
      i++
    } else if (ch === '-' && sql[i + 1] === '-') {
      while (i < sql.length && sql[i] !== '\n') i++
    } else if (/[A-Za-z_]/.test(ch)) {
      let j = i
      while (j < sql.length && /[A-Za-z0-9_]/.test(sql[j])) j++
      const value = sql.slice(i, j)
      tokens.push({ type: 'word', value, upper: value.toUpperCase() })
      i = j
    } else if (/[0-9]/.test(ch)) {
      let j = i
      while (j < sql.length && /[0-9.]/.test(sql[j])) j++
      const value = sql.slice(i, j)
      tokens.push({ type: 'number', value, upper: value })
      i = j
    } else if (ch === "'" || ch === '"') {
      let j = i + 1
      let out = ''
      for (;;) {
        if (j >= sql.length) {
          throw new SqlError(
            ch === "'" ? `unterminated quoted string at or near "${sql.slice(i)}"` : `unterminated quoted identifier at or near "${sql.slice(i)}"`,
          )
        }
        if (sql[j] === ch) {
          if (sql[j + 1] === ch) {
            out += ch
            j += 2
            continue
          }
          break
        }
        out += sql[j++]
      }
      tokens.push({ type: ch === "'" ? 'string' : 'quoted', value: out, upper: out })
      i = j + 1
    } else {
      const two = sql.slice(i, i + 2)
      if (['<=', '>=', '<>', '!='].includes(two)) {
        tokens.push({ type: 'symbol', value: two, upper: two })
        i += 2
      } else if ('(),*;=<>.'.includes(ch)) {
        tokens.push({ type: 'symbol', value: ch, upper: ch })
        i++
      } else {
        throw new SqlError(`syntax error at or near "${ch}"`)
      }
    }
  }
  return tokens
}

// ---------- Syntax tree ----------

type Operand = { kind: 'column'; name: string } | { kind: 'literal'; value: Value }

type Expr =
  | { kind: 'and' | 'or'; left: Expr; right: Expr }
  | { kind: 'not'; expr: Expr }
  | { kind: 'compare'; op: string; left: Operand; right: Operand }
  | { kind: 'like'; negate: boolean; insensitive: boolean; left: Operand; right: Operand }
  | { kind: 'isnull'; negate: boolean; operand: Operand }
  | { kind: 'truthy'; operand: Operand }

type SelectItem = { kind: 'star' } | { kind: 'column'; name: string; alias: string } | { kind: 'count'; alias: string }

interface Select {
  distinct: boolean
  items: SelectItem[]
  table: string
  where?: Expr
  groupBy?: string
  orderBy?: { key: string | number; desc: boolean }
  limit?: number
}

const RESERVED = new Set(['FROM', 'WHERE', 'GROUP', 'ORDER', 'LIMIT', 'AND', 'OR', 'NOT', 'AS', 'BY', 'SELECT'])

// ---------- Parser ----------

class Parser {
  private pos = 0
  constructor(private readonly tokens: Token[]) {}

  private peek() {
    return this.tokens[this.pos]
  }
  private next() {
    return this.tokens[this.pos++]
  }
  private fail(): never {
    const token = this.peek()
    throw new SqlError(token ? `syntax error at or near "${token.value}"` : 'syntax error at end of input')
  }
  private accept(upper: string) {
    if (this.peek()?.upper === upper) {
      this.pos++
      return true
    }
    return false
  }
  private expect(upper: string) {
    if (!this.accept(upper)) this.fail()
  }
  private identifier() {
    const token = this.peek()
    if (token?.type === 'quoted') return this.next().value
    if (token?.type !== 'word' || RESERVED.has(token.upper)) this.fail()
    return this.next().value.toLowerCase()
  }

  select(): Select {
    this.expect('SELECT')
    const distinct = this.accept('DISTINCT')
    const items: SelectItem[] = []
    do items.push(this.item())
    while (this.accept(','))
    this.expect('FROM')
    const query: Select = { distinct, items, table: this.identifier() }
    if (this.accept('WHERE')) query.where = this.or()
    if (this.accept('GROUP')) {
      this.expect('BY')
      query.groupBy = this.identifier()
    }
    if (this.accept('ORDER')) {
      this.expect('BY')
      const token = this.peek()
      const key = token?.type === 'number' ? Number(this.next().value) : this.identifier()
      const desc = this.accept('DESC')
      if (!desc) this.accept('ASC')
      query.orderBy = { key, desc }
    }
    if (this.accept('LIMIT')) {
      const token = this.next()
      if (token?.type !== 'number') {
        this.pos--
        this.fail()
      }
      query.limit = Number(token.value)
    }
    this.accept(';')
    if (this.peek()) this.fail()
    return query
  }

  private item(): SelectItem {
    if (this.accept('*')) return { kind: 'star' }
    if (this.peek()?.upper === 'COUNT') {
      this.next()
      this.expect('(')
      this.expect('*')
      this.expect(')')
      return { kind: 'count', alias: this.alias() ?? 'count' }
    }
    const name = this.identifier()
    return { kind: 'column', name, alias: this.alias() ?? name }
  }

  private alias() {
    if (this.accept('AS')) return this.identifier()
    return undefined
  }

  private or(): Expr {
    let left = this.and()
    while (this.accept('OR')) left = { kind: 'or', left, right: this.and() }
    return left
  }

  private and(): Expr {
    let left = this.not()
    while (this.accept('AND')) left = { kind: 'and', left, right: this.not() }
    return left
  }

  private not(): Expr {
    if (this.accept('NOT')) return { kind: 'not', expr: this.not() }
    if (this.accept('(')) {
      const expr = this.or()
      this.expect(')')
      return expr
    }
    return this.condition()
  }

  private condition(): Expr {
    const left = this.operand()
    const token = this.peek()
    if (token?.upper === 'IS') {
      this.next()
      const negate = this.accept('NOT')
      this.expect('NULL')
      return { kind: 'isnull', negate, operand: left }
    }
    const negate = this.accept('NOT')
    if (this.peek()?.upper === 'LIKE' || this.peek()?.upper === 'ILIKE') {
      const insensitive = this.next().upper === 'ILIKE'
      return { kind: 'like', negate, insensitive, left, right: this.operand() }
    }
    if (negate) this.fail()
    if (token?.type === 'symbol' && ['=', '<>', '!=', '<', '>', '<=', '>='].includes(token.value)) {
      this.next()
      return { kind: 'compare', op: token.value, left, right: this.operand() }
    }
    return { kind: 'truthy', operand: left }
  }

  private operand(): Operand {
    const token = this.peek()
    if (!token) this.fail()
    if (token.type === 'string') return { kind: 'literal', value: this.next().value }
    if (token.type === 'number') return { kind: 'literal', value: Number(this.next().value) }
    if (token.upper === 'NULL') {
      this.next()
      return { kind: 'literal', value: null }
    }
    if (token.upper === 'TRUE' || token.upper === 'FALSE') {
      this.next()
      return { kind: 'literal', value: token.upper === 'TRUE' }
    }
    return { kind: 'column', name: this.identifier() }
  }
}

// ---------- Evaluation ----------

function compare(a: Value, b: Value) {
  if (typeof a === 'number' && typeof b === 'number') return a - b
  return String(a).localeCompare(String(b))
}

function likeToRegExp(pattern: string, insensitive: boolean) {
  const source = pattern
    .split('')
    .map((ch) => (ch === '%' ? '.*' : ch === '_' ? '.' : ch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
    .join('')
  return new RegExp(`^${source}$`, insensitive ? 'is' : 's')
}

function evaluate(expr: Expr, row: Row): boolean | null {
  const value = (o: Operand) => (o.kind === 'column' ? row[o.name] : o.value)
  switch (expr.kind) {
    case 'and': {
      const l = evaluate(expr.left, row)
      const r = evaluate(expr.right, row)
      if (l === false || r === false) return false
      return l === null || r === null ? null : true
    }
    case 'or': {
      const l = evaluate(expr.left, row)
      const r = evaluate(expr.right, row)
      if (l === true || r === true) return true
      return l === null || r === null ? null : false
    }
    case 'not': {
      const v = evaluate(expr.expr, row)
      return v === null ? null : !v
    }
    case 'isnull': {
      const isNull = value(expr.operand) === null
      return expr.negate ? !isNull : isNull
    }
    case 'truthy': {
      const v = value(expr.operand)
      if (v === null) return null
      if (typeof v !== 'boolean') throw new SqlError('argument of WHERE must be type boolean')
      return v
    }
    case 'like': {
      const l = value(expr.left)
      const r = value(expr.right)
      if (l === null || r === null) return null
      const match = likeToRegExp(String(r), expr.insensitive).test(String(l))
      return expr.negate ? !match : match
    }
    case 'compare': {
      const l = value(expr.left)
      const r = value(expr.right)
      if (l === null || r === null) return null
      const c = typeof l === typeof r ? compare(l, r) : String(l) === String(r) ? 0 : compare(l, r)
      switch (expr.op) {
        case '=':
          return c === 0
        case '<>':
        case '!=':
          return c !== 0
        case '<':
          return c < 0
        case '>':
          return c > 0
        case '<=':
          return c <= 0
        default:
          return c >= 0
      }
    }
  }
}

function columnsIn(expr: Expr | undefined, out: string[] = []): string[] {
  if (!expr) return out
  const add = (o: Operand) => o.kind === 'column' && out.push(o.name)
  switch (expr.kind) {
    case 'and':
    case 'or':
      columnsIn(expr.left, out)
      columnsIn(expr.right, out)
      break
    case 'not':
      columnsIn(expr.expr, out)
      break
    case 'isnull':
    case 'truthy':
      add(expr.operand)
      break
    default:
      add(expr.left)
      add(expr.right)
  }
  return out
}

function execute(db: Database, query: Select): Result {
  const table = db[query.table]
  if (!table) throw new SqlError(`relation "${query.table}" does not exist`)
  const names = table.columns.map((c) => c.name)
  const check = (name: string) => {
    if (!names.includes(name)) throw new SqlError(`column "${name}" does not exist`)
  }
  query.items.forEach((item) => item.kind === 'column' && check(item.name))
  columnsIn(query.where).forEach(check)
  if (query.groupBy) check(query.groupBy)

  let rows = table.rows.filter((row) => !query.where || evaluate(query.where, row) === true)
  const aggregate = Boolean(query.groupBy) || query.items.some((item) => item.kind === 'count')

  // Ordering by a table column that is not selected has to happen before projection.
  const order = query.orderBy
  if (order && typeof order.key === 'string' && !aggregate) {
    const selected = query.items.some((i) => i.kind === 'star' || (i.kind !== 'count' && i.alias === order.key))
    if (!selected) {
      check(order.key)
      const key = order.key
      rows = [...rows].sort((a, b) => sortValues(a[key], b[key], order.desc))
    }
  }

  let columns: string[]
  let out: Value[][]
  if (aggregate) {
    for (const item of query.items) {
      if (item.kind === 'count') continue
      const name = item.kind === 'star' ? names[0] : item.name
      if (name !== query.groupBy) {
        throw new SqlError(`column "${query.table}.${name}" must appear in the GROUP BY clause or be used in an aggregate function`)
      }
    }
    const groups = new Map<string, Row[]>()
    if (query.groupBy) {
      for (const row of rows) {
        const key = JSON.stringify(row[query.groupBy])
        groups.set(key, [...(groups.get(key) ?? []), row])
      }
    } else {
      groups.set('all', rows)
    }
    columns = query.items.map((item) => (item.kind === 'star' ? names[0] : item.alias))
    out = [...groups.values()].map((group) =>
      query.items.map((item) => (item.kind === 'count' ? group.length : group[0][item.kind === 'star' ? names[0] : item.name])),
    )
  } else {
    const expanded = query.items.flatMap((item) =>
      item.kind === 'star' ? names.map((name) => ({ name, alias: name })) : item.kind === 'column' ? [item] : [],
    )
    columns = expanded.map((item) => item.alias)
    out = rows.map((row) => expanded.map((item) => row[item.name]))
  }

  if (query.distinct) {
    const seen = new Set<string>()
    out = out.filter((row) => {
      const key = JSON.stringify(row)
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  }

  if (order) {
    const index = typeof order.key === 'number' ? order.key - 1 : columns.indexOf(order.key)
    if (typeof order.key === 'number' && (index < 0 || index >= columns.length)) {
      throw new SqlError(`ORDER BY position ${order.key} is not in select list`)
    }
    if (index < 0 && aggregate) throw new SqlError(`column "${order.key}" does not exist`)
    if (index >= 0) out = [...out].sort((a, b) => sortValues(a[index], b[index], order.desc))
  }

  if (query.limit !== undefined) out = out.slice(0, query.limit)
  return { kind: 'rows', columns, rows: out }
}

/** Ascending order puts NULLs last, like PostgreSQL. */
function sortValues(a: Value, b: Value, desc: boolean) {
  if (a === null || b === null) return a === b ? 0 : a === null ? (desc ? -1 : 1) : desc ? 1 : -1
  const c = compare(a, b)
  return desc ? -c : c
}

// ---------- psql meta-commands ----------

const HELP = `This is a tiny read-only SQL engine with my CV loaded into it.

  \\dt              list tables
  \\d <table>       describe a table
  SELECT ...       columns or *, COUNT(*), DISTINCT, WHERE (=, <>, <, >,
                   LIKE, ILIKE, IS NULL, AND, OR, NOT), GROUP BY,
                   ORDER BY, LIMIT
  clear            clear the screen`

function meta(db: Database, input: string): Result {
  const [command, arg] = input.replace(/;\s*$/, '').split(/\s+/)
  switch (command) {
    case '\\dt':
      return {
        kind: 'rows',
        title: 'List of relations',
        columns: ['Schema', 'Name', 'Type', 'Owner'],
        rows: Object.keys(db).map((name) => ['public', name, 'table', 'francisco']),
      }
    case '\\d': {
      if (!arg) return meta(db, '\\dt')
      const table = db[arg.toLowerCase()]
      if (!table) return { kind: 'error', text: `Did not find any relation named "${arg}".` }
      return {
        kind: 'rows',
        title: `Table "public.${arg.toLowerCase()}"`,
        columns: ['Column', 'Type', 'Nullable'],
        rows: table.columns.map((c) => [c.name, c.type, c.nullable ? '' : 'not null']),
      }
    }
    case '\\?':
    case '\\h':
      return { kind: 'text', text: HELP }
    case '\\q':
      return { kind: 'text', text: "There's no quitting from a website. Try scrolling instead." }
    default:
      return { kind: 'error', text: `invalid command ${command}\nTry \\? for help.` }
  }
}

const WRITES: Record<string, string> = {
  INSERT: 'INSERT',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
  DROP: 'DROP',
  CREATE: 'CREATE',
  ALTER: 'ALTER',
  TRUNCATE: 'TRUNCATE',
  GRANT: 'GRANT',
}

export function run(db: Database, input: string): Result {
  const sql = input.trim()
  if (!sql) return { kind: 'text', text: '' }
  const bare = sql.replace(/;\s*$/, '').trim().toLowerCase()
  if (sql.startsWith('\\')) return meta(db, sql)
  if (bare === 'help') return { kind: 'text', text: HELP }
  if (bare === 'clear') return { kind: 'clear' }

  try {
    const tokens = tokenize(sql)
    const first = tokens[0]
    if (first && WRITES[first.upper]) {
      const object = tokens[1]?.type === 'word' && ['TABLE', 'DATABASE', 'SCHEMA', 'INDEX'].includes(tokens[1].upper)
      throw new SqlError(`cannot execute ${first.upper}${object ? ` ${tokens[1].upper}` : ''} in a read-only transaction`)
    }
    if (bare === 'select version()') {
      return { kind: 'rows', columns: ['version'], rows: [['PostgreSQL 16 (well, a few hundred lines of TypeScript pretending)']] }
    }
    return execute(db, new Parser(tokens).select())
  } catch (error) {
    if (error instanceof SqlError) return { kind: 'error', text: `ERROR:  ${error.message}` }
    throw error
  }
}

/** psql shows NULL as an empty cell and booleans as t / f. */
export function display(value: Value) {
  if (value === null) return ''
  if (typeof value === 'boolean') return value ? 't' : 'f'
  return String(value)
}
