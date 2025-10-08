-- =====================================================================
-- FIX 1: Update repayment_ledger_view to properly display all repayments
-- =====================================================================
DROP VIEW IF EXISTS repayment_ledger_view CASCADE;

CREATE OR REPLACE VIEW repayment_ledger_view AS
-- Scheduled payments (from repayment_schedule)
SELECT 
    rs.schedule_id,
    rs.loan_id,
    l.borrower_id,
    b.email,
    CONCAT(b.given_name, ' ', b.surname) AS borrower_name,
    b.mobile_number,
    b.department_company,
    b.file_number,
    b.position,
    b.postal_address,
    b.bank,
    b.account_name,
    b.account_number,
    CASE 
        WHEN l.loan_status = 'active' THEN 'Active'
        WHEN l.loan_status = 'settled' THEN 'Settled'
        WHEN l.loan_status = 'overdue' THEN 'Overdue'
        ELSE 'Unknown'
    END AS loan_status,
    rs.due_date AS entry_date,
    rs.payment_number,
    rs.payroll_type,
    rs.pay_period,
    'Scheduled Payment' AS description,
    l.disbursement_date,
    l.start_repayment_date,
    l.maturity_date,
    l.principal,
    l.interest,
    l.documentation_fee,
    l.loan_risk_insurance,
    l.gst_amount,
    l.gross_loan,
    l.fortnightly_installment,
    l.loan_term,
    l.interest_rate,
    l.total_repayment,
    l.outstanding_balance,
    l.repayment_completion_percentage,
    l.default_fees_accumulated,
    rs.repaymentrs AS debit,
    0 AS credit,
    CASE 
        WHEN rs.statusrs = 'pending' THEN 'Pending'
        WHEN rs.statusrs = 'paid' THEN 'Paid'
        WHEN rs.statusrs = 'partial' THEN 'Partial'
        WHEN rs.statusrs = 'default' THEN 'Default'
        ELSE 'Unknown'
    END AS status
FROM repayment_schedule rs
JOIN loans l ON rs.loan_id = l.loan_id
JOIN borrowers b ON l.borrower_id = b.borrower_id

UNION ALL

-- Actual repayments (from repayments table) - MATCHED TO CLOSEST SCHEDULE
SELECT 
    rs.schedule_id,
    r.loan_id,
    l.borrower_id,
    b.email,
    CONCAT(b.given_name, ' ', b.surname) AS borrower_name,
    b.mobile_number,
    b.department_company,
    b.file_number,
    b.position,
    b.postal_address,
    b.bank,
    b.account_name,
    b.account_number,
    CASE 
        WHEN l.loan_status = 'active' THEN 'Active'
        WHEN l.loan_status = 'settled' THEN 'Settled'
        WHEN l.loan_status = 'overdue' THEN 'Overdue'
        ELSE 'Unknown'
    END AS loan_status,
    r.payment_date AS entry_date,
    rs.payment_number,
    rs.payroll_type,
    rs.pay_period,
    'Repayment Received' AS description,
    l.disbursement_date,
    l.start_repayment_date,
    l.maturity_date,
    l.principal,
    l.interest,
    l.documentation_fee,
    l.loan_risk_insurance,
    l.gst_amount,
    l.gross_loan,
    l.fortnightly_installment,
    l.loan_term,
    l.interest_rate,
    l.total_repayment,
    l.outstanding_balance,
    l.repayment_completion_percentage,
    l.default_fees_accumulated,
    0 AS debit,
    r.amount AS credit,
    CASE 
        WHEN r.verification_status = 'approved' THEN 'Completed'
        WHEN r.verification_status = 'pending' THEN 'Pending'
        WHEN r.verification_status = 'rejected' THEN 'Rejected'
        ELSE 'Unknown'
    END AS status
FROM repayments r
JOIN loans l ON r.loan_id = l.loan_id
JOIN borrowers b ON l.borrower_id = b.borrower_id
-- Match repayment to the closest schedule by due_date
LEFT JOIN LATERAL (
    SELECT schedule_id, payment_number, payroll_type, pay_period
    FROM repayment_schedule
    WHERE loan_id = r.loan_id
    ORDER BY ABS(EXTRACT(EPOCH FROM (due_date::timestamp - r.payment_date::timestamp)))
    LIMIT 1
) rs ON true
WHERE r.verification_status = 'approved'

UNION ALL

-- Default fees (from defaults table)
SELECT 
    d.schedule_id,
    rs.loan_id,
    l.borrower_id,
    b.email,
    CONCAT(b.given_name, ' ', b.surname) AS borrower_name,
    b.mobile_number,
    b.department_company,
    b.file_number,
    b.position,
    b.postal_address,
    b.bank,
    b.account_name,
    b.account_number,
    CASE 
        WHEN l.loan_status = 'active' THEN 'Active'
        WHEN l.loan_status = 'settled' THEN 'Settled'
        WHEN l.loan_status = 'overdue' THEN 'Overdue'
        ELSE 'Unknown'
    END AS loan_status,
    d.date AS entry_date,
    rs.payment_number,
    rs.payroll_type,
    rs.pay_period,
    CONCAT('Default Fee - ', d.reason_code) AS description,
    l.disbursement_date,
    l.start_repayment_date,
    l.maturity_date,
    l.principal,
    l.interest,
    l.documentation_fee,
    l.loan_risk_insurance,
    l.gst_amount,
    l.gross_loan,
    l.fortnightly_installment,
    l.loan_term,
    l.interest_rate,
    l.total_repayment,
    l.outstanding_balance,
    l.repayment_completion_percentage,
    l.default_fees_accumulated,
    d.default_amount AS debit,
    0 AS credit,
    CASE 
        WHEN d.status = 'active' THEN 'Active'
        WHEN d.status = 'waived' THEN 'Waived'
        ELSE 'Unknown'
    END AS status
FROM defaults d
JOIN repayment_schedule rs ON d.schedule_id = rs.schedule_id
JOIN loans l ON rs.loan_id = l.loan_id
JOIN borrowers b ON l.borrower_id = b.borrower_id

ORDER BY loan_id, payment_number, entry_date;

-- =====================================================================
-- FIX 2: Update process_repayment to stop accruing defaults when fully paid
-- =====================================================================
DROP PROCEDURE IF EXISTS process_repayment(TEXT, DATE, NUMERIC) CASCADE;

CREATE OR REPLACE PROCEDURE process_repayment(
    p_loan_id       TEXT,
    p_payment_date  DATE,
    p_amount        NUMERIC
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_remaining                 numeric := ROUND(p_amount, 2);
    v_schedule                  RECORD;
    v_payment                   numeric;
    v_required                  numeric;
    v_alloc_principal           numeric;
    v_alloc_interest            numeric;
    v_alloc_doc_fee             numeric;
    v_alloc_risk                numeric;
    v_fee_pool                  numeric;
    v_required_interest         numeric;
    v_required_doc_fee          numeric;
    v_required_risk             numeric;
    v_total_fee_required        numeric;
    v_default_fee               numeric;
    v_total_alloc_principal     numeric := 0;
    v_total_alloc_interest      numeric := 0;
    v_total_alloc_doc_fee       numeric := 0;
    v_total_alloc_risk          numeric := 0;
    v_has_pending               boolean;
    v_has_partial               boolean;
    v_has_default               boolean;
    v_next_due_date             date;
    v_outstanding_balance       numeric;
    v_calculated_arrears        numeric;
    v_gross_loan                numeric;
    v_prev_running_balance      numeric;
    v_new_running_balance       numeric;
    v_default_fee_curr          numeric;
    v_default_fee_total_tx      numeric := 0;
    v_current_total_repayment   numeric;
BEGIN
    -- CRITICAL FIX: Check if loan is already fully paid
    SELECT gross_loan, total_repayment 
    INTO v_gross_loan, v_current_total_repayment
    FROM loans 
    WHERE loan_id = p_loan_id;
    
    -- If total repayments already >= gross loan, don't process any more defaults
    IF (v_current_total_repayment + p_amount) >= v_gross_loan THEN
        -- Still process the payment allocation but skip all default logic
        RAISE NOTICE 'Loan % is fully paid. Skipping default charges.', p_loan_id;
    END IF;

    /* ① NORMAL WINDOW (on or after due date) */
    FOR v_schedule IN
        SELECT *
        FROM   repayment_schedule
        WHERE  loan_id  = p_loan_id
          AND  statusrs = 'pending'::repayment_schedule_status_enum
          AND  due_date <= p_payment_date
        ORDER  BY due_date ASC
    LOOP
        EXIT WHEN v_remaining <= 0;

        v_required := ROUND(v_schedule.repaymentrs - COALESCE(v_schedule.repayment_received,0), 2);
        CONTINUE WHEN v_required <= 0;

        v_payment := ROUND(LEAST(v_remaining, v_required), 2);
        v_alloc_principal := ROUND(LEAST(v_payment, v_schedule.principalrs - COALESCE(v_schedule.received_principal,0)), 2);
        v_fee_pool := ROUND(v_payment - v_alloc_principal, 2);

        v_required_interest := ROUND(v_schedule.interestrs - COALESCE(v_schedule.received_interest,0), 2);
        v_required_doc_fee := ROUND(v_schedule.documentation_feers - COALESCE(v_schedule.received_documentation_fee,0), 2);
        v_required_risk := ROUND(v_schedule.loan_risk_insurancers - COALESCE(v_schedule.received_loan_risk_insurance,0), 2);
        v_total_fee_required := v_required_interest + v_required_doc_fee + v_required_risk;

        IF v_total_fee_required > 0 THEN
            v_alloc_interest := ROUND(LEAST(v_fee_pool*(v_required_interest/v_total_fee_required), v_required_interest), 2);
            v_alloc_doc_fee := ROUND(LEAST(v_fee_pool*(v_required_doc_fee/v_total_fee_required), v_required_doc_fee), 2);
            v_alloc_risk := ROUND(LEAST(v_fee_pool*(v_required_risk/v_total_fee_required), v_required_risk), 2);
        ELSE
            v_alloc_interest := 0;
            v_alloc_doc_fee := 0;
            v_alloc_risk := 0;
        END IF;

        UPDATE repayment_schedule
        SET  received_principal = COALESCE(received_principal,0) + v_alloc_principal,
             received_interest = COALESCE(received_interest,0) + v_alloc_interest,
             received_documentation_fee = COALESCE(received_documentation_fee,0) + v_alloc_doc_fee,
             received_loan_risk_insurance = COALESCE(received_loan_risk_insurance,0) + v_alloc_risk,
             repayment_received = COALESCE(repayment_received,0) + v_payment,
             balance = repaymentrs - (COALESCE(repayment_received,0) + v_payment),
             statusrs = CASE
                           WHEN balance = repaymentrs THEN 'default'::repayment_schedule_status_enum
                           WHEN balance > 0 THEN 'partial'::repayment_schedule_status_enum
                           ELSE 'paid'::repayment_schedule_status_enum
                        END,
             settled_date = p_payment_date
        WHERE schedule_id = v_schedule.schedule_id;

        v_total_alloc_principal := v_total_alloc_principal + v_alloc_principal;
        v_total_alloc_interest := v_total_alloc_interest + v_alloc_interest;
        v_total_alloc_doc_fee := v_total_alloc_doc_fee + v_alloc_doc_fee;
        v_total_alloc_risk := v_total_alloc_risk + v_alloc_risk;

        -- PARTIAL DEFAULT LOGIC: Only charge if loan won't be fully paid
        IF v_payment < v_required AND (v_current_total_repayment + p_amount) < v_gross_loan THEN
            IF COALESCE(v_schedule.default_charged,0) = 0 THEN
                v_default_fee := ROUND(0.4 * (v_required - v_payment), 2);
                v_default_fee_curr := v_default_fee;

                INSERT INTO defaults (default_amount, date, schedule_id, status, reason_code)
                VALUES (v_default_fee, p_payment_date, v_schedule.schedule_id,
                        'active'::default_status_enum, 'Partial payment shortfall');

                UPDATE loans
                SET  default_fees_accumulated = COALESCE(default_fees_accumulated,0) + v_default_fee,
                     partial_payments_count = COALESCE(partial_payments_count,0) + 1
                WHERE loan_id = p_loan_id;

                v_default_fee_total_tx := v_default_fee_total_tx + v_default_fee;
            ELSE
                v_default_fee_curr := 0;
            END IF;
        ELSE
            v_default_fee_curr := 0;
        END IF;

        IF v_schedule.payment_number = 1 THEN
            v_prev_running_balance := COALESCE(v_gross_loan, 0);
        ELSE
            SELECT running_balance INTO v_prev_running_balance
            FROM repayment_schedule
            WHERE loan_id = v_schedule.loan_id AND payment_number = v_schedule.payment_number - 1;
            v_prev_running_balance := COALESCE(v_prev_running_balance, COALESCE(v_gross_loan, 0));
        END IF;

        v_new_running_balance := ROUND(v_prev_running_balance - v_payment + v_default_fee_curr, 2);

        UPDATE repayment_schedule
        SET running_balance = v_new_running_balance,
            default_charged = COALESCE(default_charged, 0) + v_default_fee_curr
        WHERE schedule_id = v_schedule.schedule_id;

        v_remaining := v_remaining - v_payment;
    END LOOP;

    /* ② EARLY-PAYMENT WINDOW (future dates) */
    FOR v_schedule IN
        SELECT *
        FROM   repayment_schedule
        WHERE  loan_id  = p_loan_id
          AND  statusrs = 'pending'::repayment_schedule_status_enum
          AND  due_date > p_payment_date
        ORDER  BY due_date ASC
    LOOP
        EXIT WHEN v_remaining <= 0;

        v_required := ROUND(v_schedule.repaymentrs - COALESCE(v_schedule.repayment_received,0), 2);
        CONTINUE WHEN v_required <= 0;

        v_payment := ROUND(LEAST(v_remaining, v_required), 2);
        v_alloc_principal := ROUND(LEAST(v_payment, v_schedule.principalrs - COALESCE(v_schedule.received_principal,0)), 2);
        v_fee_pool := ROUND(v_payment - v_alloc_principal, 2);

        v_required_interest := ROUND(v_schedule.interestrs - COALESCE(v_schedule.received_interest,0), 2);
        v_required_doc_fee := ROUND(v_schedule.documentation_feers - COALESCE(v_schedule.received_documentation_fee,0), 2);
        v_required_risk := ROUND(v_schedule.loan_risk_insurancers - COALESCE(v_schedule.received_loan_risk_insurance,0), 2);
        v_total_fee_required := v_required_interest + v_required_doc_fee + v_required_risk;

        IF v_total_fee_required > 0 THEN
            v_alloc_interest := ROUND(LEAST(v_fee_pool*(v_required_interest/v_total_fee_required), v_required_interest), 2);
            v_alloc_doc_fee := ROUND(LEAST(v_fee_pool*(v_required_doc_fee/v_total_fee_required), v_required_doc_fee), 2);
            v_alloc_risk := ROUND(LEAST(v_fee_pool*(v_required_risk/v_total_fee_required), v_required_risk), 2);
        ELSE
            v_alloc_interest := 0;
            v_alloc_doc_fee := 0;
            v_alloc_risk := 0;
        END IF;

        UPDATE repayment_schedule
        SET  received_principal = COALESCE(received_principal,0) + v_alloc_principal,
             received_interest = COALESCE(received_interest,0) + v_alloc_interest,
             received_documentation_fee = COALESCE(received_documentation_fee,0) + v_alloc_doc_fee,
             received_loan_risk_insurance = COALESCE(received_loan_risk_insurance,0) + v_alloc_risk,
             repayment_received = COALESCE(repayment_received,0) + v_payment,
             balance = repaymentrs - (COALESCE(repayment_received,0) + v_payment),
             statusrs = CASE
                        WHEN balance = 0 AND (COALESCE(repayment_received, 0) > 0) THEN 'paid'::repayment_schedule_status_enum
                        WHEN balance = 0 AND (COALESCE(repayment_received, 0) = 0) THEN 'default'::repayment_schedule_status_enum
                        ELSE 'pending'::repayment_schedule_status_enum
                       END,
             settled_date = p_payment_date
        WHERE schedule_id = v_schedule.schedule_id;

        v_total_alloc_principal := v_total_alloc_principal + v_alloc_principal;
        v_total_alloc_interest := v_total_alloc_interest + v_alloc_interest;
        v_total_alloc_doc_fee := v_total_alloc_doc_fee + v_alloc_doc_fee;
        v_total_alloc_risk := v_total_alloc_risk + v_alloc_risk;

        IF v_schedule.payment_number = 1 THEN
            v_prev_running_balance := COALESCE(v_gross_loan, 0);
        ELSE
            SELECT running_balance INTO v_prev_running_balance
            FROM repayment_schedule
            WHERE loan_id = v_schedule.loan_id AND payment_number = v_schedule.payment_number - 1;
            v_prev_running_balance := COALESCE(v_prev_running_balance, COALESCE(v_gross_loan, 0));
        END IF;

        v_new_running_balance := ROUND(v_prev_running_balance - v_payment, 2);

        UPDATE repayment_schedule
        SET running_balance = v_new_running_balance,
            default_charged = 0
        WHERE schedule_id = v_schedule.schedule_id;

        v_remaining := v_remaining - v_payment;
    END LOOP;

    /* ③ MISSED-PAYMENT DEFAULT - Only for PAST due dates, only if not fully paid */
    IF (v_current_total_repayment + p_amount) < v_gross_loan THEN
        FOR v_schedule IN
            SELECT *
            FROM   repayment_schedule
            WHERE  loan_id  = p_loan_id
              AND  statusrs = 'pending'::repayment_schedule_status_enum
              AND  due_date < p_payment_date  -- Only past due dates
        LOOP
            -- Check if ANY payment was received on or after the due date
            IF NOT EXISTS (
                SELECT 1
                FROM   repayments
                WHERE  loan_id = p_loan_id
                  AND  payment_date >= v_schedule.due_date
                  AND  verification_status = 'approved'
                  AND  amount > 0)
            THEN
                -- Only charge if not already charged
                IF COALESCE(v_schedule.default_charged,0) = 0 THEN
                    v_default_fee := ROUND(0.4 * v_schedule.repaymentrs, 2);

                    INSERT INTO defaults (default_amount, date, schedule_id, status, reason_code)
                    VALUES (v_default_fee, p_payment_date, v_schedule.schedule_id,
                            'active'::default_status_enum, 'Missed scheduled repayment');

                    UPDATE repayment_schedule
                    SET  balance = repaymentrs,
                         statusrs = 'default'::repayment_schedule_status_enum,
                         settled_date = p_payment_date,
                         default_charged = v_default_fee
                    WHERE schedule_id = v_schedule.schedule_id;

                    IF v_schedule.payment_number = 1 THEN
                        v_prev_running_balance := COALESCE(v_gross_loan, 0);
                    ELSE
                        SELECT running_balance INTO v_prev_running_balance
                        FROM repayment_schedule
                        WHERE loan_id = v_schedule.loan_id AND payment_number = v_schedule.payment_number - 1;
                        v_prev_running_balance := COALESCE(v_prev_running_balance, COALESCE(v_gross_loan, 0));
                    END IF;

                    v_new_running_balance := ROUND(v_prev_running_balance + v_default_fee, 2);

                    UPDATE repayment_schedule
                    SET running_balance = v_new_running_balance
                    WHERE schedule_id = v_schedule.schedule_id;

                    UPDATE loans
                    SET  default_fees_accumulated = COALESCE(default_fees_accumulated,0) + v_default_fee,
                         missed_payments_count = COALESCE(missed_payments_count,0) + 1
                    WHERE loan_id = p_loan_id;

                    v_default_fee_total_tx := v_default_fee_total_tx + v_default_fee;
                END IF;
            END IF;
        END LOOP;
    END IF;

    /* ④ AUTHORITATIVE RECOMPUTE OF ALL running_balance */
    WITH params AS (
      SELECT gross_loan FROM loans WHERE loan_id = p_loan_id
    ),
    ordered AS (
      SELECT rs.schedule_id, rs.payment_number,
             SUM(COALESCE(rs.repayment_received,0)) OVER (ORDER BY rs.payment_number) AS cum_repay,
             SUM(COALESCE(rs.default_charged,0)) OVER (ORDER BY rs.payment_number) AS cum_default
      FROM repayment_schedule rs
      WHERE rs.loan_id = p_loan_id
      ORDER BY rs.payment_number
    ),
    calc AS (
      SELECT o.schedule_id, ROUND(p.gross_loan - o.cum_repay + o.cum_default, 2) AS rb
      FROM ordered o CROSS JOIN params p
    )
    UPDATE repayment_schedule rs SET running_balance = c.rb
    FROM calc c WHERE rs.schedule_id = c.schedule_id;

    /* ⑤ LOAN ROLL-UP & STATUS */
    SELECT outstanding_balance INTO v_outstanding_balance FROM loans WHERE loan_id = p_loan_id;
    SELECT COALESCE(SUM(balance),0) INTO v_calculated_arrears FROM repayment_schedule WHERE loan_id = p_loan_id;
    SELECT MIN(due_date) INTO v_next_due_date FROM repayment_schedule 
    WHERE loan_id = p_loan_id AND statusrs = 'pending'::repayment_schedule_status_enum;

    SELECT BOOL_OR(statusrs = 'pending'), BOOL_OR(statusrs = 'partial'), BOOL_OR(statusrs = 'default')
    INTO v_has_pending, v_has_partial, v_has_default
    FROM repayment_schedule WHERE loan_id = p_loan_id;

    UPDATE loans
    SET total_repayment = total_repayment + p_amount,
        outstanding_balance = v_outstanding_balance - p_amount + COALESCE(v_default_fee_total_tx,0),
        repayment_count = repayment_count + 1,
        last_payment_date = p_payment_date,
        repayment_completion_percentage = ((total_repayment + p_amount)/gross_loan)*100,
        principal_accumulated = COALESCE(principal_accumulated,0) + v_total_alloc_principal,
        interest_accumulated = COALESCE(interest_accumulated,0) + v_total_alloc_interest,
        documentation_fee_accumulated = COALESCE(documentation_fee_accumulated,0) + v_total_alloc_doc_fee,
        loan_risk_insurance_accumulated = COALESCE(loan_risk_insurance_accumulated,0) + v_total_alloc_risk,
        arrears = v_calculated_arrears,
        next_due_date = v_next_due_date,
        loan_repayment_status = CASE
                                   WHEN NOT v_has_pending AND NOT v_has_partial AND NOT v_has_default THEN 'paid'::repayment_status_enum
                                   WHEN v_has_default THEN 'default'::repayment_status_enum
                                   WHEN v_has_partial THEN 'partial'::repayment_status_enum
                                   ELSE 'on time'::repayment_status_enum
                                END,
        early_settlement = CASE WHEN outstanding_balance <= 1 AND p_payment_date < maturity_date THEN true ELSE false END,
        settled_date = CASE WHEN outstanding_balance <= 1 THEN p_payment_date ELSE settled_date END,
        loan_status = CASE
                         WHEN outstanding_balance < 1 THEN 'settled'::loan_status_enum
                         WHEN outstanding_balance >= 1 AND p_payment_date >= maturity_date THEN 'overdue'::loan_status_enum
                         ELSE 'active'::loan_status_enum
                      END
    WHERE loan_id = p_loan_id;
END;
$$;