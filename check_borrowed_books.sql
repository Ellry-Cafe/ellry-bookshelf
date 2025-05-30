-- Check borrowed_books records
SELECT 
    bb.id,
    bb.book_id,
    b.title as book_title,
    bb.borrower_id,
    br.full_name as borrower_name,
    bb.date_borrowed,
    bb.due_date,
    bb.returned_at
FROM borrowed_books bb
LEFT JOIN books b ON bb.book_id = b.id
LEFT JOIN borrowers br ON bb.borrower_id = br.id; 