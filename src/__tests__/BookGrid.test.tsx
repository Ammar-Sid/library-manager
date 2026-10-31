/**
 * Phase 4 TDD - BookGrid component tests
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import BookGrid from '@/components/BookGrid';

const mockBooks = [
  {
    id: 'book-1',
    title: 'Clean Code',
    description: 'A Handbook of Agile Software Craftsmanship',
    pdfUrl: 'https://blob.vercel-storage.com/books/user-1/clean-code.pdf',
    coverUrl: null,
    createdAt: new Date('2024-01-15'),
    user: { name: 'Robert Martin', email: 'robert@example.com' },
  },
  {
    id: 'book-2',
    title: 'The Pragmatic Programmer',
    description: 'Your Journey to Mastery',
    pdfUrl: 'https://blob.vercel-storage.com/books/user-1/pragmatic.pdf',
    coverUrl: null,
    createdAt: new Date('2024-02-20'),
    user: { name: 'David Thomas', email: 'david@example.com' },
  },
  {
    id: 'book-3',
    title: 'Design Patterns',
    description: null,
    pdfUrl: 'https://blob.vercel-storage.com/books/user-2/patterns.pdf',
    coverUrl: null,
    createdAt: new Date('2024-03-10'),
    user: { name: null, email: 'gof@example.com' },
  },
];

describe('BookGrid Component', () => {
  it('renders all book titles distinctly', () => {
    render(<BookGrid books={mockBooks} />);
    expect(screen.getByTestId('book-title-book-1')).toHaveTextContent('Clean Code');
    expect(screen.getByTestId('book-title-book-2')).toHaveTextContent('The Pragmatic Programmer');
    expect(screen.getByTestId('book-title-book-3')).toHaveTextContent('Design Patterns');
  });

  it('renders a card for each book', () => {
    render(<BookGrid books={mockBooks} />);
    expect(screen.getByTestId('book-card-book-1')).toBeInTheDocument();
    expect(screen.getByTestId('book-card-book-2')).toBeInTheDocument();
    expect(screen.getByTestId('book-card-book-3')).toBeInTheDocument();
  });

  it('shows uploader metadata for each book', () => {
    render(<BookGrid books={mockBooks} />);
    expect(screen.getByTestId('book-uploader-book-1')).toHaveTextContent('Robert Martin');
    expect(screen.getByTestId('book-uploader-book-2')).toHaveTextContent('David Thomas');
    // Falls back to email when name is null
    expect(screen.getByTestId('book-uploader-book-3')).toHaveTextContent('gof@example.com');
  });

  it('renders accessible view triggers for each book', () => {
    render(<BookGrid books={mockBooks} />);
    const viewTrigger1 = screen.getByTestId('view-book-book-1');
    const viewTrigger2 = screen.getByTestId('view-book-book-2');
    expect(viewTrigger1).toHaveAttribute('aria-label', 'View Clean Code');
    expect(viewTrigger2).toHaveAttribute('aria-label', 'View The Pragmatic Programmer');
  });

  it('renders the book grid container', () => {
    render(<BookGrid books={mockBooks} />);
    expect(screen.getByTestId('book-grid')).toBeInTheDocument();
  });

  it('shows an empty state message when no books', () => {
    render(<BookGrid books={[]} />);
    expect(screen.getByText(/no books yet/i)).toBeInTheDocument();
  });

  it('shows the correct number of book cards', () => {
    render(<BookGrid books={mockBooks} />);
    const cards = screen.getAllByRole('article');
    expect(cards).toHaveLength(3);
  });
});
