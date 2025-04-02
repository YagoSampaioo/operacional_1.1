/*
  # Create client notes table

  1. New Tables
    - `client_notes`
      - `id` (uuid, primary key)
      - `client_name` (text, not null)
      - `note` (text, not null)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `client_notes` table
    - Add policy for authenticated users to read and write notes
*/

CREATE TABLE IF NOT EXISTS client_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name text NOT NULL,
  note text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE client_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read all notes"
  ON client_notes
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert notes"
  ON client_notes
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update notes"
  ON client_notes
  FOR UPDATE
  TO authenticated
  USING (true);

-- Create trigger to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_client_notes_updated_at
  BEFORE UPDATE ON client_notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();