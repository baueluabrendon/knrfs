-- Disable Row Level Security on storage.objects table
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- Drop existing storage policies
DROP POLICY IF EXISTS "Admins and staff can view files" ON storage.objects;
DROP POLICY IF EXISTS "Allow public access to documents bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow uploads to documents bucket" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload to application_documents" ON storage.objects;