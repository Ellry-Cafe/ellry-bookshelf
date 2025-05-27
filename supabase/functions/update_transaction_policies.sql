-- First, drop existing policies
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.transactions;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.transactions;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.transactions;

-- Create new policies that allow both authenticated and anonymous access
CREATE POLICY "Enable insert for all users" 
ON public.transactions 
FOR INSERT 
TO public
WITH CHECK (true);

CREATE POLICY "Enable read access for all users" 
ON public.transactions 
FOR SELECT 
TO public
USING (true);

CREATE POLICY "Enable update for all users" 
ON public.transactions 
FOR UPDATE 
TO public
USING (true) 
WITH CHECK (true);

-- Notify to refresh schema cache
NOTIFY pgrst, 'reload schema'; 