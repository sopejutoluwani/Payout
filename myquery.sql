
CREATE TABLE IF NOT EXISTS vendors (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    bank_account TEXT NOT NULL,
    email TEXT NOT NULL,
    store_name TEXT NOT NULL
);


CREATE TABLE IF NOT EXISTS orders (
    order_id TEXT PRIMARY KEY,
    amount REAL NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'completed')),
    timestamp TEXT NOT NULL,
    vendor_id TEXT NOT NULL,
    FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS vendor_profiles (
    vendor_id TEXT PRIMARY KEY,
    store_name TEXT NOT NULL,
    FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE
);