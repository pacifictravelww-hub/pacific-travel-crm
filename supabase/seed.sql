-- Seed data for Pacific Travel CRM
-- Run AFTER schema.sql

INSERT INTO leads (id, name, email, phone, status, departure_date, return_date, hotel_level, board_basis, adults, children, infants, budget, vacation_type, destination, source, tags, notes, created_at, agent_id, seat_preference, kosher_meal)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'דוד כהן', 'david@example.com', '050-1234567', 'lead', '2024-07-15', '2024-07-25', '5', 'hb', 2, 1, 0, 20000, 'beach', 'יוון - סנטוריני', 'facebook', ARRAY['family'], 'מעוניין בחדר עם נוף לים', '2024-01-10T10:00:00Z', 'agent1', 'window', false),
  ('00000000-0000-0000-0000-000000000002', 'שרה לוי', 'sarah@example.com', '052-9876543', 'proposal_sent', '2024-08-01', '2024-08-14', '4', 'ai', 2, 0, 0, 25000, 'beach', 'מלדיביים', 'whatsapp', ARRAY['honeymoon', 'vip'], 'זוג טרי נשוי, יש להכין הפתעות', '2024-01-12T14:30:00Z', 'agent1', 'aisle', false),
  ('00000000-0000-0000-0000-000000000003', 'יוסף אברהם', 'yosef@example.com', '054-5551234', 'paid', '2024-06-20', '2024-06-30', '5', 'hb', 4, 2, 0, 50000, 'tours', 'איטליה - רומא ופירנצה', 'referral', ARRAY['family', 'kosher'], 'דורש מלון כשר מוסמך', '2024-01-08T09:00:00Z', 'agent1', NULL, true),
  ('00000000-0000-0000-0000-000000000004', 'מיכל גולדברג', 'michal@example.com', '053-7778889', 'flying', '2024-01-20', '2024-01-30', '4', 'bb', 2, 0, 0, 18000, 'city', 'ניו יורק', 'facebook', ARRAY['vip'], 'לקוחה קבועה, VIP', '2023-12-20T11:00:00Z', 'agent1', NULL, false),
  ('00000000-0000-0000-0000-000000000005', 'אבי רוזנברג', 'avi@example.com', '050-3334445', 'returned', '2024-01-05', '2024-01-15', '3', 'hb', 2, 3, 1, 30000, 'beach', 'תורכיה - אנטליה', 'whatsapp', ARRAY['family'], 'חזרו מהחופשה, ממליצים לחברים', '2023-12-01T08:00:00Z', 'agent1', NULL, false),
  ('00000000-0000-0000-0000-000000000006', 'רחל שמעון', 'rachel@example.com', '052-1112223', 'lead', '2024-09-10', '2024-09-20', '4', 'hb', 2, 2, 0, 22000, 'beach', 'ספרד - ברצלונה', 'facebook', ARRAY['family'], '', '2024-01-15T16:00:00Z', 'agent1', NULL, false);

-- Update payment info for some leads
UPDATE leads SET total_price = 28000, commission = 2800, deposit_amount = 5000, deposit_paid = true, balance_amount = 23000, balance_due_date = '2024-06-01' WHERE id = '00000000-0000-0000-0000-000000000002';
UPDATE leads SET total_price = 52000, commission = 5200, deposit_amount = 15000, deposit_paid = true, balance_amount = 37000, balance_due_date = '2024-05-01', hotel_preference = 'כשר בלבד' WHERE id = '00000000-0000-0000-0000-000000000003';
UPDATE leads SET total_price = 20000, commission = 2000, deposit_paid = true WHERE id = '00000000-0000-0000-0000-000000000004';
UPDATE leads SET total_price = 32000, commission = 3200, deposit_paid = true WHERE id = '00000000-0000-0000-0000-000000000005';

-- Documents
INSERT INTO documents (lead_id, type, name, expiry_date, url)
VALUES
  ('00000000-0000-0000-0000-000000000003', 'passport', 'דרכון - יוסף אברהם', '2028-05-15', '#'),
  ('00000000-0000-0000-0000-000000000003', 'ticket', 'כרטיס טיסה - TA2024-003', NULL, '#'),
  ('00000000-0000-0000-0000-000000000003', 'voucher', 'וואוצ''ר מלון רומא', NULL, '#');
