/*
  # Create Squad Tasks Tables

  1. New Tables
    - `squads`
      - `id` (uuid, primary key)
      - `name` (text, not null)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `tasks`
      - `id` (uuid, primary key)
      - `title` (text, not null)
      - `description` (text)
      - `status` (text, not null)
      - `priority` (text, not null)
      - `squad_id` (uuid, foreign key)
      - `assignee_id` (uuid, foreign key)
      - `due_date` (timestamptz)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `task_comments`
      - `id` (uuid, primary key)
      - `task_id` (uuid, foreign key)
      - `user_id` (uuid, foreign key)
      - `content` (text, not null)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create squads table
CREATE TABLE IF NOT EXISTS squads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'pending',
  priority text NOT NULL DEFAULT 'medium',
  squad_id uuid REFERENCES squads(id) ON DELETE CASCADE,
  assignee_id uuid REFERENCES login_operacional(id) ON DELETE SET NULL,
  due_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_status CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  CONSTRAINT valid_priority CHECK (priority IN ('low', 'medium', 'high', 'urgent'))
);

-- Create task comments table
CREATE TABLE IF NOT EXISTS task_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid REFERENCES tasks(id) ON DELETE CASCADE,
  user_id uuid REFERENCES login_operacional(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE squads ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_comments ENABLE ROW LEVEL SECURITY;

-- Create policies for squads
CREATE POLICY "Users can view all squads"
  ON squads
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can insert squads"
  ON squads
  FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM login_operacional
    WHERE id = auth.uid()
    AND funcao = 'admin'
  ));

CREATE POLICY "Only admins can update squads"
  ON squads
  FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM login_operacional
    WHERE id = auth.uid()
    AND funcao = 'admin'
  ));

-- Create policies for tasks
CREATE POLICY "Users can view tasks in their squad"
  ON tasks
  FOR SELECT
  TO authenticated
  USING (
    squad_id IN (
      SELECT id FROM squads
    )
  );

CREATE POLICY "Users can insert tasks"
  ON tasks
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update their assigned tasks"
  ON tasks
  FOR UPDATE
  TO authenticated
  USING (
    assignee_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM login_operacional
      WHERE id = auth.uid()
      AND funcao = 'admin'
    )
  );

-- Create policies for task comments
CREATE POLICY "Users can view all comments"
  ON task_comments
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert comments"
  ON task_comments
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update their own comments"
  ON task_comments
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_squads_updated_at
  BEFORE UPDATE ON squads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_task_comments_updated_at
  BEFORE UPDATE ON task_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();