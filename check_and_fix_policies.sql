-- Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'borrowed_books';

-- Drop existing policies if any
DROP POLICY IF EXISTS "Enable read access for all users" ON public.borrowed_books;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.borrowed_books;
DROP POLICY IF EXISTS "Enable update for all users" ON public.borrowed_books;
DROP POLICY IF EXISTS "Enable delete for all users" ON public.borrowed_books;

-- Enable RLS
ALTER TABLE public.borrowed_books ENABLE ROW LEVEL SECURITY;

-- Create new policies
CREATE POLICY "Enable read access for all users"
ON public.borrowed_books FOR SELECT
USING (true);

CREATE POLICY "Enable insert for all users"
ON public.borrowed_books FOR INSERT
WITH CHECK (true);

CREATE POLICY "Enable update for all users"
ON public.borrowed_books FOR UPDATE
USING (true)
WITH CHECK (true);

CREATE POLICY "Enable delete for all users"
ON public.borrowed_books FOR DELETE
USING (true); 