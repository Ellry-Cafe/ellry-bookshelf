-- Get a random book ID
DO $$ 
DECLARE
    test_book_id UUID;
    test_borrower_id UUID;
BEGIN
    -- Get a random book
    SELECT id INTO test_book_id FROM public.books LIMIT 1;
    
    -- Get a random borrower
    SELECT id INTO test_borrower_id FROM public.borrowers LIMIT 1;

    -- If we have both a book and a borrower, create a test borrow record
    IF test_book_id IS NOT NULL AND test_borrower_id IS NOT NULL THEN
        INSERT INTO public.borrowed_books (
            book_id,
            borrower_id,
            date_borrowed,
            due_date
        ) VALUES (
            test_book_id,
            test_borrower_id,
            CURRENT_TIMESTAMP::timestamp without time zone,
            (CURRENT_TIMESTAMP + INTERVAL '3 hours')::timestamp without time zone
        );

        -- Update the book's availability
        UPDATE public.books
        SET available = false
        WHERE id = test_book_id;
    END IF;
END $$; 