DO $$
DECLARE
mercado_nordestao_id BIGINT;
    mercado_assai_id BIGINT;
    cat_laticinios_id BIGINT;
    cat_graos_id BIGINT;
    cat_hortifruti_id BIGINT;
    cat_limpeza_id BIGINT;
    leite_id BIGINT;
    arroz_id BIGINT;
    banana_id BIGINT;
    detergente_id BIGINT;
    compra_1_id BIGINT;
    compra_2_id BIGINT;
BEGIN
    -- Mercados
SELECT id INTO mercado_nordestao_id FROM markets WHERE name = 'Nordestão' LIMIT 1;

IF mercado_nordestao_id IS NULL THEN
        INSERT INTO markets (name, address)
        VALUES ('Nordestão', 'Natal/RN')
        RETURNING id INTO mercado_nordestao_id;
END IF;

SELECT id INTO mercado_assai_id FROM markets WHERE name = 'Assaí Atacadista' LIMIT 1;

IF mercado_assai_id IS NULL THEN
        INSERT INTO markets (name, address)
        VALUES ('Assaí Atacadista', 'Natal/RN')
        RETURNING id INTO mercado_assai_id;
END IF;

    -- Categorias
INSERT INTO categories (name) VALUES ('Laticínios') ON CONFLICT (name) DO NOTHING;
INSERT INTO categories (name) VALUES ('Grãos') ON CONFLICT (name) DO NOTHING;
INSERT INTO categories (name) VALUES ('Hortifruti') ON CONFLICT (name) DO NOTHING;
INSERT INTO categories (name) VALUES ('Limpeza') ON CONFLICT (name) DO NOTHING;

SELECT id INTO cat_laticinios_id FROM categories WHERE name = 'Laticínios' LIMIT 1;
SELECT id INTO cat_graos_id FROM categories WHERE name = 'Grãos' LIMIT 1;
SELECT id INTO cat_hortifruti_id FROM categories WHERE name = 'Hortifruti' LIMIT 1;
SELECT id INTO cat_limpeza_id FROM categories WHERE name = 'Limpeza' LIMIT 1;

-- Produtos
SELECT id INTO leite_id FROM products WHERE barcode = '789000000001' LIMIT 1;

IF leite_id IS NULL THEN
        INSERT INTO products (name, brand, barcode, category_id)
        VALUES ('Leite Integral 1L', 'Italac', '789000000001', cat_laticinios_id)
        RETURNING id INTO leite_id;
END IF;

SELECT id INTO arroz_id FROM products WHERE barcode = '789000000002' LIMIT 1;

IF arroz_id IS NULL THEN
        INSERT INTO products (name, brand, barcode, category_id)
        VALUES ('Arroz Branco 1kg', 'Tio João', '789000000002', cat_graos_id)
        RETURNING id INTO arroz_id;
END IF;

SELECT id INTO banana_id FROM products WHERE barcode = '789000000003' LIMIT 1;

IF banana_id IS NULL THEN
        INSERT INTO products (name, brand, barcode, category_id)
        VALUES ('Banana Prata 1kg', 'Hortifruti', '789000000003', cat_hortifruti_id)
        RETURNING id INTO banana_id;
END IF;

SELECT id INTO detergente_id FROM products WHERE barcode = '789000000004' LIMIT 1;

IF detergente_id IS NULL THEN
        INSERT INTO products (name, brand, barcode, category_id)
        VALUES ('Detergente Neutro 500ml', 'Ypê', '789000000004', cat_limpeza_id)
        RETURNING id INTO detergente_id;
END IF;

    -- Compra 1: Nordestão
    IF NOT EXISTS (
        SELECT 1 FROM purchases
        WHERE market_id = mercado_nordestao_id
        AND purchase_date = CURRENT_DATE
        AND total_amount = 25.47
    ) THEN
        INSERT INTO purchases (market_id, purchase_date, total_amount)
        VALUES (mercado_nordestao_id, CURRENT_DATE, 25.47)
        RETURNING id INTO compra_1_id;

INSERT INTO purchase_items (purchase_id, product_id, quantity, unit_price, total_price)
VALUES
    (compra_1_id, leite_id, 2, 6.49, 12.98),
    (compra_1_id, arroz_id, 1, 7.99, 7.99),
    (compra_1_id, banana_id, 1, 4.50, 4.50);
END IF;

    -- Compra 2: Assaí
    IF NOT EXISTS (
        SELECT 1 FROM purchases
        WHERE market_id = mercado_assai_id
        AND purchase_date = CURRENT_DATE - INTERVAL '2 days'
        AND total_amount = 20.97
    ) THEN
        INSERT INTO purchases (market_id, purchase_date, total_amount)
        VALUES (mercado_assai_id, CURRENT_DATE - INTERVAL '2 days', 20.97)
        RETURNING id INTO compra_2_id;

INSERT INTO purchase_items (purchase_id, product_id, quantity, unit_price, total_price)
VALUES
    (compra_2_id, leite_id, 1, 6.19, 6.19),
    (compra_2_id, arroz_id, 1, 7.49, 7.49),
    (compra_2_id, detergente_id, 1, 7.29, 7.29);
END IF;

    -- Despensa
    IF NOT EXISTS (
        SELECT 1 FROM pantry_items
        WHERE product_id = leite_id
        AND expiration_date = CURRENT_DATE + INTERVAL '5 days'
    ) THEN
        INSERT INTO pantry_items (product_id, quantity, expiration_date)
        VALUES (leite_id, 1, CURRENT_DATE + INTERVAL '5 days');
END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pantry_items
        WHERE product_id = arroz_id
        AND expiration_date = CURRENT_DATE + INTERVAL '120 days'
    ) THEN
        INSERT INTO pantry_items (product_id, quantity, expiration_date)
        VALUES (arroz_id, 1, CURRENT_DATE + INTERVAL '120 days');
END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pantry_items
        WHERE product_id = banana_id
        AND expiration_date = CURRENT_DATE + INTERVAL '2 days'
    ) THEN
        INSERT INTO pantry_items (product_id, quantity, expiration_date)
        VALUES (banana_id, 1, CURRENT_DATE + INTERVAL '2 days');
END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pantry_items
        WHERE product_id = detergente_id
        AND expiration_date IS NULL
    ) THEN
        INSERT INTO pantry_items (product_id, quantity, expiration_date)
        VALUES (detergente_id, 2, NULL);
END IF;
END $$;