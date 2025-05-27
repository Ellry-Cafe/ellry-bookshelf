CREATE OR REPLACE FUNCTION refresh_schema_cache()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Refresh the schema cache for the transactions table
    NOTIFY pgrst, 'reload schema';
END;
$$; 