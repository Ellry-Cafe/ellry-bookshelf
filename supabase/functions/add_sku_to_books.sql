CREATE OR REPLACE FUNCTION add_sku_to_books()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Add SKU column if it doesn't exist
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'books' 
        AND column_name = 'sku'
    ) THEN
        -- Add the SKU column
        ALTER TABLE public.books
        ADD COLUMN sku VARCHAR(50) UNIQUE;

        -- Generate SKUs for existing books
        -- Format: First 3 letters of genre + First 3 letters of author + Random 4 digits
        WITH updated_books AS (
            SELECT 
                id,
                CONCAT(
                    UPPER(SUBSTRING(COALESCE(genre, 'GEN'), 1, 3)),
                    UPPER(SUBSTRING(COALESCE(author, 'AUT'), 1, 3)),
                    LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0')
                ) as new_sku
            FROM public.books
        )
        UPDATE public.books
        SET sku = updated_books.new_sku
        FROM updated_books
        WHERE books.id = updated_books.id;

        -- Make SKU required for future entries
        ALTER TABLE public.books
        ALTER COLUMN sku SET NOT NULL;
    END IF;
END;
$$; 