-- Create a function to handle quantity updates when a book is sold
CREATE OR REPLACE FUNCTION update_quantity_on_sold()
RETURNS TRIGGER AS $$
BEGIN
    -- If this is a sale (quantity is being decreased)
    IF NEW.quantity < OLD.quantity THEN
        -- Check if there's enough quantity for the sale
        IF NEW.quantity < 0 THEN
            RAISE EXCEPTION 'Cannot complete sale: Not enough copies available';
        END IF;
        
        -- Update sold status based on remaining quantity
        NEW.sold = (NEW.quantity = 0);
    END IF;
    
    -- If this is a restock (quantity is being increased)
    IF NEW.quantity > OLD.quantity THEN
        -- If we now have stock, ensure it's marked as available
        NEW.sold = (NEW.quantity = 0);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create or replace the trigger
DROP TRIGGER IF EXISTS update_quantity_on_sold_trigger ON books;
CREATE TRIGGER update_quantity_on_sold_trigger
    BEFORE UPDATE OF quantity ON books
    FOR EACH ROW
    EXECUTE FUNCTION update_quantity_on_sold();

-- Fix any inconsistencies in existing data
UPDATE books 
SET sold = (quantity = 0)
WHERE sold != (quantity = 0); 