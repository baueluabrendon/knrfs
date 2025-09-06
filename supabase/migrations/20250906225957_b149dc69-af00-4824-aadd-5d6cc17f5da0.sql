-- Create branches table for managing company branches and offices
CREATE TABLE public.branches (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    branch_code VARCHAR(10) NOT NULL UNIQUE,
    branch_name VARCHAR(100) NOT NULL,
    branch_type VARCHAR(20) NOT NULL DEFAULT 'branch_office' CHECK (branch_type IN ('head_office', 'branch_office', 'service_center')),
    address_line1 VARCHAR(200),
    address_line2 VARCHAR(200),
    city VARCHAR(100),
    state_province VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'Papua New Guinea',
    phone_number VARCHAR(20),
    email VARCHAR(100),
    manager_name VARCHAR(100),
    manager_contact VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    opening_date DATE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;

-- Create policies for branch access
CREATE POLICY "Staff can view all branches" 
ON public.branches 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage branches" 
ON public.branches 
FOR ALL 
USING (EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('administrator', 'super user')
));

-- Create indexes for performance
CREATE INDEX idx_branches_branch_code ON public.branches(branch_code);
CREATE INDEX idx_branches_branch_type ON public.branches(branch_type);
CREATE INDEX idx_branches_is_active ON public.branches(is_active);

-- Create trigger for updated_at
CREATE TRIGGER update_branches_updated_at
    BEFORE UPDATE ON public.branches
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();