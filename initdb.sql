-- Insert initial data into the user table if the table exists

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user') THEN
        INSERT INTO public."user" (email, password, role, "isActive", "isBlocked", balance)
        VALUES
            ('admin@example.com', '$2b$05$a6pGdngS7BN8gLNCODhRE.3Bne5ak6jn6dt1//8bV1S42mqCOernq', 'admin', TRUE, FALSE, 100.00),
            ('inactive-client@example.com', '$2b$05$4z0/oOR33OyPun/hCjuZC.iAC6lcdr5.yWc3EmY0YDrZ6Nc/huaWW', 'client', FALSE, FALSE, 100.00),
            ('active-client@example.com', '$2b$05$4z0/oOR33OyPun/hCjuZC.iAC6lcdr5.yWc3EmY0YDrZ6Nc/huaWW', 'client', TRUE, FALSE, 100.00);
    END IF;
END $$;
