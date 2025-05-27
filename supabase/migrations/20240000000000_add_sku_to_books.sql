-- Add SKU column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'books' 
        AND column_name = 'sku'
    ) THEN
        -- Add the SKU column
        ALTER TABLE public.books
        ADD COLUMN sku VARCHAR(50) UNIQUE;
    END IF;
END $$;

-- Generate new SKUs for ALL books
WITH updated_books AS (
    SELECT 
        id,
        CONCAT(
            UPPER(SUBSTRING(COALESCE(genre, 'GEN'), 1, 3)),
            UPPER(SUBSTRING(REGEXP_REPLACE(COALESCE(author, 'AUT'), '[^a-zA-Z]', '', 'g'), 1, 3)),
            LPAD(FLOOR(RANDOM() * 100)::TEXT, 2, '0')
        ) as new_sku
    FROM public.books
)
UPDATE public.books
SET sku = updated_books.new_sku
FROM updated_books
WHERE books.id = updated_books.id;

-- Make SKU required for future entries if not already required
DO $$ 
BEGIN
    ALTER TABLE public.books
    ALTER COLUMN sku SET NOT NULL;
EXCEPTION
    WHEN others THEN
        NULL; -- Column might already be NOT NULL
END $$; 