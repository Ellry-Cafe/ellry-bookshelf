-- First, get a book and borrower ID
WITH test_data AS (
    SELECT 
        (SELECT id FROM books WHERE available = true LIMIT 1) as book_id,
        (SELECT id FROM borrowers LIMIT 1) as borrower_id
)
INSERT INTO borrowed_books (
    book_id,
    borrower_id,
    date_borrowed,
    due_date
)
SELECT 
    book_id,
    borrower_id,
    CURRENT_TIMESTAMP::timestamp without time zone,
    (CURRENT_TIMESTAMP + INTERVAL '3 hours')::timestamp without time zone
FROM test_data
WHERE book_id IS NOT NULL AND borrower_id IS NOT NULL
RETURNING *;

-- Update the book's availability
UPDATE books 
SET available = false 
WHERE id IN (
    SELECT book_id 
    FROM borrowed_books 
    WHERE returned_at IS NULL
); 