import { describe, it, expect, vi } from 'vitest'

vi.mock('server-only', () => ({}))

vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}))

vi.mock('@/lib/db', () => ({
  findBy: vi.fn(),
  findAll: vi.fn(),
}))

import { hashPassword, verifyPassword, requireAdmin, requireAuthor, getAllUsers } from '@/lib/auth'
import type { User } from '@/lib/types'

function makeUser(role: 'admin' | 'author'): User {
  return {
    id: 'u1',
    email: 'test@example.com',
    password: 'hashedpw',
    name: 'Test User',
    role,
    createdAt: '2024-01-01T00:00:00.000Z',
  }
}

describe('hashPassword', () => {
  it('returns a string', () => {
    const hash = hashPassword('mypassword')
    expect(typeof hash).toBe('string')
  })

  it('returns different hashes for different passwords', () => {
    const h1 = hashPassword('pass1')
    const h2 = hashPassword('pass2')
    expect(h1).not.toBe(h2)
  })

  it('produces consistent results (same password different calls)', () => {
    const h1 = hashPassword('same')
    const h2 = hashPassword('same')
    expect(h1).not.toBe(h2)
    expect(verifyPassword('same', h1)).toBe(true)
    expect(verifyPassword('same', h2)).toBe(true)
  })

  it('supports special characters', () => {
    const hash = hashPassword('p@$$w0rd!ąćę')
    expect(typeof hash).toBe('string')
    expect(verifyPassword('p@$$w0rd!ąćę', hash)).toBe(true)
  })
})

describe('verifyPassword', () => {
  it('returns true for correct password', () => {
    const hash = hashPassword('secret123')
    expect(verifyPassword('secret123', hash)).toBe(true)
  })

  it('returns false for incorrect password', () => {
    const hash = hashPassword('secret123')
    expect(verifyPassword('wrongpass', hash)).toBe(false)
  })

  it('returns false for empty password', () => {
    const hash = hashPassword('secret')
    expect(verifyPassword('', hash)).toBe(false)
  })
})

describe('requireAdmin', () => {
  it('returns true for admin user', () => {
    const admin = makeUser('admin')
    expect(requireAdmin(admin)).toBe(true)
  })

  it('returns false for author user', () => {
    const author = makeUser('author')
    expect(requireAdmin(author)).toBe(false)
  })

  it('returns false for null', () => {
    expect(requireAdmin(null)).toBe(false)
  })
})

describe('requireAuthor', () => {
  it('returns true for admin user', () => {
    const admin = makeUser('admin')
    expect(requireAuthor(admin)).toBe(true)
  })

  it('returns true for author user', () => {
    const author = makeUser('author')
    expect(requireAuthor(author)).toBe(true)
  })

  it('returns false for null', () => {
    expect(requireAuthor(null)).toBe(false)
  })
})

describe('password validation', () => {
  it('hashes passwords of minimum length', () => {
    const hash = hashPassword('123456')
    expect(typeof hash).toBe('string')
    expect(hash.length).toBeGreaterThan(0)
  })

  it('handles long passwords', () => {
    const longPass = 'a'.repeat(100)
    const hash = hashPassword(longPass)
    expect(verifyPassword(longPass, hash)).toBe(true)
  })

  it('rejects case variations', () => {
    const hash = hashPassword('Password')
    expect(verifyPassword('password', hash)).toBe(false)
    expect(verifyPassword('PASSWORD', hash)).toBe(false)
  })
})
