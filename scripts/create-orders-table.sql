-- Create orders table in Supabase
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tracking_id VARCHAR(10) UNIQUE NOT NULL,
  items JSONB NOT NULL,
  delivery_address TEXT NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'En préparation' CHECK (status IN ('En préparation', 'En cours de livraison', 'Livré', 'Annulé')),
  estimated_time VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on tracking_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_orders_tracking_id ON orders(tracking_id);

-- Create index on status for admin filtering
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- Create index on created_at for ordering
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_orders_updated_at 
    BEFORE UPDATE ON orders 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();


-- Insert some sample data for testing
INSERT INTO orders (tracking_id, items, delivery_address, total_price, status, estimated_time) VALUES
('ELB1001', '[{"id":"cappuccino-1","name":"Cappuccino Classique","quantity":2,"price":475,"category":"Cappuccinos"}]', '15 Rue Didouche Mourad, Alger', 950.00, 'En préparation', '20-30 min'),
('ELB1002', '[{"id":"crepe-2","name":"Nutella & Banane","quantity":1,"price":975,"category":"Crêpes"},{"id":"juice-1","name":"Jus d\'Orange Frais","quantity":1,"price":650,"category":"Jus Naturels"}]', '42 Boulevard Mohamed V, Alger', 1625.00, 'En cours de livraison', '15-25 min'),
('ELB1003', '[{"id":"sweet-1","name":"Sélection de Macarons","quantity":1,"price":1200,"category":"Douceurs"}]', '8 Rue Ben M\'hidi Larbi, Alger', 1200.00, 'Livré', '');
