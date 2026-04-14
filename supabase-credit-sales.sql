-- Credit Sales Tracking Schema
-- This table tracks orders that are sold on credit, allowing the seller to monitor outstanding balances and payment history

CREATE TABLE IF NOT EXISTS credit_sales (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  total_amount NUMERIC(10, 2) NOT NULL,
  amount_paid NUMERIC(10, 2) DEFAULT 0 NOT NULL,
  balance NUMERIC(10, 2) NOT NULL,
  due_date DATE,
  status TEXT DEFAULT 'pending' NOT NULL, -- pending, partial, paid, overdue, cancelled
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payment history for credit sales
CREATE TABLE IF NOT EXISTS credit_payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  credit_sale_id UUID NOT NULL REFERENCES credit_sales(id) ON DELETE CASCADE,
  amount NUMERIC(10, 2) NOT NULL,
  payment_method TEXT DEFAULT 'mpesa', -- mpesa, cash, bank_transfer
  payment_reference TEXT, -- M-Pesa transaction code or reference
  recorded_by TEXT, -- Admin who recorded the payment
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_credit_sales_order ON credit_sales(order_id);
CREATE INDEX IF NOT EXISTS idx_credit_sales_phone ON credit_sales(customer_phone);
CREATE INDEX IF NOT EXISTS idx_credit_sales_status ON credit_sales(status);
CREATE INDEX IF NOT EXISTS idx_credit_sales_balance ON credit_sales(balance);
CREATE INDEX IF NOT EXISTS idx_credit_payments_credit_sale ON credit_payments(credit_sale_id);

-- Row Level Security (RLS)
ALTER TABLE credit_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_payments ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read credit sales
CREATE POLICY "Anyone can view credit sales" ON credit_sales
  FOR SELECT USING (true);

-- Allow authenticated users to insert credit sales
CREATE POLICY "Anyone can create credit sales" ON credit_sales
  FOR INSERT WITH CHECK (true);

-- Allow authenticated users to update credit sales
CREATE POLICY "Anyone can update credit sales" ON credit_sales
  FOR UPDATE USING (true);

-- Allow authenticated users to delete credit sales
CREATE POLICY "Anyone can delete credit sales" ON credit_sales
  FOR DELETE USING (true);

-- Payment policies
CREATE POLICY "Anyone can view credit payments" ON credit_payments
  FOR SELECT USING (true);

CREATE POLICY "Anyone can create credit payments" ON credit_payments
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update credit payments" ON credit_payments
  FOR UPDATE USING (true);

CREATE POLICY "Anyone can delete credit payments" ON credit_payments
  FOR DELETE USING (true);

-- Function to automatically update balance and status
CREATE OR REPLACE FUNCTION update_credit_sale_balance()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate total paid for this credit sale
  UPDATE credit_sales
  SET 
    amount_paid = (
      SELECT COALESCE(SUM(amount), 0) 
      FROM credit_payments 
      WHERE credit_sale_id = NEW.credit_sale_id
    ),
    updated_at = NOW()
  WHERE id = NEW.credit_sale_id;
  
  -- Update balance and status
  UPDATE credit_sales
  SET 
    balance = total_amount - amount_paid,
    status = CASE
      WHEN amount_paid = 0 THEN 'pending'
      WHEN amount_paid >= total_amount THEN 'paid'
      ELSE 'partial'
    END
  WHERE id = NEW.credit_sale_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update balance after payment insert
DROP TRIGGER IF EXISTS trg_update_credit_balance ON credit_payments;
CREATE TRIGGER trg_update_credit_balance
  AFTER INSERT ON credit_payments
  FOR EACH ROW
  EXECUTE FUNCTION update_credit_sale_balance();
