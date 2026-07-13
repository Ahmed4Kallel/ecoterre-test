import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('next/link', () => ({
  default: ({ children, href, className, ...props }: {
    children: React.ReactNode
    href: string
    className?: string
    [key: string]: unknown
  }) => (
    <a href={href} className={className} {...props}>{children}</a>
  ),
}))

const mockUseLocale = vi.fn(() => ({
  locale: 'fr',
  dir: 'ltr' as const,
  t: (key: string) => key,
  switchLocale: vi.fn(),
}))

vi.mock('@/lib/i18n', () => ({
  useLocale: () => mockUseLocale(),
  LocaleContext: {
    Provider: ({ children }: { children: React.ReactNode }) => children,
  },
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/fr',
  useSearchParams: () => new URLSearchParams(),
}))

import Button from '@/components/ui/Button'
import Pagination from '@/components/ui/Pagination'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import Breadcrumbs from '@/components/ui/Breadcrumbs'
import ReadingTime from '@/components/ui/ReadingTime'

describe('Button', () => {
  it('renders with default props', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button')).toHaveTextContent('Click me')
  })

  it('renders with primary variant by default', () => {
    render(<Button>Primary</Button>)
    expect(screen.getByRole('button').className).toContain('bg-green-800')
  })

  it('renders with secondary variant', () => {
    render(<Button variant="secondary">Secondary</Button>)
    expect(screen.getByRole('button').className).toContain('bg-blue-700')
  })

  it('renders with outline variant', () => {
    render(<Button variant="outline">Outline</Button>)
    expect(screen.getByRole('button').className).toContain('border-2')
  })

  it('renders with danger variant', () => {
    render(<Button variant="danger">Danger</Button>)
    expect(screen.getByRole('button').className).toContain('bg-red-600')
  })

  it('renders with small size', () => {
    render(<Button size="sm">Small</Button>)
    expect(screen.getByRole('button').className).toContain('px-3')
  })

  it('renders with large size', () => {
    render(<Button size="lg">Large</Button>)
    expect(screen.getByRole('button').className).toContain('px-7')
  })

  it('renders as a link when href is provided', () => {
    render(<Button href="/articles">Link button</Button>)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/articles')
    expect(link).toHaveTextContent('Link button')
  })

  it('passes disabled and type attributes through', () => {
    render(<Button disabled type="submit">Submit</Button>)
    const btn = screen.getByRole('button')
    expect(btn).toBeDisabled()
    expect(btn).toHaveAttribute('type', 'submit')
  })

  it('applies additional className', () => {
    render(<Button className="my-custom">Styled</Button>)
    expect(screen.getByRole('button').className).toContain('my-custom')
  })
})

describe('Pagination', () => {
  it('returns null when totalPages is 1', () => {
    const { container } = render(
      <Pagination currentPage={1} totalPages={1} baseUrl="/articles" />
    )
    expect(container.firstChild).toBeNull()
  })

  it('shows page numbers', () => {
    render(<Pagination currentPage={1} totalPages={5} baseUrl="/articles" />)
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('highlights current page', () => {
    render(<Pagination currentPage={3} totalPages={5} baseUrl="/articles" />)
    const current = screen.getByText('3')
    expect(current).toBeInTheDocument()
  })

  it('disables previous on first page', () => {
    render(<Pagination currentPage={1} totalPages={3} baseUrl="/articles" />)
    const prev = screen.getByText(/pagination_prev/)
    expect(prev).toHaveAttribute('aria-disabled', 'true')
  })

  it('disables next on last page', () => {
    render(<Pagination currentPage={3} totalPages={3} baseUrl="/articles" />)
    const next = screen.getByText(/pagination_next/)
    expect(next).toHaveAttribute('aria-disabled', 'true')
  })

  it('generates correct page URLs', () => {
    render(<Pagination currentPage={2} totalPages={3} baseUrl="/blog" />)
    expect(screen.getByText('3').closest('a')).toHaveAttribute('href', '/blog?page=3')
  })

  it('has nav with aria-label', () => {
    render(<Pagination currentPage={1} totalPages={3} baseUrl="/test" />)
    expect(screen.getByRole('navigation')).toHaveAttribute('aria-label', 'Pagination')
  })

  it('shows ellipsis for wide page ranges', () => {
    render(<Pagination currentPage={5} totalPages={10} baseUrl="/items" />)
    expect(screen.getAllByText('...').length).toBeGreaterThanOrEqual(1)
  })
})

describe('LoadingSpinner', () => {
  it('renders with role status', () => {
    render(<LoadingSpinner />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('has sr-only text for accessibility', () => {
    render(<LoadingSpinner />)
    const status = screen.getByRole('status')
    expect(status.querySelector('.sr-only')).toBeInTheDocument()
    expect(status.querySelector('.sr-only')?.textContent?.trim().length).toBeGreaterThan(0)
  })

  it('renders spinning animation element', () => {
    render(<LoadingSpinner />)
    const spinner = screen.getByRole('status').querySelector('.animate-spin')
    expect(spinner).toBeInTheDocument()
  })

  it('accepts custom label prop', () => {
    render(<LoadingSpinner label="Loading articles..." />)
    const status = screen.getByRole('status')
    expect(status).toHaveAttribute('aria-label', 'Loading articles...')
  })
})

describe('Breadcrumbs', () => {
  it('renders all item labels', () => {
    const items = [
      { label: 'Home', href: '/' },
      { label: 'Category', href: '/category' },
      { label: 'Article' },
    ]
    render(<Breadcrumbs items={items} />)
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('Category')).toBeInTheDocument()
    expect(screen.getByText('Article')).toBeInTheDocument()
  })

  it('renders links for items with href', () => {
    const items = [
      { label: 'Home', href: '/' },
      { label: 'Current' },
    ]
    render(<Breadcrumbs items={items} />)
    expect(screen.getByText('Home').closest('a')).toHaveAttribute('href', '/')
  })

  it('renders last item as plain text', () => {
    const items = [
      { label: 'Home', href: '/' },
      { label: 'Current' },
    ]
    render(<Breadcrumbs items={items} />)
    const last = screen.getByText('Current')
    expect(last.closest('a')).toBeNull()
  })

  it('renders with aria-label Breadcrumb', () => {
    render(<Breadcrumbs items={[{ label: 'Home', href: '/' }]} />)
    expect(screen.getByRole('navigation')).toHaveAttribute('aria-label', 'Breadcrumb')
  })

  it('renders empty list without errors', () => {
    const { container } = render(<Breadcrumbs items={[]} />)
    expect(container.querySelector('ol')).toBeInTheDocument()
  })

  it('includes structured data script', () => {
    const { container } = render(
      <Breadcrumbs items={[{ label: 'Home', href: '/' }]} />
    )
    const script = container.querySelector('script[type="application/ld+json"]')
    expect(script).toBeInTheDocument()
    const parsed = JSON.parse(script?.textContent || '{}')
    expect(parsed['@type']).toBe('BreadcrumbList')
  })
})

describe('ReadingTime', () => {
  beforeEach(() => {
    mockUseLocale.mockReturnValue({
      locale: 'fr',
      dir: 'ltr' as const,
      t: (key: string) => key,
      switchLocale: vi.fn(),
    })
  })

  it('shows 1 minute for short text', () => {
    render(<ReadingTime text="Hello world" />)
    expect(screen.getByText(/1/)).toBeInTheDocument()
  })

  it('calculates reading time for longer text', () => {
    const words = Array.from({ length: 500 }, (_, i) => `word${i}`).join(' ')
    render(<ReadingTime text={words} />)
    expect(screen.getByText(/3/)).toBeInTheDocument()
  })

  it('ignores HTML tags when counting words', () => {
    render(<ReadingTime text="<p>Hello world test</p>" />)
    expect(screen.getByText(/1/)).toBeInTheDocument()
  })

  it('shows minimum 1 minute for empty text', () => {
    render(<ReadingTime text="" />)
    expect(screen.getByText(/1/)).toBeInTheDocument()
  })

  it('renders clock SVG icon', () => {
    const { container } = render(<ReadingTime text="Some text" />)
    expect(container.querySelector('svg')).toBeInTheDocument()
  })
})
