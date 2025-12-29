-- CreateTable
CREATE TABLE "companies" (
    "company_tax_id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "kyc_status" TEXT NOT NULL DEFAULT 'PENDING',
    "kyc_docs" TEXT,
    "risk_level" TEXT NOT NULL DEFAULT 'LOW',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "branches" (
    "company_tax_id" TEXT NOT NULL,
    "branch_code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "postal_code" TEXT,
    "phone" TEXT,
    "latitude" REAL,
    "longitude" REAL,
    "is_main" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,

    PRIMARY KEY ("company_tax_id", "branch_code"),
    CONSTRAINT "branches_company_tax_id_fkey" FOREIGN KEY ("company_tax_id") REFERENCES "companies" ("company_tax_id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "users" (
    "uid" TEXT NOT NULL PRIMARY KEY,
    "company_tax_id" TEXT NOT NULL,
    "branch_code" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "email" TEXT,
    "line_id" TEXT,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "roles" TEXT NOT NULL DEFAULT 'BUYER',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_login" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "users_company_tax_id_fkey" FOREIGN KEY ("company_tax_id") REFERENCES "companies" ("company_tax_id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "users_company_tax_id_branch_code_fkey" FOREIGN KEY ("company_tax_id", "branch_code") REFERENCES "branches" ("company_tax_id", "branch_code") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "inventory_items" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "company_tax_id" TEXT NOT NULL,
    "branch_code" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "spec" TEXT,
    "color" TEXT,
    "capacity" TEXT,
    "grade" TEXT NOT NULL DEFAULT 'NEW',
    "qty" INTEGER NOT NULL DEFAULT 0,
    "price" REAL NOT NULL,
    "imei_required" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "images" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "inventory_items_company_tax_id_fkey" FOREIGN KEY ("company_tax_id") REFERENCES "companies" ("company_tax_id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "inventory_items_company_tax_id_branch_code_fkey" FOREIGN KEY ("company_tax_id", "branch_code") REFERENCES "branches" ("company_tax_id", "branch_code") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "orders" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "buyer_company_tax_id" TEXT NOT NULL,
    "buyer_branch_code" TEXT NOT NULL,
    "seller_company_tax_id" TEXT NOT NULL,
    "seller_branch_code" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'CREATED',
    "payment_mode" TEXT NOT NULL,
    "total_amount" REAL NOT NULL,
    "platform_fee" REAL NOT NULL DEFAULT 0,
    "payment_fee" REAL NOT NULL DEFAULT 0,
    "shipping_fee" REAL NOT NULL DEFAULT 0,
    "notes" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "paid_at" DATETIME,
    "dispatched_at" DATETIME,
    "delivered_at" DATETIME,
    "accepted_at" DATETIME,
    CONSTRAINT "orders_buyer_company_tax_id_fkey" FOREIGN KEY ("buyer_company_tax_id") REFERENCES "companies" ("company_tax_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "orders_seller_company_tax_id_fkey" FOREIGN KEY ("seller_company_tax_id") REFERENCES "companies" ("company_tax_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "orders_buyer_company_tax_id_buyer_branch_code_fkey" FOREIGN KEY ("buyer_company_tax_id", "buyer_branch_code") REFERENCES "branches" ("company_tax_id", "branch_code") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "order_items" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "order_id" TEXT NOT NULL,
    "inventory_id" TEXT NOT NULL,
    "qty" INTEGER NOT NULL,
    "unit_price" REAL NOT NULL,
    "imei_list" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "order_items_inventory_id_fkey" FOREIGN KEY ("inventory_id") REFERENCES "inventory_items" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "order_id" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "fee" REAL NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "provider_tx_id" TEXT,
    "webhook_payload" TEXT,
    "paid_at" DATETIME,
    "released_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "payments_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "shipments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "order_id" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'lalamove',
    "quote_id" TEXT,
    "driver_id" TEXT,
    "driver_name" TEXT,
    "driver_phone" TEXT,
    "status" TEXT NOT NULL DEFAULT 'QUOTED',
    "eta_min" INTEGER,
    "eta_max" INTEGER,
    "pickup_address" TEXT NOT NULL,
    "delivery_address" TEXT NOT NULL,
    "proof_photos" TEXT,
    "tracking_url" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "picked_up_at" DATETIME,
    "delivered_at" DATETIME,
    CONSTRAINT "shipments_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "disputes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "order_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "resolution" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "resolved_at" DATETIME
);

-- CreateIndex
CREATE INDEX "users_company_tax_id_branch_code_idx" ON "users"("company_tax_id", "branch_code");

-- CreateIndex
CREATE INDEX "inventory_items_brand_model_idx" ON "inventory_items"("brand", "model");

-- CreateIndex
CREATE INDEX "inventory_items_company_tax_id_branch_code_idx" ON "inventory_items"("company_tax_id", "branch_code");

-- CreateIndex
CREATE INDEX "orders_buyer_company_tax_id_idx" ON "orders"("buyer_company_tax_id");

-- CreateIndex
CREATE INDEX "orders_seller_company_tax_id_idx" ON "orders"("seller_company_tax_id");

-- CreateIndex
CREATE INDEX "orders_status_idx" ON "orders"("status");

-- CreateIndex
CREATE INDEX "order_items_order_id_idx" ON "order_items"("order_id");

-- CreateIndex
CREATE UNIQUE INDEX "payments_order_id_key" ON "payments"("order_id");

-- CreateIndex
CREATE INDEX "payments_status_idx" ON "payments"("status");

-- CreateIndex
CREATE UNIQUE INDEX "shipments_order_id_key" ON "shipments"("order_id");

-- CreateIndex
CREATE INDEX "shipments_status_idx" ON "shipments"("status");

-- CreateIndex
CREATE INDEX "disputes_order_id_idx" ON "disputes"("order_id");

-- CreateIndex
CREATE INDEX "disputes_status_idx" ON "disputes"("status");
