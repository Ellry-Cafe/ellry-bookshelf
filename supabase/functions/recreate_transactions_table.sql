CREATE OR REPLACE FUNCTION recreate_transactions_table()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Drop existing table if it exists
    DROP TABLE IF EXISTS public.transactions;

    -- Create the transactions table with all required columns
    CREATE TABLE public.transactions (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        book_id UUID REFERENCES public.books(id),
        type VARCHAR(50) NOT NULL,
        quantity INTEGER NOT NULL,
        payment_method VARCHAR(50) NOT NULL,
        total DECIMAL(10,2) NOT NULL,
        coupon_id UUID REFERENCES public.coupons(id),
        discount_amount DECIMAL(10,2) DEFAULT 0.00,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
    );

    -- Enable RLS
    ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

    -- Create policies
    CREATE POLICY "Enable insert for authenticated users" 
    ON public.transactions 
    FOR INSERT 
    TO authenticated 
    WITH CHECK (true);

    CREATE POLICY "Enable read access for authenticated users" 
    ON public.transactions 
    FOR SELECT 
    TO authenticated 
    USING (true);

    CREATE POLICY "Enable update for authenticated users" 
    ON public.transactions 
    FOR UPDATE 
    TO authenticated 
    USING (true) 
    WITH CHECK (true);

    -- Notify to refresh schema cache
    NOTIFY pgrst, 'reload schema';
END;
$$; 