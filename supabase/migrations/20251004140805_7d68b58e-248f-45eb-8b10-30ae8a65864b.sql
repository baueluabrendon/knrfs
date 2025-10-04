-- Phase 1 & 2: Fix branch filtering and outstanding balance calculation (CORRECTED)

-- First, fix the dashboard_analytics_with_branches view to use accurate outstanding balance
DROP VIEW IF EXISTS dashboard_analytics_with_branches CASCADE;

CREATE OR REPLACE VIEW dashboard_analytics_with_branches AS
WITH period_dates AS (
  SELECT DISTINCT 
    l.disbursement_date::date as analysis_date,
    EXTRACT(YEAR FROM l.disbursement_date)::int as year,
    EXTRACT(MONTH FROM l.disbursement_date)::int as month,
    EXTRACT(DAY FROM l.disbursement_date)::int as day,
    EXTRACT(WEEK FROM l.disbursement_date)::int as week,
    EXTRACT(QUARTER FROM l.disbursement_date)::int as quarter,
    br.id as branch_id,
    br.branch_name,
    br.branch_code,
    b.client_type,
    CASE 
      WHEN b.client_type IN ('Public Service', 'Statutory Bodies') THEN 'public_servant'
      ELSE 'company'
    END as payroll_type
  FROM loans l
  JOIN borrowers b ON l.borrower_id = b.borrower_id
  LEFT JOIN branches br ON b.branch_id = br.id
  
  UNION
  
  SELECT DISTINCT 
    r.payment_date::date as analysis_date,
    EXTRACT(YEAR FROM r.payment_date)::int as year,
    EXTRACT(MONTH FROM r.payment_date)::int as month,
    EXTRACT(DAY FROM r.payment_date)::int as day,
    EXTRACT(WEEK FROM r.payment_date)::int as week,
    EXTRACT(QUARTER FROM r.payment_date)::int as quarter,
    br.id as branch_id,
    br.branch_name,
    br.branch_code,
    b.client_type,
    CASE 
      WHEN b.client_type IN ('Public Service', 'Statutory Bodies') THEN 'public_servant'
      ELSE 'company'
    END as payroll_type
  FROM repayments r
  JOIN loans l ON r.loan_id = l.loan_id
  JOIN borrowers b ON l.borrower_id = b.borrower_id
  LEFT JOIN branches br ON b.branch_id = br.id
  WHERE r.verification_status = 'approved'
)
SELECT 
  p.analysis_date,
  p.year,
  p.month,
  p.day,
  p.week,
  p.quarter,
  p.branch_id,
  p.branch_name,
  p.branch_code,
  p.client_type,
  p.payroll_type,
  
  -- Loans released metrics
  COALESCE(COUNT(DISTINCT CASE WHEN l.disbursement_date = p.analysis_date THEN l.loan_id END), 0) as loans_released_count,
  COALESCE(SUM(CASE WHEN l.disbursement_date = p.analysis_date THEN l.principal ELSE 0 END), 0) as principal_released,
  COALESCE(SUM(CASE WHEN l.disbursement_date = p.analysis_date THEN l.gross_loan ELSE 0 END), 0) as total_loan_amount,
  
  -- Repayment collections
  COALESCE(SUM(CASE WHEN r.payment_date = p.analysis_date AND r.verification_status = 'approved' THEN r.amount ELSE 0 END), 0) as total_collections,
  COALESCE(COUNT(DISTINCT CASE WHEN r.payment_date = p.analysis_date AND r.verification_status = 'approved' THEN r.repayment_id END), 0) as repayments_collected_count,
  
  -- Due amounts for the analysis date
  COALESCE(SUM(CASE WHEN rs.due_date = p.analysis_date THEN rs.repaymentrs ELSE 0 END), 0) as total_due_amount,
  COALESCE(COUNT(DISTINCT CASE WHEN rs.due_date = p.analysis_date THEN rs.schedule_id END), 0) as repayments_due_count,
  COALESCE(SUM(CASE WHEN rs.due_date = p.analysis_date THEN rs.principalrs ELSE 0 END), 0) as principal_due,
  COALESCE(SUM(CASE WHEN rs.due_date = p.analysis_date THEN rs.interestrs ELSE 0 END), 0) as interest_due,
  COALESCE(SUM(CASE WHEN rs.due_date = p.analysis_date THEN rs.documentation_feers ELSE 0 END), 0) as doc_fees_due,
  COALESCE(SUM(CASE WHEN rs.due_date = p.analysis_date THEN rs.loan_risk_insurancers ELSE 0 END), 0) as risk_insurance_due,
  COALESCE(SUM(CASE WHEN rs.due_date = p.analysis_date THEN rs.gst_amountrs ELSE 0 END), 0) as gst_due,
  
  -- Schedule status counts
  COALESCE(COUNT(DISTINCT CASE WHEN rs.due_date <= p.analysis_date AND rs.statusrs = 'pending' THEN rs.schedule_id END), 0) as pending_schedules,
  COALESCE(COUNT(DISTINCT CASE WHEN rs.settled_date = p.analysis_date AND rs.statusrs = 'paid' THEN rs.schedule_id END), 0) as paid_schedules,
  COALESCE(COUNT(DISTINCT CASE WHEN rs.settled_date = p.analysis_date AND rs.statusrs = 'partial' THEN rs.schedule_id END), 0) as partial_schedules,
  COALESCE(COUNT(DISTINCT CASE WHEN rs.settled_date = p.analysis_date AND rs.statusrs = 'default' THEN rs.schedule_id END), 0) as defaulted_schedules,
  
  -- Fee collections breakdown
  COALESCE(SUM(CASE WHEN rs.settled_date = p.analysis_date THEN rs.received_documentation_fee ELSE 0 END), 0) as doc_fees_collected,
  COALESCE(SUM(CASE WHEN rs.settled_date = p.analysis_date THEN rs.received_loan_risk_insurance ELSE 0 END), 0) as risk_insurance_collected,
  COALESCE(SUM(CASE WHEN rs.settled_date = p.analysis_date THEN rs.received_gst_amount ELSE 0 END), 0) as gst_collected,
  COALESCE(SUM(CASE WHEN rs.settled_date = p.analysis_date THEN rs.default_charged ELSE 0 END), 0) as default_fees_collected,
  
  -- Loan status counts (as of analysis date)
  COALESCE(COUNT(DISTINCT CASE 
    WHEN l.disbursement_date <= p.analysis_date 
    AND l.loan_status = 'active'
    AND (l.settled_date IS NULL OR l.settled_date > p.analysis_date)
    THEN l.loan_id 
  END), 0) as active_loans_count,
  
  COALESCE(COUNT(DISTINCT CASE 
    WHEN l.settled_date = p.analysis_date 
    THEN l.loan_id 
  END), 0) as settled_loans_count,
  
  COALESCE(COUNT(DISTINCT CASE 
    WHEN l.disbursement_date <= p.analysis_date 
    AND l.loan_status = 'overdue'
    AND (l.settled_date IS NULL OR l.settled_date > p.analysis_date)
    THEN l.loan_id 
  END), 0) as overdue_loans_count,
  
  -- PHASE 2 FIX: Accurate outstanding balance from loans table
  COALESCE(
    (SELECT SUM(loans_snap.outstanding_balance)
     FROM loans loans_snap
     JOIN borrowers b_snap ON loans_snap.borrower_id = b_snap.borrower_id
     WHERE loans_snap.disbursement_date <= p.analysis_date
       AND loans_snap.loan_status IN ('active', 'overdue')
       AND (loans_snap.settled_date IS NULL OR loans_snap.settled_date > p.analysis_date)
       AND (p.branch_id IS NULL OR b_snap.branch_id = p.branch_id)
       AND (p.client_type IS NULL OR b_snap.client_type = p.client_type)
    ), 0
  ) as total_outstanding,
  
  -- Arrears and at-risk metrics
  COALESCE(SUM(CASE 
    WHEN l.disbursement_date <= p.analysis_date 
    AND (l.settled_date IS NULL OR l.settled_date > p.analysis_date)
    THEN l.arrears 
    ELSE 0 
  END), 0) as total_arrears,
  
  COALESCE(COUNT(DISTINCT CASE 
    WHEN l.disbursement_date <= p.analysis_date 
    AND l.loan_repayment_status IN ('partial', 'default')
    AND (l.settled_date IS NULL OR l.settled_date > p.analysis_date)
    THEN l.loan_id 
  END), 0) as at_risk_loans_count,
  
  -- Payment behavior metrics
  COALESCE(SUM(CASE 
    WHEN l.disbursement_date <= p.analysis_date 
    AND (l.settled_date IS NULL OR l.settled_date > p.analysis_date)
    THEN l.missed_payments_count 
    ELSE 0 
  END), 0) as total_missed_payments,
  
  COALESCE(SUM(CASE 
    WHEN l.disbursement_date <= p.analysis_date 
    AND (l.settled_date IS NULL OR l.settled_date > p.analysis_date)
    THEN l.partial_payments_count 
    ELSE 0 
  END), 0) as total_partial_payments,
  
  COALESCE(SUM(CASE 
    WHEN l.disbursement_date <= p.analysis_date 
    AND (l.settled_date IS NULL OR l.settled_date > p.analysis_date)
    THEN l.default_fees_accumulated 
    ELSE 0 
  END), 0) as total_default_fees,
  
  -- Default metrics by company type
  COALESCE(COUNT(DISTINCT CASE 
    WHEN d.date = p.analysis_date 
    THEN d.arrear_id 
  END), 0) as defaults_count,
  
  COALESCE(SUM(CASE WHEN d.date = p.analysis_date THEN d.default_amount ELSE 0 END), 0) as total_default_amount,
  
  COALESCE(COUNT(DISTINCT CASE 
    WHEN d.date = p.analysis_date AND b.client_type = 'Public Service'
    THEN d.arrear_id 
  END), 0) as public_defaults,
  
  COALESCE(COUNT(DISTINCT CASE 
    WHEN d.date = p.analysis_date AND b.client_type = 'Statutory Bodies'
    THEN d.arrear_id 
  END), 0) as statutory_defaults,
  
  COALESCE(COUNT(DISTINCT CASE 
    WHEN d.date = p.analysis_date AND b.client_type = 'Private Companies'
    THEN d.arrear_id 
  END), 0) as private_defaults,
  
  COALESCE(SUM(CASE 
    WHEN d.date = p.analysis_date AND b.client_type = 'Public Service'
    THEN d.default_amount ELSE 0 
  END), 0) as public_default_amount,
  
  COALESCE(SUM(CASE 
    WHEN d.date = p.analysis_date AND b.client_type = 'Statutory Bodies'
    THEN d.default_amount ELSE 0 
  END), 0) as statutory_default_amount,
  
  COALESCE(SUM(CASE 
    WHEN d.date = p.analysis_date AND b.client_type = 'Private Companies'
    THEN d.default_amount ELSE 0 
  END), 0) as private_default_amount,
  
  -- Pending collections
  COALESCE(SUM(CASE 
    WHEN rs.due_date <= p.analysis_date AND rs.statusrs = 'pending'
    THEN rs.balance 
    ELSE 0 
  END), 0) as pending_collections,
  
  -- Borrower demographics (new borrowers on analysis date)
  COALESCE(COUNT(DISTINCT CASE WHEN b.date_of_birth IS NOT NULL AND l.disbursement_date = p.analysis_date THEN b.borrower_id END), 0)::int as new_borrowers_count,
  COALESCE(COUNT(DISTINCT CASE WHEN b.gender = 'Male' AND l.disbursement_date = p.analysis_date THEN b.borrower_id END), 0)::int as new_male_borrowers,
  COALESCE(COUNT(DISTINCT CASE WHEN b.gender = 'Female' AND l.disbursement_date = p.analysis_date THEN b.borrower_id END), 0)::int as new_female_borrowers,
  COALESCE(COUNT(DISTINCT CASE WHEN b.client_type = 'Public Service' AND l.disbursement_date = p.analysis_date THEN b.borrower_id END), 0)::int as new_public_service,
  COALESCE(COUNT(DISTINCT CASE WHEN b.client_type = 'Statutory Bodies' AND l.disbursement_date = p.analysis_date THEN b.borrower_id END), 0)::int as new_statutory_body,
  COALESCE(COUNT(DISTINCT CASE WHEN b.client_type = 'Private Companies' AND l.disbursement_date = p.analysis_date THEN b.borrower_id END), 0)::int as new_private_company,
  
  -- Total borrower counts (cumulative up to analysis date)
  COALESCE(COUNT(DISTINCT CASE WHEN b.gender = 'Male' AND l.disbursement_date <= p.analysis_date THEN b.borrower_id END), 0) as male_count,
  COALESCE(COUNT(DISTINCT CASE WHEN b.gender = 'Female' AND l.disbursement_date <= p.analysis_date THEN b.borrower_id END), 0) as female_count,
  COALESCE(COUNT(DISTINCT CASE WHEN b.client_type = 'Public Service' AND l.disbursement_date <= p.analysis_date THEN b.borrower_id END), 0) as public_service_count,
  COALESCE(COUNT(DISTINCT CASE WHEN b.client_type = 'Statutory Bodies' AND l.disbursement_date <= p.analysis_date THEN b.borrower_id END), 0) as statutory_body_count,
  COALESCE(COUNT(DISTINCT CASE WHEN b.client_type = 'Private Companies' AND l.disbursement_date <= p.analysis_date THEN b.borrower_id END), 0) as private_company_count,
  
  -- Collection efficiency
  CASE 
    WHEN SUM(CASE WHEN rs.due_date = p.analysis_date THEN rs.repaymentrs ELSE 0 END) > 0
    THEN ROUND(
      (SUM(CASE WHEN r.payment_date = p.analysis_date AND r.verification_status = 'approved' THEN r.amount ELSE 0 END) / 
       SUM(CASE WHEN rs.due_date = p.analysis_date THEN rs.repaymentrs ELSE 0 END)) * 100, 
      2
    )
    ELSE 0 
  END as collection_efficiency_percentage,
  
  -- Completion percentage
  CASE 
    WHEN COUNT(DISTINCT CASE WHEN l.disbursement_date <= p.analysis_date THEN l.loan_id END) > 0
    THEN ROUND(
      AVG(CASE 
        WHEN l.disbursement_date <= p.analysis_date 
        AND (l.settled_date IS NULL OR l.settled_date > p.analysis_date)
        THEN l.repayment_completion_percentage 
      END), 
      2
    )
    ELSE 0 
  END as avg_completion_percentage,
  
  -- Application metrics
  COALESCE(COUNT(DISTINCT CASE WHEN a.uploaded_at::date = p.analysis_date THEN a.application_id END), 0) as total_applications,
  COALESCE(COUNT(DISTINCT CASE WHEN a.uploaded_at::date = p.analysis_date AND a.status = 'pending' THEN a.application_id END), 0) as pending_applications_count,
  COALESCE(COUNT(DISTINCT CASE WHEN a.uploaded_at::date = p.analysis_date AND a.status = 'approved' THEN a.application_id END), 0) as approved_applications_count,
  COALESCE(COUNT(DISTINCT CASE WHEN a.uploaded_at::date = p.analysis_date AND a.status = 'declined' THEN a.application_id END), 0) as declined_applications_count,
  
  -- Average loan duration (FIX: date subtraction returns integer, not interval)
  COALESCE(
    AVG(CASE 
      WHEN l.settled_date = p.analysis_date 
      THEN (l.settled_date - l.disbursement_date)
    END)::int, 
    0
  ) as avg_loan_duration_days

FROM period_dates p
LEFT JOIN loans l ON l.disbursement_date <= p.analysis_date
LEFT JOIN borrowers b ON l.borrower_id = b.borrower_id AND (p.branch_id IS NULL OR b.branch_id = p.branch_id) AND (p.client_type IS NULL OR b.client_type = p.client_type)
LEFT JOIN repayments r ON r.loan_id = l.loan_id AND r.payment_date <= p.analysis_date
LEFT JOIN repayment_schedule rs ON rs.loan_id = l.loan_id
LEFT JOIN defaults d ON d.schedule_id = rs.schedule_id
LEFT JOIN applications a ON TRUE

GROUP BY 
  p.analysis_date, 
  p.year, 
  p.month, 
  p.day, 
  p.week, 
  p.quarter,
  p.branch_id,
  p.branch_name,
  p.branch_code,
  p.client_type,
  p.payroll_type

ORDER BY p.analysis_date DESC;

-- Now update the get_dashboard_analytics function with branch filtering (Phase 1)
CREATE OR REPLACE FUNCTION public.get_dashboard_analytics(
  p_start_date date DEFAULT '2024-01-01'::date,
  p_end_date date DEFAULT CURRENT_DATE,
  p_period_type text DEFAULT 'monthly'::text,
  p_branch_id uuid DEFAULT NULL
)
RETURNS TABLE(
  period_label text,
  principal_released numeric,
  total_collections numeric,
  total_due_amount numeric,
  total_outstanding numeric,
  doc_fees_collected numeric,
  risk_insurance_collected numeric,
  default_fees_collected numeric,
  loans_released_count bigint,
  active_loans_count bigint,
  repayments_collected_count bigint,
  settled_loans_count bigint,
  new_borrowers_count bigint,
  male_count bigint,
  female_count bigint,
  public_service_count bigint,
  statutory_body_count bigint,
  private_company_count bigint,
  defaults_count bigint,
  public_defaults bigint,
  statutory_defaults bigint,
  private_defaults bigint
)
LANGUAGE plpgsql
AS $function$
BEGIN
  CASE p_period_type
    WHEN 'daily' THEN
      RETURN QUERY
      SELECT 
        TO_CHAR(DATE(dav.year::text || '-' || LPAD(dav.month::text, 2, '0') || '-' || LPAD(dav.day::text, 2, '0')), 'YYYY-MM-DD') as period_label,
        COALESCE(SUM(dav.principal_released), 0)::NUMERIC,
        COALESCE(SUM(dav.total_collections), 0)::NUMERIC,
        COALESCE(SUM(dav.total_due_amount), 0)::NUMERIC,
        COALESCE(SUM(dav.total_outstanding), 0)::NUMERIC,
        COALESCE(SUM(dav.doc_fees_collected), 0)::NUMERIC,
        COALESCE(SUM(dav.risk_insurance_collected), 0)::NUMERIC,
        COALESCE(SUM(dav.default_fees_collected), 0)::NUMERIC,
        COALESCE(SUM(dav.loans_released_count), 0)::BIGINT,
        COALESCE(SUM(dav.active_loans_count), 0)::BIGINT,
        COALESCE(SUM(dav.repayments_collected_count), 0)::BIGINT,
        COALESCE(SUM(dav.settled_loans_count), 0)::BIGINT,
        COALESCE(SUM(dav.new_borrowers_count), 0)::BIGINT,
        COALESCE(SUM(dav.male_count), 0)::BIGINT,
        COALESCE(SUM(dav.female_count), 0)::BIGINT,
        COALESCE(SUM(dav.public_service_count), 0)::BIGINT,
        COALESCE(SUM(dav.statutory_body_count), 0)::BIGINT,
        COALESCE(SUM(dav.private_company_count), 0)::BIGINT,
        COALESCE(SUM(dav.defaults_count), 0)::BIGINT,
        COALESCE(SUM(dav.public_defaults), 0)::BIGINT,
        COALESCE(SUM(dav.statutory_defaults), 0)::BIGINT,
        COALESCE(SUM(dav.private_defaults), 0)::BIGINT
      FROM dashboard_analytics_with_branches dav
      WHERE dav.analysis_date::date BETWEEN p_start_date AND p_end_date
        AND (p_branch_id IS NULL OR dav.branch_id = p_branch_id)
      GROUP BY dav.year, dav.month, dav.day
      ORDER BY dav.year, dav.month, dav.day;
      
    WHEN 'weekly' THEN
      RETURN QUERY
      SELECT 
        LPAD(dav.week::TEXT, 2, '0') || '-' || dav.year::TEXT as period_label,
        COALESCE(SUM(dav.principal_released), 0)::NUMERIC,
        COALESCE(SUM(dav.total_collections), 0)::NUMERIC,
        COALESCE(SUM(dav.total_due_amount), 0)::NUMERIC,
        COALESCE(SUM(dav.total_outstanding), 0)::NUMERIC,
        COALESCE(SUM(dav.doc_fees_collected), 0)::NUMERIC,
        COALESCE(SUM(dav.risk_insurance_collected), 0)::NUMERIC,
        COALESCE(SUM(dav.default_fees_collected), 0)::NUMERIC,
        COALESCE(SUM(dav.loans_released_count), 0)::BIGINT,
        COALESCE(SUM(dav.active_loans_count), 0)::BIGINT,
        COALESCE(SUM(dav.repayments_collected_count), 0)::BIGINT,
        COALESCE(SUM(dav.settled_loans_count), 0)::BIGINT,
        COALESCE(SUM(dav.new_borrowers_count), 0)::BIGINT,
        COALESCE(SUM(dav.male_count), 0)::BIGINT,
        COALESCE(SUM(dav.female_count), 0)::BIGINT,
        COALESCE(SUM(dav.public_service_count), 0)::BIGINT,
        COALESCE(SUM(dav.statutory_body_count), 0)::BIGINT,
        COALESCE(SUM(dav.private_company_count), 0)::BIGINT,
        COALESCE(SUM(dav.defaults_count), 0)::BIGINT,
        COALESCE(SUM(dav.public_defaults), 0)::BIGINT,
        COALESCE(SUM(dav.statutory_defaults), 0)::BIGINT,
        COALESCE(SUM(dav.private_defaults), 0)::BIGINT
      FROM dashboard_analytics_with_branches dav
      WHERE dav.analysis_date::date BETWEEN p_start_date AND p_end_date
        AND (p_branch_id IS NULL OR dav.branch_id = p_branch_id)
      GROUP BY dav.year, dav.week
      ORDER BY dav.year, dav.week;
      
    WHEN 'monthly' THEN
      RETURN QUERY
      SELECT 
        LPAD(dav.month::TEXT, 2, '0') || '-' || dav.year::TEXT as period_label,
        COALESCE(SUM(dav.principal_released), 0)::NUMERIC,
        COALESCE(SUM(dav.total_collections), 0)::NUMERIC,
        COALESCE(SUM(dav.total_due_amount), 0)::NUMERIC,
        COALESCE(SUM(dav.total_outstanding), 0)::NUMERIC,
        COALESCE(SUM(dav.doc_fees_collected), 0)::NUMERIC,
        COALESCE(SUM(dav.risk_insurance_collected), 0)::NUMERIC,
        COALESCE(SUM(dav.default_fees_collected), 0)::NUMERIC,
        COALESCE(SUM(dav.loans_released_count), 0)::BIGINT,
        COALESCE(SUM(dav.active_loans_count), 0)::BIGINT,
        COALESCE(SUM(dav.repayments_collected_count), 0)::BIGINT,
        COALESCE(SUM(dav.settled_loans_count), 0)::BIGINT,
        COALESCE(SUM(dav.new_borrowers_count), 0)::BIGINT,
        COALESCE(SUM(dav.male_count), 0)::BIGINT,
        COALESCE(SUM(dav.female_count), 0)::BIGINT,
        COALESCE(SUM(dav.public_service_count), 0)::BIGINT,
        COALESCE(SUM(dav.statutory_body_count), 0)::BIGINT,
        COALESCE(SUM(dav.private_company_count), 0)::BIGINT,
        COALESCE(SUM(dav.defaults_count), 0)::BIGINT,
        COALESCE(SUM(dav.public_defaults), 0)::BIGINT,
        COALESCE(SUM(dav.statutory_defaults), 0)::BIGINT,
        COALESCE(SUM(dav.private_defaults), 0)::BIGINT
      FROM dashboard_analytics_with_branches dav
      WHERE dav.analysis_date::date BETWEEN p_start_date AND p_end_date
        AND (p_branch_id IS NULL OR dav.branch_id = p_branch_id)
      GROUP BY dav.year, dav.month
      ORDER BY dav.year, dav.month;
      
    WHEN 'quarterly' THEN
      RETURN QUERY
      SELECT 
        'Q' || dav.quarter::TEXT || '-' || dav.year::TEXT as period_label,
        COALESCE(SUM(dav.principal_released), 0)::NUMERIC,
        COALESCE(SUM(dav.total_collections), 0)::NUMERIC,
        COALESCE(SUM(dav.total_due_amount), 0)::NUMERIC,
        COALESCE(SUM(dav.total_outstanding), 0)::NUMERIC,
        COALESCE(SUM(dav.doc_fees_collected), 0)::NUMERIC,
        COALESCE(SUM(dav.risk_insurance_collected), 0)::NUMERIC,
        COALESCE(SUM(dav.default_fees_collected), 0)::NUMERIC,
        COALESCE(SUM(dav.loans_released_count), 0)::BIGINT,
        COALESCE(SUM(dav.active_loans_count), 0)::BIGINT,
        COALESCE(SUM(dav.repayments_collected_count), 0)::BIGINT,
        COALESCE(SUM(dav.settled_loans_count), 0)::BIGINT,
        COALESCE(SUM(dav.new_borrowers_count), 0)::BIGINT,
        COALESCE(SUM(dav.male_count), 0)::BIGINT,
        COALESCE(SUM(dav.female_count), 0)::BIGINT,
        COALESCE(SUM(dav.public_service_count), 0)::BIGINT,
        COALESCE(SUM(dav.statutory_body_count), 0)::BIGINT,
        COALESCE(SUM(dav.private_company_count), 0)::BIGINT,
        COALESCE(SUM(dav.defaults_count), 0)::BIGINT,
        COALESCE(SUM(dav.public_defaults), 0)::BIGINT,
        COALESCE(SUM(dav.statutory_defaults), 0)::BIGINT,
        COALESCE(SUM(dav.private_defaults), 0)::BIGINT
      FROM dashboard_analytics_with_branches dav
      WHERE dav.analysis_date::date BETWEEN p_start_date AND p_end_date
        AND (p_branch_id IS NULL OR dav.branch_id = p_branch_id)
      GROUP BY dav.year, dav.quarter
      ORDER BY dav.year, dav.quarter;
      
    WHEN 'half-yearly' THEN
      RETURN QUERY
      SELECT 
        'H' || CASE WHEN dav.quarter <= 2 THEN '1' ELSE '2' END || '-' || dav.year::TEXT as period_label,
        COALESCE(SUM(dav.principal_released), 0)::NUMERIC,
        COALESCE(SUM(dav.total_collections), 0)::NUMERIC,
        COALESCE(SUM(dav.total_due_amount), 0)::NUMERIC,
        COALESCE(SUM(dav.total_outstanding), 0)::NUMERIC,
        COALESCE(SUM(dav.doc_fees_collected), 0)::NUMERIC,
        COALESCE(SUM(dav.risk_insurance_collected), 0)::NUMERIC,
        COALESCE(SUM(dav.default_fees_collected), 0)::NUMERIC,
        COALESCE(SUM(dav.loans_released_count), 0)::BIGINT,
        COALESCE(SUM(dav.active_loans_count), 0)::BIGINT,
        COALESCE(SUM(dav.repayments_collected_count), 0)::BIGINT,
        COALESCE(SUM(dav.settled_loans_count), 0)::BIGINT,
        COALESCE(SUM(dav.new_borrowers_count), 0)::BIGINT,
        COALESCE(SUM(dav.male_count), 0)::BIGINT,
        COALESCE(SUM(dav.female_count), 0)::BIGINT,
        COALESCE(SUM(dav.public_service_count), 0)::BIGINT,
        COALESCE(SUM(dav.statutory_body_count), 0)::BIGINT,
        COALESCE(SUM(dav.private_company_count), 0)::BIGINT,
        COALESCE(SUM(dav.defaults_count), 0)::BIGINT,
        COALESCE(SUM(dav.public_defaults), 0)::BIGINT,
        COALESCE(SUM(dav.statutory_defaults), 0)::BIGINT,
        COALESCE(SUM(dav.private_defaults), 0)::BIGINT
      FROM dashboard_analytics_with_branches dav
      WHERE dav.analysis_date::date BETWEEN p_start_date AND p_end_date
        AND (p_branch_id IS NULL OR dav.branch_id = p_branch_id)
      GROUP BY dav.year, CASE WHEN dav.quarter <= 2 THEN 1 ELSE 2 END
      ORDER BY dav.year, CASE WHEN dav.quarter <= 2 THEN 1 ELSE 2 END;
      
    WHEN 'yearly' THEN
      RETURN QUERY
      SELECT 
        dav.year::TEXT as period_label,
        COALESCE(SUM(dav.principal_released), 0)::NUMERIC,
        COALESCE(SUM(dav.total_collections), 0)::NUMERIC,
        COALESCE(SUM(dav.total_due_amount), 0)::NUMERIC,
        COALESCE(SUM(dav.total_outstanding), 0)::NUMERIC,
        COALESCE(SUM(dav.doc_fees_collected), 0)::NUMERIC,
        COALESCE(SUM(dav.risk_insurance_collected), 0)::NUMERIC,
        COALESCE(SUM(dav.default_fees_collected), 0)::NUMERIC,
        COALESCE(SUM(dav.loans_released_count), 0)::BIGINT,
        COALESCE(SUM(dav.active_loans_count), 0)::BIGINT,
        COALESCE(SUM(dav.repayments_collected_count), 0)::BIGINT,
        COALESCE(SUM(dav.settled_loans_count), 0)::BIGINT,
        COALESCE(SUM(dav.new_borrowers_count), 0)::BIGINT,
        COALESCE(SUM(dav.male_count), 0)::BIGINT,
        COALESCE(SUM(dav.female_count), 0)::BIGINT,
        COALESCE(SUM(dav.public_service_count), 0)::BIGINT,
        COALESCE(SUM(dav.statutory_body_count), 0)::BIGINT,
        COALESCE(SUM(dav.private_company_count), 0)::BIGINT,
        COALESCE(SUM(dav.defaults_count), 0)::BIGINT,
        COALESCE(SUM(dav.public_defaults), 0)::BIGINT,
        COALESCE(SUM(dav.statutory_defaults), 0)::BIGINT,
        COALESCE(SUM(dav.private_defaults), 0)::BIGINT
      FROM dashboard_analytics_with_branches dav
      WHERE dav.analysis_date::date BETWEEN p_start_date AND p_end_date
        AND (p_branch_id IS NULL OR dav.branch_id = p_branch_id)
      GROUP BY dav.year
      ORDER BY dav.year;
  END CASE;
END;
$function$;