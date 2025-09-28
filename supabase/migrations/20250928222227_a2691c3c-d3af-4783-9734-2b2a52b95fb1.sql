-- Fix the get_dashboard_analytics function to use the correct view name
CREATE OR REPLACE FUNCTION public.get_dashboard_analytics(p_start_date date DEFAULT '2024-01-01'::date, p_end_date date DEFAULT CURRENT_DATE, p_period_type text DEFAULT 'monthly'::text)
 RETURNS TABLE(period_label text, principal_released numeric, total_collections numeric, total_due_amount numeric, total_outstanding numeric, doc_fees_collected numeric, risk_insurance_collected numeric, default_fees_collected numeric, loans_released_count bigint, active_loans_count bigint, repayments_collected_count bigint, settled_loans_count bigint, new_borrowers_count bigint, male_count bigint, female_count bigint, public_service_count bigint, statutory_body_count bigint, private_company_count bigint, defaults_count bigint, public_defaults bigint, statutory_defaults bigint, private_defaults bigint)
 LANGUAGE plpgsql
AS $function$
BEGIN
  CASE p_period_type
    WHEN 'daily' THEN
      RETURN QUERY
      SELECT 
        TO_CHAR(DATE(dav.year::text || '-' || LPAD(dav.month::text, 2, '0') || '-' || LPAD(dav.day::text, 2, '0')), 'DD Mon') as period_label,
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
      GROUP BY dav.year, dav.month, dav.day
      ORDER BY dav.year, dav.month, dav.day;
      
    WHEN 'weekly' THEN
      RETURN QUERY
      SELECT 
        'Week ' || dav.week::TEXT || ' ' || dav.year::TEXT as period_label,
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
      GROUP BY dav.year, dav.week
      ORDER BY dav.year, dav.week;
      
    WHEN 'monthly' THEN
      RETURN QUERY
      SELECT 
        TO_CHAR(DATE(dav.year::text || '-' || LPAD(dav.month::text, 2, '0') || '-01'), 'Mon YYYY') as period_label,
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
      GROUP BY dav.year, dav.month
      ORDER BY dav.year, dav.month;
      
    WHEN 'quarterly' THEN
      RETURN QUERY
      SELECT 
        'Q' || dav.quarter::TEXT || ' ' || dav.year::TEXT as period_label,
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
      GROUP BY dav.year, dav.quarter
      ORDER BY dav.year, dav.quarter;
      
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
      GROUP BY dav.year
      ORDER BY dav.year;
  END CASE;
END;
$function$