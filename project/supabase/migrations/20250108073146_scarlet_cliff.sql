/*
  # Create stocks table and security policies

  1. New Tables
    - `stocks`
      - `id` (uuid, primary key)
      - `symbol` (text, stock symbol)
      - `name` (text, company name)
      - `quantity` (integer, number of shares)
      - `purchase_price` (numeric, price per share at purchase)
      - `current_price` (numeric, current price per share)
      - `created_at` (timestamp with time zone)
      - `user_id` (uuid, references auth.users)

  2. Security
    - Enable RLS on `stocks` table
    - Add policies for authenticated users to:
      - Read their own stocks
      - Insert new stocks
      - Update their own stocks
      - Delete their own stocks
*/

CREATE TABLE stocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol text NOT NULL,
  name text NOT NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  purchase_price numeric NOT NULL CHECK (purchase_price >= 0),
  current_price numeric NOT NULL CHECK (current_price >= 0),
  created_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users NOT NULL
);

ALTER TABLE stocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own stocks"
  ON stocks
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own stocks"
  ON stocks
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own stocks"
  ON stocks
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own stocks"
  ON stocks
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);