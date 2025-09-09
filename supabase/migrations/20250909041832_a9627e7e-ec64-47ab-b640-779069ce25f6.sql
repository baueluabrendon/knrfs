-- Create payroll officers table
CREATE TABLE public.payroll_officers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_name TEXT NOT NULL,
  officer_name TEXT NOT NULL,
  title TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN DEFAULT true
);

-- Enable RLS
ALTER TABLE public.payroll_officers ENABLE ROW LEVEL SECURITY;

-- Create policies for payroll officers
CREATE POLICY "Staff can view all payroll officers" 
ON public.payroll_officers 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM user_profiles up 
  WHERE up.user_id = auth.uid() 
  AND up.role IN ('administrator', 'super user', 'recoveries officer', 'accounts officer')
));

CREATE POLICY "Staff can manage payroll officers" 
ON public.payroll_officers 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_profiles up 
  WHERE up.user_id = auth.uid() 
  AND up.role IN ('administrator', 'super user', 'recoveries officer')
));

-- Create deduction requests table to track email communications
CREATE TABLE public.deduction_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  payroll_officer_id UUID NOT NULL REFERENCES public.payroll_officers(id),
  organization_name TEXT NOT NULL,
  request_date DATE NOT NULL DEFAULT CURRENT_DATE,
  pay_period TEXT,
  total_clients INTEGER NOT NULL DEFAULT 0,
  total_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'acknowledged', 'completed')),
  email_sent_at TIMESTAMP WITH TIME ZONE,
  email_sent_by UUID REFERENCES auth.users(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for deduction requests
ALTER TABLE public.deduction_requests ENABLE ROW LEVEL SECURITY;

-- Create policies for deduction requests
CREATE POLICY "Staff can view all deduction requests" 
ON public.deduction_requests 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM user_profiles up 
  WHERE up.user_id = auth.uid() 
  AND up.role IN ('administrator', 'super user', 'recoveries officer', 'accounts officer')
));

CREATE POLICY "Staff can manage deduction requests" 
ON public.deduction_requests 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_profiles up 
  WHERE up.user_id = auth.uid() 
  AND up.role IN ('administrator', 'super user', 'recoveries officer')
));

-- Create junction table for clients included in deduction requests
CREATE TABLE public.deduction_request_clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  deduction_request_id UUID NOT NULL REFERENCES public.deduction_requests(id) ON DELETE CASCADE,
  loan_id TEXT NOT NULL,
  borrower_name TEXT NOT NULL,
  file_number TEXT,
  loan_amount NUMERIC(10,2),
  interest_amount NUMERIC(10,2),
  gross_amount NUMERIC(10,2),
  default_amount NUMERIC(10,2),
  current_outstanding NUMERIC(10,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for deduction request clients
ALTER TABLE public.deduction_request_clients ENABLE ROW LEVEL SECURITY;

-- Create policies for deduction request clients
CREATE POLICY "Staff can view deduction request clients" 
ON public.deduction_request_clients 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM user_profiles up 
  WHERE up.user_id = auth.uid() 
  AND up.role IN ('administrator', 'super user', 'recoveries officer', 'accounts officer')
));

CREATE POLICY "Staff can manage deduction request clients" 
ON public.deduction_request_clients 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_profiles up 
  WHERE up.user_id = auth.uid() 
  AND up.role IN ('administrator', 'super user', 'recoveries officer')
));