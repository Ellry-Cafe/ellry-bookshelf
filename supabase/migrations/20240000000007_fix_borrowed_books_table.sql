-- Drop existing foreign key constraints if they exist
ALTER TABLE IF EXISTS public.borrowed_books
    DROP CONSTRAINT IF EXISTS borrowed_books_pkey,
    DROP CONSTRAINT IF EXISTS borrowed_books_book_id_fkey,
    DROP CONSTRAINT IF EXISTS borrowed_books_borrower_id_fkey;

-- Drop and recreate the table with the exact same structure
DROP TABLE IF EXISTS public.borrowed_books;

CREATE TABLE public.borrowed_books (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    book_id uuid NULL DEFAULT auth.uid(),
    borrower_id uuid NULL DEFAULT auth.uid(),
    date_borrowed timestamp without time zone NULL,
    due_date timestamp without time zone NOT NULL,
    returned_at timestamp without time zone NULL,
    CONSTRAINT borrowed_books_pkey PRIMARY KEY (id),
    CONSTRAINT borrowed_books_book_id_fkey FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
    CONSTRAINT borrowed_books_borrower_id_fkey FOREIGN KEY (borrower_id) REFERENCES borrowers(id) ON DELETE CASCADE
) TABLESPACE pg_default;

-- Enable RLS
ALTER TABLE public.borrowed_books ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Allow authenticated users to view borrowed books" ON public.borrowed_books;
DROP POLICY IF EXISTS "Allow staff to insert and update borrowed books" ON public.borrowed_books;
DROP POLICY IF EXISTS "Allow staff to update borrowed books" ON public.borrowed_books;
DROP POLICY IF EXISTS "Allow only admin to delete borrowed books" ON public.borrowed_books;

CREATE POLICY "Allow authenticated users to view borrowed books"
    ON public.borrowed_books
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Allow authenticated users to insert borrowed books"
    ON public.borrowed_books
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update borrowed books"
    ON public.borrowed_books
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete borrowed books"
    ON public.borrowed_books
    FOR DELETE
    TO authenticated
    USING (true); 