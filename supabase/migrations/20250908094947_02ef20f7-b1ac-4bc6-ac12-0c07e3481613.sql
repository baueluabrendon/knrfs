-- Fix the get_dashboard_analytics function GROUP BY issues
DROP FUNCTION IF EXISTS public.get_dashboard_analytics(date, date, text);

CREATE OR REPLACE FUNCTION public.get_dashboard_analytics(
  p_start_date date DEFAULT '2024-01-01',
  p_end_date date DEFAULT CURRENT_DATE,
  p_period_type text DEFAULT 'monthly'
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
        TO_CHAR(dav.analysis_date, 'DD Mon') as period_label,
        SUM(dav.principal_released)::NUMERIC,
        SUM(dav.total_collections)::NUMERIC,
        SUM(dav.total_due_amount)::NUMERIC,
        SUM(dav.total_outstanding)::NUMERIC,
        SUM(dav.doc_fees_collected)::NUMERIC,
        SUM(dav.risk_insurance_collected)::NUMERIC,
        SUM(dav.default_fees_collected)::NUMERIC,
        SUM(dav.loans_released_count)::BIGINT,
        SUM(dav.active_loans_count)::BIGINT,
        SUM(dav.repayments_collected_count)::BIGINT,
        SUM(dav.settled_loans_count)::BIGINT,
        SUM(dav.new_borrowers_count)::BIGINT,
        SUM(dav.male_count)::BIGINT,
        SUM(dav.female_count)::BIGINT,
        SUM(dav.public_service_count)::BIGINT,
        SUM(dav.statutory_body_count)::BIGINT,
        SUM(dav.private_company_count)::BIGINT,
        SUM(dav.defaults_count)::BIGINT,
        SUM(dav.public_defaults)::BIGINT,
        SUM(dav.statutory_defaults)::BIGINT,
        SUM(dav.private_defaults)::BIGINT
      FROM dashboard_analytics_view dav
      WHERE dav.analysis_date BETWEEN p_start_date AND p_end_date
      GROUP BY dav.analysis_date
      ORDER BY dav.analysis_date;
      
    WHEN 'weekly' THEN
      RETURN QUERY
      SELECT 
        'Week ' || EXTRACT(week FROM dav.analysis_date)::TEXT as period_label,
        SUM(dav.principal_released)::NUMERIC,
        SUM(dav.total_collections)::NUMERIC,
        SUM(dav.total_due_amount)::NUMERIC,
        SUM(dav.total_outstanding)::NUMERIC,
        SUM(dav.doc_fees_collected)::NUMERIC,
        SUM(dav.risk_insurance_collected)::NUMERIC,
        SUM(dav.default_fees_collected)::NUMERIC,
        SUM(dav.loans_released_count)::BIGINT,
        SUM(dav.active_loans_count)::BIGINT,
        SUM(dav.repayments_collected_count)::BIGINT,
        SUM(dav.settled_loans_count)::BIGINT,
        SUM(dav.new_borrowers_count)::BIGINT,
        SUM(dav.male_count)::BIGINT,
        SUM(dav.female_count)::BIGINT,
        SUM(dav.public_service_count)::BIGINT,
        SUM(dav.statutory_body_count)::BIGINT,
        SUM(dav.private_company_count)::BIGINT,
        SUM(dav.defaults_count)::BIGINT,
        SUM(dav.public_defaults)::BIGINT,
        SUM(dav.statutory_defaults)::BIGINT,
        SUM(dav.private_defaults)::BIGINT
      FROM dashboard_analytics_view dav
      WHERE dav.analysis_date BETWEEN p_start_date AND p_end_date
      GROUP BY EXTRACT(year FROM dav.analysis_date), EXTRACT(week FROM dav.analysis_date)
      ORDER BY EXTRACT(year FROM dav.analysis_date), EXTRACT(week FROM dav.analysis_date);
      
    WHEN 'monthly' THEN
      RETURN QUERY
      SELECT 
        TO_CHAR(DATE_TRUNC('month', dav.analysis_date), 'Mon YYYY') as period_label,
        SUM(dav.principal_released)::NUMERIC,
        SUM(dav.total_collections)::NUMERIC,
        SUM(dav.total_due_amount)::NUMERIC,
        SUM(dav.total_outstanding)::NUMERIC,
        SUM(dav.doc_fees_collected)::NUMERIC,
        SUM(dav.risk_insurance_collected)::NUMERIC,
        SUM(dav.default_fees_collected)::NUMERIC,
        SUM(dav.loans_released_count)::BIGINT,
        SUM(dav.active_loans_count)::BIGINT,
        SUM(dav.repayments_collected_count)::BIGINT,
        SUM(dav.settled_loans_count)::BIGINT,
        SUM(dav.new_borrowers_count)::BIGINT,
        SUM(dav.male_count)::BIGINT,
        SUM(dav.female_count)::BIGINT,
        SUM(dav.public_service_count)::BIGINT,
        SUM(dav.statutory_body_count)::BIGINT,
        SUM(dav.private_company_count)::BIGINT,
        SUM(dav.defaults_count)::BIGINT,
        SUM(dav.public_defaults)::BIGINT,
        SUM(dav.statutory_defaults)::BIGINT,
        SUM(dav.private_defaults)::BIGINT
      FROM dashboard_analytics_view dav
      WHERE dav.analysis_date BETWEEN p_start_date AND p_end_date
      GROUP BY EXTRACT(year FROM dav.analysis_date), EXTRACT(month FROM dav.analysis_date)
      ORDER BY EXTRACT(year FROM dav.analysis_date), EXTRACT(month FROM dav.analysis_date);
      
    WHEN 'quarterly' THEN
      RETURN QUERY
      SELECT 
        'Q' || EXTRACT(quarter FROM dav.analysis_date)::TEXT || ' ' || EXTRACT(year FROM dav.analysis_date)::TEXT as period_label,
        SUM(dav.principal_released)::NUMERIC,
        SUM(dav.total_collections)::NUMERIC,
        SUM(dav.total_due_amount)::NUMERIC,
        SUM(dav.total_outstanding)::NUMERIC,
        SUM(dav.doc_fees_collected)::NUMERIC,
        SUM(dav.risk_insurance_collected)::NUMERIC,
        SUM(dav.default_fees_collected)::NUMERIC,
        SUM(dav.loans_released_count)::BIGINT,
        SUM(dav.active_loans_count)::BIGINT,
        SUM(dav.repayments_collected_count)::BIGINT,
        SUM(dav.settled_loans_count)::BIGINT,
        SUM(dav.new_borrowers_count)::BIGINT,
        SUM(dav.male_count)::BIGINT,
        SUM(dav.female_count)::BIGINT,
        SUM(dav.public_service_count)::BIGINT,
        SUM(dav.statutory_body_count)::BIGINT,
        SUM(dav.private_company_count)::BIGINT,
        SUM(dav.defaults_count)::BIGINT,
        SUM(dav.public_defaults)::BIGINT,
        SUM(dav.statutory_defaults)::BIGINT,
        SUM(dav.private_defaults)::BIGINT
      FROM dashboard_analytics_view dav
      WHERE dav.analysis_date BETWEEN p_start_date AND p_end_date
      GROUP BY EXTRACT(year FROM dav.analysis_date), EXTRACT(quarter FROM dav.analysis_date)
      ORDER BY EXTRACT(year FROM dav.analysis_date), EXTRACT(quarter FROM dav.analysis_date);
      
    WHEN 'yearly' THEN
      RETURN QUERY
      SELECT 
        EXTRACT(year FROM dav.analysis_date)::TEXT as period_label,
        SUM(dav.principal_released)::NUMERIC,
        SUM(dav.total_collections)::NUMERIC,
        SUM(dav.total_due_amount)::NUMERIC,
        SUM(dav.total_outstanding)::NUMERIC,
        SUM(dav.doc_fees_collected)::NUMERIC,
        SUM(dav.risk_insurance_collected)::NUMERIC,
        SUM(dav.default_fees_collected)::NUMERIC,
        SUM(dav.loans_released_count)::BIGINT,
        SUM(dav.active_loans_count)::BIGINT,
        SUM(dav.repayments_collected_count)::BIGINT,
        SUM(dav.settled_loans_count)::BIGINT,
        SUM(dav.new_borrowers_count)::BIGINT,
        SUM(dav.male_count)::BIGINT,
        SUM(dav.female_count)::BIGINT,
        SUM(dav.public_service_count)::BIGINT,
        SUM(dav.statutory_body_count)::BIGINT,
        SUM(dav.private_company_count)::BIGINT,
        SUM(dav.defaults_count)::BIGINT,
        SUM(dav.public_defaults)::BIGINT,
        SUM(dav.statutory_defaults)::BIGINT,
        SUM(dav.private_defaults)::BIGINT
      FROM dashboard_analytics_view dav
      WHERE dav.analysis_date BETWEEN p_start_date AND p_end_date
      GROUP BY EXTRACT(year FROM dav.analysis_date)
      ORDER BY EXTRACT(year FROM dav.analysis_date);
  END CASE;
END;
$function$;