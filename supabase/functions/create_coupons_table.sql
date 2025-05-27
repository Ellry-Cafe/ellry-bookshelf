CREATE OR REPLACE FUNCTION create_coupons_table()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Check if the table exists
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'coupons') THEN
        -- Create the coupons table
        CREATE TABLE public.coupons (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            code VARCHAR(50) NOT NULL UNIQUE,
            discount_percentage DECIMAL(5,2) NOT NULL CHECK (discount_percentage > 0 AND discount_percentage <= 100),
            expiry_date DATE NOT NULL,
            is_active BOOLEAN DEFAULT true,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
        );

        -- Create the trigger for updating the updated_at column
        CREATE TRIGGER update_coupons_updated_at
            BEFORE UPDATE ON public.coupons
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END;
$$; 