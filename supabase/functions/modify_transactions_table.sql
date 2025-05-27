CREATE OR REPLACE FUNCTION modify_transactions_table()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Add coupon_id column if it doesn't exist
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'transactions' 
        AND column_name = 'coupon_id'
    ) THEN
        ALTER TABLE public.transactions 
        ADD COLUMN coupon_id UUID REFERENCES public.coupons(id),
        ADD COLUMN discount_amount DECIMAL(10,2) DEFAULT 0.00;
    END IF;
END;
$$; 