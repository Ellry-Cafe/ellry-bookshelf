-- Drop the trigger first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop the function
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Drop the policies on borrowed_books
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.borrowed_books;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.borrowed_books;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.borrowed_books;
DROP POLICY IF EXISTS "Enable delete for admin users" ON public.borrowed_books;

-- Drop the profiles table and its policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP TABLE IF EXISTS public.profiles;

-- Restore original borrowed_books policies
CREATE POLICY "Allow authenticated users to view borrowed books"
    ON public.borrowed_books
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Allow staff to insert and update borrowed books"
    ON public.borrowed_books
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Allow staff to update borrowed books"
    ON public.borrowed_books
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow only admin to delete borrowed books"
    ON public.borrowed_books
    FOR DELETE
    TO authenticated
    USING (true); 