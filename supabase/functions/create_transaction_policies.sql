-- Enable RLS on transactions table
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all authenticated users to insert transactions
CREATE POLICY "Enable insert for authenticated users" 
ON public.transactions 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Create policy to allow users to view their own transactions
CREATE POLICY "Enable read access for authenticated users" 
ON public.transactions 
FOR SELECT 
TO authenticated 
USING (true);

-- Create policy to allow updates on transactions
CREATE POLICY "Enable update for authenticated users" 
ON public.transactions 
FOR UPDATE 
TO authenticated 
USING (true) 
WITH CHECK (true); 