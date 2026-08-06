-- Business Analyse: erweiterte inquiry_type + Zahlungsstatus
-- CORSA: Analyse_System.md

ALTER TABLE business.inquiries DROP CONSTRAINT IF EXISTS inquiries_inquiry_type_check;
ALTER TABLE business.inquiries ADD CONSTRAINT inquiries_inquiry_type_check
  CHECK (inquiry_type IN ('quick', 'configure', 'project', 'analysis'));

ALTER TABLE business.inquiries DROP CONSTRAINT IF EXISTS inquiries_status_check;
ALTER TABLE business.inquiries ADD CONSTRAINT inquiries_status_check
  CHECK (status IN ('received', 'ingested', 'error', 'awaiting_payment', 'paid'));
