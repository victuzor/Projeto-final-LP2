DO $$
DECLARE
cat_laticinios_id BIGINT;
    cat_graos_id BIGINT;
    cat_hortifruti_id BIGINT;
    cat_limpeza_id BIGINT;
    cat_carnes_id BIGINT;
    cat_bebidas_id BIGINT;
    cat_padaria_id BIGINT;
    cat_higiene_id BIGINT;
    cat_enlatados_id BIGINT;
    cat_congelados_id BIGINT;
BEGIN
INSERT INTO categories (name)
SELECT 'Laticínios'
    WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Laticínios');

INSERT INTO categories (name)
SELECT 'Grãos'
    WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Grãos');

INSERT INTO categories (name)
SELECT 'Hortifruti'
    WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Hortifruti');

INSERT INTO categories (name)
SELECT 'Limpeza'
    WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Limpeza');

INSERT INTO categories (name)
SELECT 'Carnes'
    WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Carnes');

INSERT INTO categories (name)
SELECT 'Bebidas'
    WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Bebidas');

INSERT INTO categories (name)
SELECT 'Padaria'
    WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Padaria');

INSERT INTO categories (name)
SELECT 'Higiene'
    WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Higiene');

INSERT INTO categories (name)
SELECT 'Enlatados'
    WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Enlatados');

INSERT INTO categories (name)
SELECT 'Congelados'
    WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Congelados');

SELECT id INTO cat_laticinios_id FROM categories WHERE name = 'Laticínios' LIMIT 1;
SELECT id INTO cat_graos_id FROM categories WHERE name = 'Grãos' LIMIT 1;
SELECT id INTO cat_hortifruti_id FROM categories WHERE name = 'Hortifruti' LIMIT 1;
SELECT id INTO cat_limpeza_id FROM categories WHERE name = 'Limpeza' LIMIT 1;
SELECT id INTO cat_carnes_id FROM categories WHERE name = 'Carnes' LIMIT 1;
SELECT id INTO cat_bebidas_id FROM categories WHERE name = 'Bebidas' LIMIT 1;
SELECT id INTO cat_padaria_id FROM categories WHERE name = 'Padaria' LIMIT 1;
SELECT id INTO cat_higiene_id FROM categories WHERE name = 'Higiene' LIMIT 1;
SELECT id INTO cat_enlatados_id FROM categories WHERE name = 'Enlatados' LIMIT 1;
SELECT id INTO cat_congelados_id FROM categories WHERE name = 'Congelados' LIMIT 1;

INSERT INTO products (name, brand, barcode, category_id)
SELECT product_name, product_brand, product_barcode, product_category_id
FROM (
         VALUES
             ('Leite Integral 1L', 'Italac', '789000000001', cat_laticinios_id),
             ('Leite Desnatado 1L', 'Piracanjuba', '789000000005', cat_laticinios_id),
             ('Iogurte Natural 170g', 'Nestlé', '789000000006', cat_laticinios_id),
             ('Queijo Mussarela 200g', 'Président', '789000000007', cat_laticinios_id),
             ('Manteiga 200g', 'Aviação', '789000000008', cat_laticinios_id),

             ('Arroz Branco 1kg', 'Tio João', '789000000002', cat_graos_id),
             ('Feijão Carioca 1kg', 'Kicaldo', '789000000009', cat_graos_id),
             ('Macarrão Espaguete 500g', 'Vitarella', '789000000010', cat_graos_id),
             ('Farinha de Trigo 1kg', 'Dona Benta', '789000000011', cat_graos_id),
             ('Açúcar Cristal 1kg', 'União', '789000000012', cat_graos_id),
             ('Café Torrado 250g', 'Santa Clara', '789000000013', cat_graos_id),

             ('Banana Prata 1kg', 'Hortifruti', '789000000003', cat_hortifruti_id),
             ('Maçã Nacional 1kg', 'Hortifruti', '789000000014', cat_hortifruti_id),
             ('Tomate 1kg', 'Hortifruti', '789000000015', cat_hortifruti_id),
             ('Batata Inglesa 1kg', 'Hortifruti', '789000000016', cat_hortifruti_id),
             ('Cebola 1kg', 'Hortifruti', '789000000017', cat_hortifruti_id),
             ('Alface Unidade', 'Hortifruti', '789000000018', cat_hortifruti_id),
             ('Cenoura 1kg', 'Hortifruti', '789000000019', cat_hortifruti_id),

             ('Detergente Neutro 500ml', 'Ypê', '789000000004', cat_limpeza_id),
             ('Sabão em Pó 800g', 'Omo', '789000000020', cat_limpeza_id),
             ('Água Sanitária 1L', 'Qboa', '789000000021', cat_limpeza_id),
             ('Desinfetante 1L', 'Veja', '789000000022', cat_limpeza_id),
             ('Esponja Multiuso', 'Scotch-Brite', '789000000023', cat_limpeza_id),
             ('Papel Toalha 2 rolos', 'Kitchen', '789000000024', cat_limpeza_id),

             ('Frango Congelado 1kg', 'Sadia', '789000000025', cat_carnes_id),
             ('Carne Moída 500g', 'Bovino', '789000000026', cat_carnes_id),
             ('Ovos Brancos 12 unidades', 'Granja', '789000000027', cat_carnes_id),
             ('Filé de Peito de Frango 1kg', 'Perdigão', '789000000028', cat_carnes_id),

             ('Água Mineral 1,5L', 'Indaiá', '789000000029', cat_bebidas_id),
             ('Suco de Uva Integral 1L', 'Aurora', '789000000030', cat_bebidas_id),
             ('Refrigerante Cola 2L', 'Coca-Cola', '789000000031', cat_bebidas_id),
             ('Achocolatado em Pó 400g', 'Nescau', '789000000032', cat_bebidas_id),

             ('Pão de Forma Integral', 'Wickbold', '789000000033', cat_padaria_id),
             ('Pão Francês 1kg', 'Padaria', '789000000034', cat_padaria_id),
             ('Biscoito Cream Cracker', 'Fortaleza', '789000000035', cat_padaria_id),
             ('Bolo Simples 400g', 'Bauducco', '789000000036', cat_padaria_id),

             ('Papel Higiênico 12 rolos', 'Neve', '789000000037', cat_higiene_id),
             ('Sabonete 85g', 'Dove', '789000000038', cat_higiene_id),
             ('Creme Dental 90g', 'Colgate', '789000000039', cat_higiene_id),
             ('Shampoo 350ml', 'Seda', '789000000040', cat_higiene_id),
             ('Desodorante Aerosol', 'Rexona', '789000000041', cat_higiene_id),

             ('Milho Verde Lata', 'Quero', '789000000042', cat_enlatados_id),
             ('Sardinha em Óleo Lata', 'Gomes da Costa', '789000000043', cat_enlatados_id),
             ('Molho de Tomate 300g', 'Pomarola', '789000000044', cat_enlatados_id),
             ('Atum Sólido Lata', 'Gomes da Costa', '789000000045', cat_enlatados_id),

             ('Pizza Congelada', 'Sadia', '789000000046', cat_congelados_id),
             ('Lasanha Congelada', 'Sadia', '789000000047', cat_congelados_id),
             ('Batata Pré-frita Congelada', 'McCain', '789000000048', cat_congelados_id),
             ('Polpa de Fruta Congelada', 'Mais Fruta', '789000000049', cat_congelados_id)
     ) AS new_products(product_name, product_brand, product_barcode, product_category_id)
WHERE NOT EXISTS (
    SELECT 1
    FROM products p
    WHERE p.barcode = new_products.product_barcode
);
END $$;