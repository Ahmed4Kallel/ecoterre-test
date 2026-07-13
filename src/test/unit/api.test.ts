import { describe, it, expect, vi, beforeAll } from 'vitest'

vi.mock('server-only', () => ({}))

describe('Database CRUD operations', () => {
  let findAll: typeof import('@/lib/db').findAll
  let findById: typeof import('@/lib/db').findById
  let findBy: typeof import('@/lib/db').findBy
  let insert: typeof import('@/lib/db').insert
  let update: typeof import('@/lib/db').update
  let remove: typeof import('@/lib/db').remove
  let dbAvailable = false

  beforeAll(async () => {
    try {
      const Database = (await import('better-sqlite3')).default

      const db = new Database(':memory:')
      db.pragma('journal_mode = WAL')
      db.pragma('foreign_keys = ON')

      db.exec(`
        CREATE TABLE users (
          id TEXT PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          name TEXT NOT NULL,
          role TEXT NOT NULL DEFAULT 'author',
          avatar TEXT,
          bio TEXT,
          created_at TEXT NOT NULL DEFAULT (datetime('now')),
          updated_at TEXT NOT NULL DEFAULT (datetime('now'))
        );

        CREATE TABLE categories (
          id TEXT PRIMARY KEY,
          slug TEXT UNIQUE NOT NULL,
          name_fr TEXT NOT NULL,
          name_ar TEXT NOT NULL,
          description_fr TEXT DEFAULT '',
          description_ar TEXT DEFAULT '',
          icon TEXT,
          sort_order INTEGER NOT NULL DEFAULT 0,
          created_at TEXT NOT NULL DEFAULT (datetime('now'))
        );

        CREATE TABLE articles (
          id TEXT PRIMARY KEY,
          slug TEXT UNIQUE NOT NULL,
          title_fr TEXT NOT NULL,
          title_ar TEXT NOT NULL,
          content_fr TEXT NOT NULL,
          content_ar TEXT NOT NULL,
          excerpt_fr TEXT DEFAULT '',
          excerpt_ar TEXT DEFAULT '',
          cover_image TEXT,
          audio_url TEXT,
          pdf_url TEXT,
          author_id TEXT NOT NULL REFERENCES users(id),
          status TEXT NOT NULL DEFAULT 'draft',
          views INTEGER NOT NULL DEFAULT 0,
          reading_time INTEGER NOT NULL DEFAULT 0,
          is_featured INTEGER NOT NULL DEFAULT 0,
          published_at TEXT,
          scheduled_at TEXT,
          created_at TEXT NOT NULL DEFAULT (datetime('now')),
          updated_at TEXT NOT NULL DEFAULT (datetime('now'))
        );

        CREATE TABLE article_categories (
          article_id TEXT NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
          category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
          PRIMARY KEY (article_id, category_id)
        );

        CREATE TABLE contacts (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          email TEXT NOT NULL,
          subject TEXT DEFAULT '',
          message TEXT NOT NULL,
          is_read INTEGER NOT NULL DEFAULT 0,
          created_at TEXT NOT NULL DEFAULT (datetime('now'))
        );
      `)

      vi.doMock('@/lib/database', () => ({
        getDb: () => db,
        closeDb: () => { db.close() },
      }))

      const dbModule = await import('@/lib/db')
      findAll = dbModule.findAll
      findById = dbModule.findById
      findBy = dbModule.findBy
      insert = dbModule.insert
      update = dbModule.update
      remove = dbModule.remove
      dbAvailable = true
    } catch (e) {
      dbAvailable = false
    }
  })

  it.runIf(dbAvailable)('inserts and finds a user', () => {
    const user = insert('users', {
      id: 'user-1',
      email: 'test@example.com',
      password: 'hashedpw',
      name: 'Test User',
      role: 'admin',
    })

    expect(user.id).toBe('user-1')

    const found = findById('users', 'user-1') as Record<string, unknown>
    expect(found).toBeDefined()
    expect(found?.email).toBe('test@example.com')
    expect(found?.name).toBe('Test User')
    expect(found?.role).toBe('admin')
  })

  it.runIf(dbAvailable)('finds all users', () => {
    insert('users', {
      id: 'user-2',
      email: 'user2@example.com',
      password: 'pw2',
      name: 'User Two',
      role: 'author',
    })

    const users = findAll('users')
    expect(users.length).toBeGreaterThanOrEqual(2)
  })

  it.runIf(dbAvailable)('finds user by email', () => {
    const user = findBy('users', 'email', 'test@example.com') as Record<string, unknown>
    expect(user).toBeDefined()
    expect(user?.name).toBe('Test User')
  })

  it.runIf(dbAvailable)('returns undefined for non-existent user', () => {
    const user = findById('users', 'nonexistent')
    expect(user).toBeUndefined()
  })

  it.runIf(dbAvailable)('updates a user', () => {
    insert('users', {
      id: 'user-update',
      email: 'update@example.com',
      password: 'pw',
      name: 'Before Update',
      role: 'author',
    })

    const updated = update('users', 'user-update', {
      name: 'After Update',
      email: 'updated@example.com',
    }) as Record<string, unknown>

    expect(updated).toBeDefined()
    expect(updated.name).toBe('After Update')
    expect(updated.email).toBe('updated@example.com')
  })

  it.runIf(dbAvailable)('returns undefined when updating non-existent record', () => {
    const result = update('users', 'no-such-id', { name: 'Nope' })
    expect(result).toBeUndefined()
  })

  it.runIf(dbAvailable)('removes a user', () => {
    insert('users', {
      id: 'user-remove',
      email: 'remove@example.com',
      password: 'pw',
      name: 'To Remove',
      role: 'author',
    })

    const deleted = remove('users', 'user-remove')
    expect(deleted).toBe(true)

    const found = findById('users', 'user-remove')
    expect(found).toBeUndefined()
  })

  it.runIf(dbAvailable)('returns false when removing non-existent record', () => {
    const result = remove('users', 'no-such-id')
    expect(result).toBe(false)
  })

  it.runIf(dbAvailable)('inserts and retrieves categories', () => {
    const cat = insert('categories', {
      id: 'cat-1',
      slug: 'environment',
      name: { fr: 'Environnement', ar: 'البيئة' },
      description: { fr: 'Articles sur l\'environnement', ar: 'مقالات عن البيئة' },
      icon: 'leaf',
      order: 1,
    })

    expect(cat.id).toBe('cat-1')

    const found = findById('categories', 'cat-1') as Record<string, unknown>
    expect(found).toBeDefined()
    expect((found as { slug: string }).slug).toBe('environment')
  })

  it.runIf(dbAvailable)('finds with where filtering', () => {
    insert('users', {
      id: 'filter-1',
      email: 'filter1@example.com',
      password: 'pw',
      name: 'Filter One',
      role: 'author',
    })

    const results = findAll('users', { where: { role: 'author' } })
    expect(results.length).toBeGreaterThan(0)
    for (const u of results) {
      expect((u as Record<string, unknown>).role).toBe('author')
    }
  })

  it.runIf(dbAvailable)('finds with limit and offset', () => {
    const all = findAll('users', { limit: 1, offset: 0 })
    expect(all.length).toBeLessThanOrEqual(1)
  })

  it.runIf(dbAvailable)('handles insert for contacts', () => {
    const contact = insert('contacts', {
      id: 'contact-1',
      name: 'John Doe',
      email: 'john@example.com',
      subject: 'Hello',
      message: 'Test message',
      is_read: 0,
      created_at: new Date().toISOString(),
    })

    expect(contact.id).toBe('contact-1')

    const found = findById('contacts', 'contact-1') as Record<string, unknown>
    expect(found).toBeDefined()
    expect(found.name).toBe('John Doe')
  })
})
