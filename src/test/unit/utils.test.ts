import { describe, it, expect, vi, beforeAll } from 'vitest'

vi.mock('server-only', () => ({}))

describe('generateId', () => {
  it('returns a string', async () => {
    const { generateId } = await import('@/lib/utils')
    const id = generateId()
    expect(typeof id).toBe('string')
  })

  it('returns non-empty string', async () => {
    const { generateId } = await import('@/lib/utils')
    expect(generateId().length).toBeGreaterThan(0)
  })

  it('returns unique values on multiple calls', async () => {
    const { generateId } = await import('@/lib/utils')
    const ids = new Set(Array.from({ length: 100 }, () => generateId()))
    expect(ids.size).toBe(100)
  })

  it('does not contain spaces or special chars', async () => {
    const { generateId } = await import('@/lib/utils')
    const id = generateId()
    expect(id).not.toMatch(/\s/)
    expect(id).not.toMatch(/[^a-z0-9]/)
  })
})

describe('slugify', () => {
  it('converts text to lowercase', async () => {
    const { slugify } = await import('@/lib/utils')
    expect(slugify('Hello World')).toBe('hello-world')
  })

  it('replaces spaces with hyphens', async () => {
    const { slugify } = await import('@/lib/utils')
    expect(slugify('hello world')).toBe('hello-world')
  })

  it('removes special characters', async () => {
    const { slugify } = await import('@/lib/utils')
    expect(slugify('hello!@#$%^&*()world')).toBe('helloworld')
  })

  it('collapses multiple hyphens', async () => {
    const { slugify } = await import('@/lib/utils')
    expect(slugify('hello---world')).toBe('hello-world')
  })

  it('handles accented characters by removing them', async () => {
    const { slugify } = await import('@/lib/utils')
    const result = slugify('café résumé naïve')
    expect(result).toBe('caf-rsum-nave')
  })

  it('handles underscores as word separators', async () => {
    const { slugify } = await import('@/lib/utils')
    expect(slugify('hello_world_test')).toBe('hello-world-test')
  })

  it('handles mixed spaces and hyphens', async () => {
    const { slugify } = await import('@/lib/utils')
    expect(slugify('hello - world -- test')).toBe('hello-world-test')
  })

  it('handles empty string', async () => {
    const { slugify } = await import('@/lib/utils')
    expect(slugify('')).toBe('')
  })

  it('handles arabic text', async () => {
    const { slugify } = await import('@/lib/utils')
    const result = slugify('مرحبا بالعالم')
    expect(result.length).toBeGreaterThan(0)
    expect(result).not.toMatch(/\s/)
  })

  it('handles leading and trailing whitespace', async () => {
    const { slugify } = await import('@/lib/utils')
    const result = slugify('  hello world  ')
    expect(result.replace(/^-+|-+$/g, '')).toBe('hello-world')
  })
})

describe('validateInput', () => {
  let validateInput: (input: string, type: 'email' | 'text' | 'url' | 'slug') => boolean

  beforeAll(async () => {
    const mod = await import('@/lib/security')
    validateInput = mod.validateInput
  })

  it('validates email addresses', () => {
    expect(validateInput('test@example.com', 'email')).toBe(true)
    expect(validateInput('invalid-email', 'email')).toBe(false)
    expect(validateInput('', 'email')).toBe(false)
    expect(validateInput('a@b.c', 'email')).toBe(true)
  })

  it('validates text input', () => {
    expect(validateInput('Hello world', 'text')).toBe(true)
    expect(validateInput('', 'text')).toBe(false)
    expect(validateInput('  ', 'text')).toBe(false)
  })

  it('validates URLs', () => {
    expect(validateInput('https://example.com', 'url')).toBe(true)
    expect(validateInput('http://example.com/path?q=1', 'url')).toBe(true)
    expect(validateInput('ftp://example.com', 'url')).toBe(false)
    expect(validateInput('not-a-url', 'url')).toBe(false)
  })

  it('validates slugs', () => {
    expect(validateInput('hello-world', 'slug')).toBe(true)
    expect(validateInput('hello-world-123', 'slug')).toBe(true)
    expect(validateInput('Hello-World', 'slug')).toBe(false)
    expect(validateInput('hello world', 'slug')).toBe(false)
  })

  it('returns false for non-string input', () => {
    expect(validateInput('' as never, 'text')).toBe(false)
  })
})

describe('escapeHtml', () => {
  let escapeHtml: (str: string) => string

  beforeAll(async () => {
    const mod = await import('@/lib/security')
    escapeHtml = mod.escapeHtml
  })

  it('escapes ampersands', () => {
    expect(escapeHtml('a & b')).toBe('a &amp; b')
  })

  it('escapes less-than and greater-than', () => {
    expect(escapeHtml('<script>')).toBe('&lt;script&gt;')
  })

  it('escapes double quotes', () => {
    expect(escapeHtml('say "hello"')).toBe('say &quot;hello&quot;')
  })

  it('escapes single quotes', () => {
    expect(escapeHtml("it's")).toBe('it&#x27;s')
  })

  it('handles empty string', () => {
    expect(escapeHtml('')).toBe('')
  })

  it('returns safe text unchanged', () => {
    expect(escapeHtml('Hello World 123')).toBe('Hello World 123')
  })
})

describe('sanitizeHtml', () => {
  let sanitizeHtml: (html: string) => string

  beforeAll(async () => {
    const mod = await import('@/lib/security')
    sanitizeHtml = mod.sanitizeHtml
  })

  it('removes script tags', () => {
    const cleaned = sanitizeHtml('<p>Hello</p><script>alert("xss")</script>')
    expect(cleaned).not.toContain('script')
    expect(cleaned).toContain('Hello')
  })

  it('keeps safe HTML tags', () => {
    const cleaned = sanitizeHtml('<p><strong>Bold</strong> and <em>italic</em></p>')
    expect(cleaned).toContain('<strong>Bold</strong>')
    expect(cleaned).toContain('<em>italic</em>')
  })

  it('handles empty string', () => {
    expect(sanitizeHtml('')).toBe('')
  })

  it('removes onclick handlers', () => {
    const cleaned = sanitizeHtml('<div onclick="bad()">Click</div>')
    expect(cleaned).not.toContain('onclick')
  })
})

describe('CSRF tokens', () => {
  let generateCsrfToken: () => string
  let validateCsrfToken: (token: string, storedToken: string) => boolean

  beforeAll(async () => {
    const mod = await import('@/lib/security')
    generateCsrfToken = mod.generateCsrfToken
    validateCsrfToken = mod.validateCsrfToken
  })

  it('generates a 32-character token', () => {
    const token = generateCsrfToken()
    expect(token).toHaveLength(32)
  })

  it('generates unique tokens', () => {
    const t1 = generateCsrfToken()
    const t2 = generateCsrfToken()
    expect(t1).not.toBe(t2)
  })

  it('validates matching tokens', () => {
    expect(validateCsrfToken('abc', 'abc')).toBe(true)
  })

  it('rejects mismatched tokens', () => {
    expect(validateCsrfToken('abc', 'def')).toBe(false)
  })

  it('rejects empty tokens', () => {
    expect(validateCsrfToken('', 'abc')).toBe(false)
    expect(validateCsrfToken('abc', '')).toBe(false)
  })

  it('rejects tokens of different lengths', () => {
    expect(validateCsrfToken('abc', 'abcd')).toBe(false)
  })
})
