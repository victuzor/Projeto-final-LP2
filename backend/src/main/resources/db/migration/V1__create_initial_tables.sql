CREATE TABLE markets (
                         id BIGSERIAL PRIMARY KEY,
                         name VARCHAR(120) NOT NULL,
                         address VARCHAR(255)
);

CREATE TABLE categories (
                            id BIGSERIAL PRIMARY KEY,
                            name VARCHAR(80) NOT NULL UNIQUE
);

CREATE TABLE products (
                          id BIGSERIAL PRIMARY KEY,
                          name VARCHAR(120) NOT NULL,
                          brand VARCHAR(120),
                          barcode VARCHAR(80),
                          category_id BIGINT REFERENCES categories(id)
);

CREATE TABLE purchases (
                           id BIGSERIAL PRIMARY KEY,
                           market_id BIGINT REFERENCES markets(id),
                           purchase_date DATE NOT NULL,
                           total_amount NUMERIC(10, 2) NOT NULL
);

CREATE TABLE purchase_items (
                                id BIGSERIAL PRIMARY KEY,
                                purchase_id BIGINT NOT NULL REFERENCES purchases(id) ON DELETE CASCADE,
                                product_id BIGINT NOT NULL REFERENCES products(id),
                                quantity NUMERIC(10, 3) NOT NULL,
                                unit_price NUMERIC(10, 2) NOT NULL,
                                total_price NUMERIC(10, 2) NOT NULL
);

CREATE TABLE pantry_items (
                              id BIGSERIAL PRIMARY KEY,
                              product_id BIGINT NOT NULL REFERENCES products(id),
                              quantity NUMERIC(10, 3) NOT NULL,
                              expiration_date DATE,
                              created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);