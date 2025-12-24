const express = require("express");
const morgan = require("morgan");
const multer = require("multer");
const dotenv = require("dotenv");
const pool = require("./DataBase/Connection");
const { checkQC } = require("./controllers/qcController.js");
async function logAudit(username, action, partId, description) {
  await pool.query(
    `INSERT INTO audit_log (username, action, part_id, description)
     VALUES (?, ?, ?, ?)`,
    [username, action, partId, description]
  );
}
// const multer = require("multer");
const path = require("path");

const XLSX = require("xlsx");
const cors = require("cors");
const app = express();
const COUNTER_FILE = path.join(__dirname, "batchCounter.json");

function getNextBatch(prefix) {
  const data = JSON.parse(fs.readFileSync(COUNTER_FILE, "utf8"));
  data[prefix] = (data[prefix] || 1000) + 1;
  fs.writeFileSync(COUNTER_FILE, JSON.stringify(data, null, 2));
  return `${prefix}${data[prefix]}`;
}
// const storage = multer.memoryStorage();
// const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

dotenv.config();
dotenv.config();

app.use(cors());
app.use(morgan("combined"));

// ❌ ye pehle
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ❌ uploads folder serve
app.use("/uploads", express.static("uploads"));

const port = process.env.PORT || 3000;
const IP_ADDRESS = '0.0.0.0'; // Update this with your IPv4 address
const ExcelJS = require("exceljs");
function authorizeRole(role) {
  return (req, res, next) => {
    const userRole = req.headers["role"];

    if (!userRole) {
      return res.status(403).json({ message: "No role provided" });
    }

    if (userRole !== role) {
      return res.status(403).json({ message: "Access denied" });
    }

    next();
  };
}

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "uploads/");   // uploads folder hona chahiye
//   },
//   filename: function (req, file, cb) {
//     const uniqueName = Date.now() + "-" + file.originalname;
//     cb(null, uniqueName);
//   }
// });
// DELETE complete stock entry
app.delete("/deleteMaterial/:id", (req, res) => {
  const id = req.params.id;

  const sql = "DELETE FROM stock WHERE id = ?";  // ✔ RIGHT TABLE + RIGHT COLUMN

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("DELETE ERROR:", err);
      return res.status(500).send("Internal Server Error");
    }

    if (result.affectedRows === 0) {
      return res.status(404).send("No record found");
    }

    res.send("Deleted");
  });
});

app.get("/suppliers", async (req, res) => {
  const [rows] = await pool.query(
    "SELECT id, name, vendor_code FROM suppliers WHERE vendor_code IS NOT NULL"
  );
  res.json({ data: rows });
});



app.post("/qc/check", checkQC);


app.get("/vendors", async (req, res) => {
  const [rows] = await pool.query(
    "SELECT id, supplier, vendor_code FROM vendorform"
  );
  res.json({ data: rows });
});

// finance summary
app.get("/finance/summary", async (req, res) => {
  try {
    const [[revenue]] = await pool.query(
      "SELECT IFNULL(SUM(amount),0) total FROM customer_billing"
    );

    const [[expenses]] = await pool.query(
      "SELECT IFNULL(SUM(amount),0) total FROM expenses"
    );

    const [[pendingCustomers]] = await pool.query(
      "SELECT IFNULL(SUM(amount),0) total FROM customer_billing WHERE status='PENDING'"
    );

    const [[pendingVendors]] = await pool.query(
      "SELECT IFNULL(SUM(amount),0) total FROM vendor_payments WHERE status='PENDING'"
    );

    res.json({
      revenue: revenue.total,
      expenses: expenses.total,
      pendingCustomers: pendingCustomers.total,
      pendingVendors: pendingVendors.total,
      profit: revenue.total - expenses.total
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get("/hr/employees/list", async (req, res) => {
  const [rows] = await pool.query(
    "SELECT id, employee_name FROM employees ORDER BY employee_name"
  );
  res.json({ data: rows });
});
app.post("/hr/employee/relieve", upload.single("resignation"), async (req, res) => {
  const { employee_id, relieving_date, reason } = req.body;

  await pool.query(
    `INSERT INTO employee_relieve
     (employee_id, relieving_date, reason, resignation_file)
     VALUES (?, ?, ?, ?)`,
    [employee_id, relieving_date, reason, req.file.path]
  );

  res.json({ success: true });
});


app.get("/force-insert-suppliers", async (req, res) => {
  try {
    await pool.query(`
      INSERT INTO suppliers (name, phone, email, credit_limit)
      VALUES 
      ('ABC Traders', '9876543210', 'abc@trade.com', 1000000),
      ('XYZ Electronics', '9123456780', 'xyz@electronics.com', 500000)
    `);

    const [rows] = await pool.query("SELECT * FROM suppliers");
    res.json({ inserted: true, data: rows });
  } catch (err) {
    console.log("FORCE INSERT ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

const QRCode = require("qrcode");
app.get("/workorder", async (req, res) => {
  const [rows] = await pool.query(
    "SELECT * FROM workorder ORDER BY id DESC"
  );
  res.json(rows);
});

app.get("/db-identity", async (req, res) => {
  const [rows] = await pool.query(`
    SELECT 
      DATABASE() AS db,
      @@hostname AS host,
      @@port AS port
  `);
  res.json(rows[0]);
});
app.post("/serial/dispatch", async (req, res) => {
  const { serial_no, customer_id, customer_po } = req.body;

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // 🔴 STEP 1: FINAL QC CHECK (YAHI LAGTA HAI)
    const [[qc]] = await conn.query(
      `SELECT status FROM qc_master
       WHERE qc_type='FINAL'
         AND reference_id=?`,
      [serial_no]
    );

    if (!qc || qc.status !== "PASS") {
      throw new Error("Final QC not passed. Dispatch blocked.");
    }

    // ✅ STEP 2: DISPATCH UPDATE
    const [result] = await conn.query(
      `UPDATE serial_numbers
       SET
         customer_id = ?,
         customer_po = ?,
         status = 'DISPATCHED',
         manufacturing_date = CURDATE()
       WHERE serial_no = ?
         AND status = 'ACTIVE'`,
      [customer_id, customer_po, serial_no]
    );

    if (result.affectedRows === 0) {
      throw new Error("Serial not found or already dispatched");
    }

    await conn.commit();

    res.json({
      success: true,
      message: "Serial dispatched successfully"
    });

  } catch (err) {
    await conn.rollback();
    res.status(400).json({ error: err.message });
  } finally {
    conn.release();
  }
});


app.post("/workorder/create", async (req, res) => {

  const { product_name, planned_qty, bom_id, customer_po_no } = req.body;

  try {
    // 1️⃣ Check BOM
    const [bom] = await pool.query(
      "SELECT bom_id FROM bom_master WHERE bom_id = ?",
      [bom_id]
    );

    if (!bom.length) {
      return res.status(400).json({ message: "Invalid BOM ID" });
    }

    // 2️⃣ Check existing WO
    const [existing] = await pool.query(
      "SELECT wo_id FROM workorder WHERE bom_id = ?",
      [bom_id]
    );

    if (existing.length) {
      return res.status(400).json({
        message: "Work Order already exists",
        wo_id: existing[0].wo_id
      });
    }

    // 3️⃣ Generate WO ID
    const [[{ cnt }]] = await pool.query(
      "SELECT COUNT(*) AS cnt FROM workorder"
    );

    const wo_id = "WO_" + String(cnt + 1).padStart(3, "0");

    // 4️⃣ INSERT WITH CUSTOMER PO ✅
    await pool.query(
      `INSERT INTO workorder
       (wo_id, product_name, planned_qty, bom_id, customer_po_no, status)
       VALUES (?, ?, ?, ?, ?, 'IN-PROGRESS')`,
      [wo_id, product_name, planned_qty, bom_id, customer_po_no]
    );

    res.json({
      success: true,
      wo_id,
      customer_po_no
    });

  } catch (err) {
    console.error("WORK ORDER ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});
// ================= CUSTOMER LIST =================
app.get("/customer/list", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        customer_name,
        address,
        gst_number,
        pan_number,
        contact_person,
        phone_number
      FROM customers
      ORDER BY id DESC
    `);

    res.json({ data: rows });
  } catch (err) {
    console.error("Customer list error:", err);
    res.status(500).json({ error: err.message });
  }
});


// ✅ ADD CUSTOMER
app.post("/customer/add", async (req, res) => {
  try {
    const {
      customer_name,
      address,
      gst_number,
      pan_number,
      contact_person,
      phone_number
    } = req.body;

    const [[{ cnt }]] = await pool.query(
      "SELECT COUNT(*) AS cnt FROM customers"
    );

    const customer_code = "CUST_" + String(cnt + 1).padStart(3, "0");

    await pool.query(
      `INSERT INTO customers
       (customer_code, customer_name, address, gst_number, pan_number, contact_person, phone_number)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        customer_code,
        customer_name,
        address,
        gst_number,
        pan_number,
        contact_person,
        phone_number
      ]
    );

    res.json({ success: true, customer_code });

  } catch (err) {
    console.error("CUSTOMER ADD ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});
// ================= ADD BILLING =================
app.post("/finance/customer-billing/add", async (req, res) => {
  try {
    const { customer_id, customer_po, qty, amount, status } = req.body;

    await pool.query(
      `INSERT INTO customer_billing
       (customer_id, customer_po, qty, amount, status)
       VALUES (?, ?, ?, ?, ?)`,
      [customer_id, customer_po, qty, amount, status]
    );

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================= LIST BILLING =================
app.get("/finance/customer-billing", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM customer_billing ORDER BY id DESC`
    );
    res.json({ data: rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================= FINANCE SUMMARY =================
app.get("/finance/summary", async (req, res) => {
  const [[rev]] = await pool.query(
    `SELECT IFNULL(SUM(amount),0) revenue 
     FROM customer_billing WHERE status='PAID'`
  );

  res.json({
    revenue: rev.revenue,
    expenses: 0,
    profit: rev.revenue
  });
});
app.post("/serial/dispatch", async (req, res) => {
  const { serial_no, customer_id, customer_po } = req.body;

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [result] = await conn.query(
      `UPDATE serial_numbers
       SET 
         customer_id = ?,
         customer_po = ?,
         status = 'DISPATCHED',
         manufacturing_date = CURDATE()
       WHERE serial_no = ?
         AND status = 'ACTIVE'`,
      [customer_id, customer_po, serial_no]
    );

    if (result.affectedRows === 0) {
      throw new Error("Serial not found or already dispatched");
    }

    await conn.commit();
    res.json({ success: true, message: "Serial dispatched successfully" });

  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

app.post("/serial/dispatch-bulk", async (req, res) => {
  const { work_order_id, customer_id, customer_po } = req.body;

  try {
    const [result] = await pool.query(
      `
      UPDATE serial_numbers
      SET
        customer_id = ?,
        customer_po = ?,
        status = 'DISPATCHED'
      WHERE work_order_id = ?
        AND status = 'ACTIVE'
      `,
      [customer_id, customer_po, work_order_id]
    );

    res.json({
      success: true,
      dispatched_count: result.affectedRows
    });

  } catch (err) {
    console.error("DISPATCH ERROR ❌", err);
    res.status(500).json({ error: err.message });
  }
});
// DISPATCH REGISTER (PO-wise)
app.get("/dispatch/register", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        customer_po,
        customer_id,
        COUNT(*) AS total_units,
        MAX(created_at) AS dispatch_date
      FROM serial_numbers
      WHERE status = 'DISPATCHED'
      GROUP BY customer_po, customer_id
      ORDER BY dispatch_date DESC
    `);

    res.json({ data: rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



// GET SERIAL NUMBERS
app.get("/serial-numbers", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        id,
        serial_no,
        work_order_id,
        bom_id,
        lot_id,
        customer_id,
        customer_po,
        manufacturing_date,
        status
      FROM serial_numbers
      ORDER BY id DESC
    `);

    res.json({ data: rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.get("/debug/serial", async (req, res) => {
  try {
    const [db] = await pool.query("SELECT DATABASE() AS db");
    const [count] = await pool.query(
      "SELECT COUNT(*) AS total FROM serial_numbers"
    );
    const [rows] = await pool.query(
      "SELECT * FROM serial_numbers"
    );

    res.json({
      database: db[0].db,
      total_rows: count[0].total,
      rows
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// customer PO
app.post("/customer-po/create", async (req, res) => {
  const { customer_id, planned_qty } = req.body;

  const [[{ cnt }]] = await pool.query(
    "SELECT COUNT(*) AS cnt FROM customer_po"
  );

  const customer_po_no =
    "CPO_" + String(cnt + 1).padStart(4, "0");

  await pool.query(
    `INSERT INTO customer_po
     (customer_po_no, customer_id, order_date, planned_qty)
     VALUES (?, ?, CURDATE(), ?)`,
    [customer_po_no, customer_id, planned_qty]
  );

  res.json({
    success: true,
    customer_po_no
  });
});

// ✅ GET CUSTOMERS (FIXED)
app.get("/customers", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, customer_code, customer_name FROM customers ORDER BY id DESC"
    );

    res.json({ data: rows });
  } catch (err) {
    console.error("GET CUSTOMERS ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/vendor/add", async (req, res) => {
  try {
    const [result] = await db.query(
      "INSERT INTO vendorform (supplier, contact_person, phone, address) VALUES (?,?,?,?)",
      [
        req.body.supplier,
        req.body.contact_person,
        req.body.phone,
        req.body.address
      ]
    );

    const id = result.insertId;
    const vendorCode = `VEN_${String(id).padStart(3, "0")}`;

    await db.query(
      "UPDATE vendorform SET vendor_code=? WHERE id=?",
      [vendorCode, id]
    );

    res.json({ success: true, vendor_code: vendorCode });
  } catch (err) {
    res.status(500).json({ message: "Vendor save failed" });
  }
});

// ------------ INVOICE EXCEL REPORT ------------
app.get("/report/invoice/excel", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT invoice_number, invoice_date, vendor_id, received_date
      FROM invoice
      ORDER BY invoice_date DESC
    `);

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Invoices");

    sheet.columns = [
      { header: "Invoice No", key: "invoice_number" },
      { header: "Invoice Date", key: "invoice_date" },
      { header: "Vendor ID", key: "vendor_id" },
      { header: "Received Date", key: "received_date" }
    ];

    rows.forEach(row => sheet.addRow(row));

    res.setHeader("Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", "attachment; filename=invoice_report.xlsx");

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post("/add-order", (req, res) => {

  const {
    verbal_PNo,
    order_date,
    customer_details,
    item_details,
    reviewed_by,
    qty_ordered,
    schedule_delivery,
    actual_delivery_date,
    qty_delivered,
    balance_qty,
    invoice_no,
    remarks
  } = req.body;

  const sql = `
    INSERT INTO order_register
    (verbal_PNo, order_date, customer_details, item_details, reviewed_by,
     qty_ordered, schedule_delivery, actual_delivery_date,
     qty_delivered, balance_qty, invoice_no, remarks)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    verbal_PNo,
    order_date,
    customer_details,
    item_details,
    reviewed_by,
    qty_ordered,
    schedule_delivery,
    actual_delivery_date,
    qty_delivered,
    balance_qty,
    invoice_no,
    remarks
  ];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("DB Error:", err);
      return res.status(500).send(err);
    }
    res.json({ message: "Order saved successfully ✅" });
  });
});

// ------------ MATERIAL ISSUE REPORT ------------
app.get("/report/request/excel", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT part_id, requested_qty, requested_by, status, request_date
      FROM material_request
      ORDER BY request_date DESC
    `);

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Material Requests");

    sheet.columns = [
      { header: "Part ID", key: "part_id" },
      { header: "Quantity", key: "requested_qty" },
      { header: "Requested By", key: "requested_by" },
      { header: "Status", key: "status" },
      { header: "Date", key: "request_date" }
    ];

    rows.forEach(r => sheet.addRow(r));

    res.setHeader("Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", "attachment; filename=material_requests.xlsx");

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
const PDFDocument = require("pdfkit");
const fs = require("fs");
// const upload = multer({ storage });
// rawmaterial/add
app.post("/material-category/add", async (req, res) => {
  const { category_name, prefix } = req.body;

  if (!category_name || !prefix) {
    return res.status(400).json({ message: "Required fields missing" });
  }

  await pool.query(
    "INSERT INTO material_category (category_name, prefix, is_active) VALUES (?,?,1)",
    [category_name, prefix]
  );

  await pool.query(
    "INSERT INTO batch_sequence (prefix, last_number) VALUES (?,0)",
    [prefix]
  );

  res.json({ message: "Category added successfully" });
});
app.get("/rawmaterial/generate-id", async (req, res) => {
  const [rows] = await pool.query(
    "SELECT COUNT(*) AS cnt FROM raw_material"
  );

  const next = rows[0].cnt + 1;
  const materialId = `MAT${String(next).padStart(5, "0")}`;

  res.json({ materialId });
});


// ✅ API: Add Raw Material
app.post("/rawmaterial/add", upload.none(), async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();

    console.log("🔥 AUTO BOM & WO START");

    const PREFIX_MAP = {
      "Raw Material": "RM",
      "Semi Finished": "SF",
      "Finished Goods": "FG",
      "Stationery": "ST",
    };

    const category = req.body.category?.trim();
    const prefix = PREFIX_MAP[category];
    if (!prefix) throw new Error("Invalid category");

    // ===== Batch / Part =====
    const [[seq]] = await conn.query(
      "SELECT last_number FROM batch_sequence WHERE prefix=? FOR UPDATE",
      [prefix]
    );

    const next = seq.last_number + 1;
    const batchNo = `${prefix}${next}`;
    const materialId = batchNo;

    await conn.query(
      "UPDATE batch_sequence SET last_number=? WHERE prefix=?",
      [next, prefix]
    );

    const materialName = req.body.material_name || materialId;

    // ===== Raw Material =====
    await conn.query(
      `INSERT INTO raw_material 
      (batch_no, material_id, material_name, category, barcode_no)
      VALUES (?, ?, ?, ?, ?)`,
      [batchNo, materialId, materialName, category, materialId]
    );

    // ===== BOM =====
    const bomId = `BOM-${batchNo}-R1`;

    const [bomRes] = await conn.query(
      `INSERT INTO bom_master (bom_id, lot_id, bom_name, revision)
       VALUES (?, ?, ?, 1)`,
      [bomId, batchNo, `${materialName} BOM`]
    );

    await conn.query(
      `INSERT INTO bom_items (bom_master_id, part_id, material_name, qty_required)
       VALUES (?, ?, ?, 1)`,
      [bomRes.insertId, materialId, materialName]
    );

    // ===== Work Order =====
    const [[woSeq]] = await conn.query(
      "SELECT last_number FROM workorder_sequence WHERE id=1 FOR UPDATE"
    );

    const nextWO = woSeq.last_number + 1;
    const woId = "WO_" + String(nextWO).padStart(3, "0");

    await conn.query(
      "UPDATE workorder_sequence SET last_number=? WHERE id=1",
      [nextWO]
    );

    await conn.query(
      `INSERT INTO workorder
   (wo_id, product_name, planned_qty, completed_qty, bom_id, status)
   VALUES (?, ?, NULL, 0, ?, 'IN-PROGRESS')`,
      [woId, materialName, bomId]
    );


    await conn.commit();

    res.json({
      success: true,
      material_id: materialId,
      bom_id: bomId,
      wo_id: woId
    });

  } catch (err) {
    if (conn) await conn.rollback();
    console.error("❌ ERROR:", err);
    res.status(500).json({ error: err.message });
  } finally {
    if (conn) conn.release();
  }
});



app.post("/category/add", async (req, res) => {
  const { category_name, prefix } = req.body;

  if (!category_name || !prefix) {
    return res.status(400).json({ message: "Category & Prefix required" });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // 1️⃣ material_category
    await conn.query(
      "INSERT INTO material_category (category_name, prefix, is_active) VALUES (?, ?, 1)",
      [category_name.trim(), prefix.trim().toUpperCase()]
    );

    // 2️⃣ batch_sequence (🔥 THIS WAS MISSING)
    await conn.query(
      "INSERT INTO batch_sequence (prefix, last_number) VALUES (?, 0)",
      [prefix.trim().toUpperCase()]
    );

    await conn.commit();

    res.json({ success: true, message: "Category added successfully" });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ message: err.message });
  } finally {
    conn.release();
  }
});


app.get("/rawmaterial/list", async (req, res) => {
  try {
    const { category } = req.query;

    const [rows] = await pool.query(
      "SELECT * FROM raw_material WHERE category=? ORDER BY id DESC",
      [category]
    );

    res.json({ data: rows });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


app.get("/suppliers", async (req, res) => {
  try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 10);
    const offset = (page - 1) * limit;

    const [rows] = await pool.query(
      "SELECT * FROM suppliers LIMIT ? OFFSET ?",
      [limit, offset]
    );

    res.json({ data: rows });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});

// ------------ DAILY PDF REPORT ------------
app.get("/report/pdf/daily", async (req, res) => {
  try {
    const [stock] = await pool.query(`
  SELECT part_id, current_balance 
  FROM current_stock
`);
    const [requests] = await pool.query(`SELECT part_id, requested_qty, status FROM material_request`);

    const doc = new PDFDocument();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=daily_report.pdf");
    doc.pipe(res);

    doc.fontSize(16).text("DAILY INVENTORY SUMMARY\n\n");

    doc.fontSize(12).text("STOCK STATUS:");
    stock.forEach(s => doc.text(`${s.part_id} → ${s.closing_balance}`));

    doc.addPage();

    doc.text("MATERIAL REQUESTS:");
    requests.forEach(r => doc.text(`${r.part_id} → ${r.requested_qty} → ${r.status}`));

    doc.end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Generate QR for material
app.get("/qr/:partId", async (req, res) => {
  try {
    const partId = req.params.partId;
    const qr = await QRCode.toDataURL(partId);

    res.send(`<img src="${qr}" /><p>${partId}</p>`);
  } catch (err) {
    res.status(500).send("QR generation failed");
  }
});

// Save QR for material
app.post("/assignQR", async (req, res) => {
  const { partId } = req.body;
  try {
    const qr = await QRCode.toDataURL(partId);

    await pool.query(
      "UPDATE material_master SET qr_code=? WHERE part_id=?",
      [qr, partId]
    );

    res.json({
      message: "QR assigned successfully",
      partId: partId,
      qr: qr
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Fetch QR from DB using Part ID
app.get("/getQR/:partId", async (req, res) => {
  const partId = req.params.partId;

  try {
    const [rows] = await pool.query(
      "SELECT qr_code FROM material_master WHERE part_id = ?",
      [partId]
    );

    if (rows.length === 0 || !rows[0].qr_code) {
      return res.status(404).send("QR not found for this part");
    }

    res.send(`<img src="${rows[0].qr_code}"/><p>${partId}</p>`);
  } catch (err) {
    res.status(500).send("DB Error");
  }
});

// Scan QR → Get Part + Stock + BOM info
app.get("/scan/:partId", async (req, res) => {
  const partId = req.params.partId;

  try {
    // Get material details
    const [material] = await pool.query(
      "SELECT * FROM material_master WHERE part_id = ?",
      [partId]
    );

    if (material.length === 0)
      return res.status(404).json({ message: "Part not found" });

    // Get latest stock
    const [stock] = await pool.query(
      "SELECT * FROM stock WHERE part_id = ? ORDER BY id DESC LIMIT 1",
      [material[0].part_id]
    );


    // Get where used (BOM use)
    const [bom] = await pool.query(
      `SELECT p.ProjectName, t.qty_pcb
       FROM projecttemplate t
       JOIN projecttable p ON t.project_id=p.project_id
       WHERE t.material_name = ?`,
      [material[0].description]
    );

    res.json({
      material: material[0],
      stock: stock[0] || {},
      bom_usage: bom
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/", (req, res) => {
  res.status(200).send("welcome to inventory API");
});

app.post("/requestMaterial", async (req, res) => {
  try {
    const { part_id, qty, user } = req.body;

    await pool.query(
      "INSERT INTO material_request (part_id, requested_qty, requested_by) VALUES (?, ?, ?)",
      [part_id, qty, user]
    );

    res.json({ message: "Material request created successfully" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get("/viewRequests", async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM material_request");
  res.json(rows);
});
app.post("/approveRequest", async (req, res) => {
  try {
    const { request_id } = req.body;

    const [[reqData]] = await pool.query(
      "SELECT * FROM material_request WHERE request_id = ?",
      [request_id]
    );

    if (!reqData || reqData.status !== "Pending")
      return res.status(400).json({ message: "Invalid request" });

    const [[stock]] = await pool.query(
      "SELECT * FROM current_stock WHERE part_id = ?;",
      [reqData.part_id]
    );

    if (!stock || stock.closing_balance < reqData.requested_qty)
      return res.status(400).json({ message: "Insufficient stock" });

    const newBalance = stock.closing_balance - reqData.requested_qty;

    // Insert new stock entry (transaction based)
    await pool.query(
      `INSERT INTO stock (part_id, opening_stock, closing_balance, location)
       VALUES (?, ?, ?, ?)`,
      [
        reqData.part_id,
        stock.closing_balance,
        newBalance,
        stock.location
      ]
    );

    await pool.query(
      "UPDATE material_request SET status='Approved' WHERE request_id=?",
      [request_id]
    );

    res.json({ message: "Request approved & stock updated" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post("/denyRequest", async (req, res) => {
  const { request_id } = req.body;
  await pool.query("UPDATE material_request SET status='Denied' WHERE request_id=?", [request_id]);
  res.json({ message: "Request denied" });
});
app.get("/audit", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM audit_log ORDER BY created_at DESC LIMIT 100"
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/invoiceStockForm', async (req, res) => {
  try {
    const { invoicePostData, matState, formattedDate } = req.body;

    // 1️⃣ Get vendor ID
    const [vendorRow] = await pool.query(
      "SELECT id FROM vendorform WHERE supplier = ?",
      [invoicePostData.invoiceFormVendorName]
    );

    if (vendorRow.length === 0) {
      throw new Error("Vendor not found");
    }

    const vendorId = vendorRow[0].id;

    // 2️⃣ Insert into invoice table
    const insertInvoiceQuery = `
      INSERT INTO invoice (invoice_number, invoice_date, vendor_id, received_date, submit_date)
      VALUES (?, ?, ?, ?, ?)
    `;

    await pool.query(insertInvoiceQuery, [
      invoicePostData.invoiceFormInvoiceId,
      invoicePostData.invoiceFormInvoiceDate,
      vendorId,
      invoicePostData.invoiceFormReceivedDate,
      formattedDate
    ]);

    // 3️⃣ Process each material row
    for (const { materialName, receivedQty } of matState) {

      // material_master se part_id nikaal rahe hain
      const [materialRow] = await pool.query(
        "SELECT part_id FROM material_master WHERE description = ?",
        [materialName]
      );

      if (materialRow.length === 0) {
        console.warn(`Material not found: ${materialName}`);
        continue;
      }

      const partId = materialRow[0].part_id;

      const stock_material_id = `${invoicePostData.invoiceFormInvoiceId}_${vendorId}_${partId}`;

      const [previousStock] = await pool.query(
        "SELECT closing_balance, location FROM stock WHERE part_id = ? ORDER BY id DESC LIMIT 1",
        [partId]
      );

      let openingStock = 0;
      let location = 'Main Store';

      if (previousStock.length > 0) {
        openingStock = previousStock[0].closing_balance;
        location = previousStock[0].location || location;
      }

      const closingBalance = openingStock + parseInt(receivedQty);

      const insertStockQuery = `
        INSERT INTO stock
        (part_id, quantity, location, opening_stock, closing_balance, invoice_number, MRID, stock_material_id, material_name, approved_qty)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      await pool.query(insertStockQuery, [
        partId,
        receivedQty,
        location,
        openingStock,
        closingBalance,
        invoicePostData.invoiceFormInvoiceId,
        null,
        stock_material_id,
        materialName,
        null
      ]);
      await logAudit(
        req.headers["user"] || "system",
        "STOCK_RECEIVED",
        partId,
        `Invoice ${invoicePostData.invoiceFormInvoiceId} received, Qty: ${receivedQty}`
      );


      console.log(`Stock updated for ${materialName}`);


    }

    res.status(200).json({ message: "Invoice & Stock saved successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});
app.get("/dashboard/stock", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        part_id,
        material_name,
        closing_balance AS stock
      FROM stock
      WHERE id IN (
        SELECT MAX(id) FROM stock GROUP BY part_id
      )
    `);

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.get("/dashboard/requests", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        request_id,
        part_id,
        requested_qty,
        requested_by,
        status,
        request_date
      FROM material_request
      ORDER BY request_date DESC
      LIMIT 10
    `);

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get("/dashboard/lowstock", async (req, res) => {
  try {
    const minQty = 20; // You can adjust threshold here

    const [rows] = await pool.query(`
      SELECT 
        part_id,
        material_name,
        closing_balance
      FROM stock
      WHERE closing_balance <= ?
      ORDER BY closing_balance ASC
    `, [minQty]);

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});




app.get("/dashboard/invoices", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT invoice_number, submit_date
      FROM invoice
      ORDER BY submit_date DESC
      LIMIT 10
    `);

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.get("/material", async (req, res) => {
  try {
    const result = await pool.query("select * from material", []);
    res.status(200).send({
      data: result[0],
    });
  } catch (err) {
    res.status(500).send({
      error: err,
    });
  }
});

app.get("/admin", authorizeRole("admin"), (req, res) => {
  res.send("Welcome Admin - Protected Route");
});


app.post("/api/uploadExcel", upload.single("excelFile"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Access the projectName from the request body
    const projectName = req.body.projectName;

    // Read the Excel file from the request
    const workbook = XLSX.read(req.file.buffer);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    // Convert Excel sheet data to JSON
    const excelData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    // Extract headers from the first row
    const headers = excelData[0];

    // Converting data rows into an array of objects
    const dataObjects = excelData.slice(1).map(row => {
      const obj = {};
      headers.forEach((key, index) => {
        obj[key] = row[index];
      });
      return obj;
    });

    // Print the data to the console
    console.log('Project Name:', projectName);
    console.log('Excel Data:', dataObjects);

    // Insert project information into the projecttable
    const insertProjectQuery = `
      INSERT INTO projecttable (ProjectName, AddedOn, UpdatedOn)
      VALUES (?, NOW(), NOW())
    `;

    const projectInsertResults = await pool.query(insertProjectQuery, [projectName]);

    if (projectInsertResults.affectedRows === 0) {
      console.error('Error inserting project into database');
      return res.status(500).json({ error: "Failed to insert project into database" });
    }

    // Fetch the project_id based on the provided projectName
    const fetchProjectIdQuery = `
      SELECT project_id FROM projecttable WHERE ProjectName = ?
    `;

    const projectIdResult = await pool.query(fetchProjectIdQuery, [projectName]);

    if (projectIdResult.length === 0 || projectIdResult[0].length === 0) {
      console.error('Error fetching project_id from the database');
      return res.status(500).json({ error: "Failed to fetch project_id from the database" });
    }

    const projectId = projectIdResult[0][0].project_id;
    console.log('Fetched Project ID:', projectId);

    // Insert material data into the projecttemplate table
    const insertMaterialQuery = `
      INSERT INTO projecttemplate (project_id, material_id, material_name, qty_pcb, ExtraPercentage)
      VALUES (?, ?, ?, ?, ?)
    `;

    for (const material of dataObjects) {
      // Fetch the material_id based on the material_name
      const fetchMaterialIdQuery = `
        SELECT material_id FROM material WHERE material_name = ?
      `;

      const materialIdResult = await pool.query(fetchMaterialIdQuery, [material['Material Name']]);

      let materialId;

      if (materialIdResult.length === 0 || materialIdResult[0].length === 0) {
        console.error(`Material ${material['Material Name']} not found in the database`);
        materialId = null;
      } else {
        materialId = materialIdResult[0][0].material_id;
      }

      // Insert into projecttemplate with material_id
      await pool.query(insertMaterialQuery, [projectId, materialId, material['Material Name'], material['Qty_PCB'], material['Extra %']]);
    }

    console.log('Project and material data inserted into the database');
    res.status(200).send({ success: "Data read and project inserted successfully" });

  } catch (err) {
    console.error("Error reading data:", err);
    res.status(500).json({ error: "Failed to read data" });
  }
});




app.get('/projectDetails', async (req, res) => {
  try {
    const result = await pool.query("select * from projecttable", []);
    res.status(200).send({
      data: result[0],
    });
  } catch (err) {
    res.status(500).send({
      error: err,
    });
  }
})
// login api 
// ---------- LOGIN API (User based access) ----------
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const sql = "SELECT * FROM users WHERE username = ? AND password = ?";
    const [result] = await pool.query(sql, [username, password]);

    if (result.length === 0) {
      return res.status(401).json({
        status: "fail",
        message: "Invalid username or password",
      });
    }

    res.json({
      status: "success",
      user: result[0],
      role: result[0].role
    });
  } catch (err) {
    console.log("LOGIN ERROR:", err);
    res.status(500).json({ status: "error", error: err.message });
  }
});
app.post("/updateCategory", async (req, res) => {
  try {
    const { id, category } = req.body;

    await pool.query(
      "UPDATE stock SET category = ? WHERE id = ?",
      [category, id]
    );

    res.json({ message: "Category updated successfully" });
  } catch (err) {
    console.error("CATEGORY UPDATE ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

// CREATE EMPLOYEE (ALL UPLOADS MANDATORY)
app.post(
  "/hr/employee/create",
  upload.fields([
    { name: "resume", maxCount: 1 },
    { name: "aadhar", maxCount: 1 },
    { name: "pan", maxCount: 1 },
    { name: "offer_letter", maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      console.log("BODY 👉", req.body);
      console.log("FILES 👉", req.files);

      const {
        name,
        email,
        phone,
        department,
        role,
        employmentType,
        compensation,
        currentAddress,
        permanentAddress,
        pan,
        dateOfJoining,
        reportingManager
      } = req.body;

      // 🔒 Mandatory validation
      if (
        !name ||
        !pan ||
        !req.files?.resume ||
        !req.files?.aadhar ||
        !req.files?.pan ||
        !req.files?.offer_letter
      ) {
        return res.status(400).json({ error: "Missing required fields/files" });
      }

      const [result] = await pool.query(
        `INSERT INTO employees
        (
          employee_name,
          email,
          phone,
          department,
          position,
          employment_type,
          compensation,
          current_address,
          permanent_address,
          pan_number,
          date_of_joining,
          reporting_manager
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          name,
          email,
          phone,
          department,
          role,
          employmentType,
          compensation,
          currentAddress,
          permanentAddress,
          pan,
          dateOfJoining,
          reportingManager
        ]
      );

      res.json({
        success: true,
        employee_id: result.insertId
      });

    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  }
);

// LIST EMPLOYEES
// GET employee list
app.get("/hr/employees", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        e.id,
        e.employee_name,
        e.email,
        e.department,
        e.position,
        e.employment_type,
        e.created_at,
        CASE 
          WHEN r.id IS NULL THEN 'ACTIVE'
          ELSE 'RELIEVED'
        END AS status
      FROM employees e
      LEFT JOIN employee_relieve r ON r.employee_id = e.id
      ORDER BY e.created_at DESC
    `);

    res.json({ data: rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// VIEW EMPLOYEE WITH DOCUMENTS
app.get("/hr/employee/:id", async (req, res) => {
  const { id } = req.params;

  const [[employee]] = await pool.query(
    "SELECT * FROM employees WHERE id=?",
    [id]
  );

  const [docs] = await pool.query(
    "SELECT doc_type, file_path FROM employee_documents WHERE employee_id=?",
    [id]
  );

  res.json({ employee, documents: docs });
});


// ---------- CREATE USER (ADMIN ONLY) ----------
app.post("/createUser", authorizeRole("admin"), async (req, res) => {
  const { username, password, role } = req.body;

  if (!username || !password || !role) {
    return res.status(400).json({ message: "All fields required" });
  }

  try {
    const [existing] = await pool.query(
      "SELECT * FROM users WHERE username = ?",
      [username]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: "Username already exists" });
    }

    await pool.query(
      "INSERT INTO users (username, password, role) VALUES (?,?,?)",
      [username, password, role]
    );

    return res.status(200).json({
      message: "User created successfully",
      user: { username, role }
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Assuming you have a route like this in your backend
app.post('/api/getProjectTemplateData', async (req, res) => {
  try {
    const { projectInputs } = req.body;
    // console.log(projectInputs)

    const [{ projectName, qty }] = projectInputs;
    const fetchProjectIdQuery = 'SELECT project_id FROM projecttable WHERE ProjectName = ?';
    const [projectData] = await pool.query(fetchProjectIdQuery, [projectName]);

    if (!projectData || !projectData.length) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    const projectId = projectData[0].project_id;

    // Step 2: Fetch all data based on project_id
    const fetchDataQuery = 'SELECT * FROM projecttemplate WHERE project_id = ?';
    const projectTemplateData = await pool.query(fetchDataQuery, [projectId]);

    const projectTemplateDataWithProjectName = projectTemplateData[0].map((item) => ({
      ...item,
      projectName: projectName,
      monthlyQty: qty,
    }));

    res.status(200).json({ data: projectTemplateDataWithProjectName });
  } catch (error) {
    console.error('Error fetching project template data:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch project template data' });
  }
});
app.post("/bom/create", async (req, res) => {
  const { bom_name, project_id, items } = req.body;

  // 1️⃣ Get next revision
  const [[last]] = await pool.query(
    "SELECT MAX(version) AS rev FROM bom_master WHERE bom_name=?",
    [bom_name]
  );
  const version = (last.rev || 0) + 1;

  // 2️⃣ Create BOM Master
  const [result] = await pool.query(
    `INSERT INTO bom_master (bom_name, version, project_id)
     VALUES (?, ?, ?)`,
    [bom_name, version, project_id]
  );

  const bom_master_id = result.insertId;

  // 3️⃣ Insert BOM Items with REAL PART ID
  for (const item of items) {
    await pool.query(
      `INSERT INTO bom_items
       (bom_master_id, part_id, material_name, qty_required)
       VALUES (?, ?, ?, ?)`,
      [
        bom_master_id,
        item.material_id,   // ✅ REAL PART ID (RMxxxx)
        item.material_name,
        item.qty_required
      ]
    );
  }

  res.json({
    message: "BOM created successfully",
    bom_name,
    version
  });
});



app.get("/bom", async (req, res) => {
  const [rows] = await pool.query(`
    SELECT 
      bm.bom_id,
      bm.lot_id,
      bm.bom_name,
      bm.revision,
      bi.part_id,
      bi.material_name,
      bi.qty_required
    FROM bom_items bi
    JOIN bom_master bm
      ON bi.bom_master_id = bm.id
    ORDER BY bm.id DESC
  `);

  console.log("✅ BOM DATA:", rows);
  res.json({ data: rows });
});
// ======QC Submit ====
app.post("/qc/submit", async (req, res) => {
  try {
    const {
      qc_type,
      reference_id,
      observation,
      result,
      remarks
    } = req.body;

    if (!qc_type || !reference_id || !observation) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const [resultDb] = await pool.query(
      `
      INSERT INTO qc_master
      (qc_type, reference_id, observation, status, remarks)
      VALUES (?, ?, ?, ?, ?)
      `,
      [qc_type, reference_id, observation, result, remarks]
    );

    res.json({ success: true, id: resultDb.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// app.get("/qc/template/:type", async (req, res) => {
//   const { type } = req.params;

//   const [rows] = await pool.query(
//     `SELECT parameter_name, acceptance_criteria, test_method
//      FROM qc_templates
//      WHERE UPPER(qc_type) = UPPER(?)`,
//     [type]
//   );

//   res.json({ data: rows });
// });
app.get("/qc/template/:type", async (req, res) => {
  const { type } = req.params;

  // 🔎 Debug: show raw rows
  const [rows] = await pool.query(
    "SELECT qc_type, parameter_name FROM qc_templates"
  );

  console.log("ALL ROWS:", rows);

  res.json({ data: rows });
});



// =====AFTER QC SAVE =======
app.post("/qc/save", async (req, res) => {
  const qc_type = req.body.qc_type || req.body.qcType;
  const parameters = req.body.parameters || req.body.rows;
  const { reference_id } = req.body;

  if (!qc_type) {
    return res.status(400).json({ error: "qc_type missing from request" });
  }

  if (!Array.isArray(parameters)) {
    return res.status(400).json({ error: "parameters must be an array" });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // 🔹 QC MASTER
    const [qc] = await conn.query(
      `INSERT INTO qc_master (qc_type, reference_id)
       VALUES (?, ?)`,
      [qc_type, reference_id]
    );

    const qcId = qc.insertId;
    let finalStatus = "PASS";

    // 🔹 QC DETAILS
    for (let p of parameters) {
      if (p.status === "FAIL") finalStatus = "FAIL";

      await conn.query(
        `INSERT INTO qc_details
         (qc_id, parameter_name, observation, result, remarks)
         VALUES (?, ?, ?, ?, ?)`,
        [
          qcId,
          p.parameter_name,
          p.actual_result, // 👉 goes into observation
          p.status,        // 👉 goes into result
          p.remarks
        ]
      );
    }

    // 🔹 UPDATE FINAL STATUS
    await conn.query(
      `UPDATE qc_master SET status=? WHERE id=?`,
      [finalStatus, qcId]
    );

    await conn.commit();
    res.json({ success: true });

  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});


// ================================ AUTO CAPA WHEN QC FAILS ==============================
app.post("/qc/capa/create", async (req, res) => {
  const {
    qc_id,
    issue,
    root_cause,
    corrective_action,
    preventive_action,
    responsible_person,
    target_date
  } = req.body;

  try {
    await pool.query(
      `INSERT INTO capa
       (qc_id, issue, root_cause, corrective_action,
        preventive_action, responsible_person, target_date)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        qc_id,
        issue,
        root_cause,
        corrective_action,
        preventive_action,
        responsible_person,
        target_date
      ]
    );

    res.json({ success: true, message: "CAPA created" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// ===QC LIST WITH CAPA STATUS===
app.get("/qc/list", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        qc_type,
        reference_id,
        observation,
        status,
        remarks,
        created_at
      FROM qc_master
      ORDER BY created_at DESC
    `);

    res.json({ data: rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get("/qc/list/:type", async (req, res) => {
  const { type } = req.params;

  const [rows] = await pool.query(`
    SELECT reference_id, observation, status, remarks, created_at
    FROM qc_master
    WHERE qc_type=?
    ORDER BY created_at DESC
  `, [type]);

  res.json({ data: rows });
});


// ================= AUTO BATCH NUMBER =================
// ================= NEXT BATCH NUMBER =================
// GET NEXT BATCH NUMBER


app.get("/rawmaterial/preview-batch", async (req, res) => {
  const { category } = req.query;
  if (!category) {
    return res.status(400).json({ message: "Category required" });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // 1️⃣ Check category
    let [cat] = await conn.query(
      "SELECT prefix FROM material_category WHERE category_name=?",
      [category]
    );

    let prefix;

    // 2️⃣ Agar category nahi hai → AUTO CREATE
    if (cat.length === 0) {
      prefix = category.substring(0, 2).toUpperCase();

      await conn.query(
        "INSERT INTO material_category (category_name, prefix, is_active) VALUES (?, ?, 1)",
        [category, prefix]
      );

      // ⚠️ batch_sequence me PREFIX based entry
      await conn.query(
        "INSERT INTO batch_sequence (prefix, last_number) VALUES (?, 0)",
        [prefix]
      );
    } else {
      prefix = cat[0].prefix;
    }

    // 3️⃣ Get & lock sequence by PREFIX
    const [seq] = await conn.query(
      "SELECT last_number FROM batch_sequence WHERE prefix=? FOR UPDATE",
      [prefix]
    );

    const last = seq.length > 0 ? seq[0].last_number || 0 : 0;
    const next = last + 1;

    await conn.query(
      "UPDATE batch_sequence SET last_number=? WHERE prefix=?",
      [next, prefix]
    );

    await conn.commit();

    const batchNo = `${prefix}${String(next).padStart(4, "0")}`;
    res.json({ batchNo });

  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});




// 🔔 Fetch Unread BOM Alerts Count
app.get("/bom-unread-alerts", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT COUNT(*) AS total
      FROM bom_history
      WHERE viewed = 0
    `);

    res.json({ count: rows[0].total });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});
// app.post("/applyLeave", async (req, res) => {
//   const { employee_id, leave_type_id, start_date, end_date, reason } = req.body;

//   try {
//     await pool.query(
//       `INSERT INTO leave_requests 
//        (employee_id, leave_type_id, start_date, end_date, reason)
//        VALUES (?, ?, ?, ?, ?)`,
//       [employee_id, leave_type_id, start_date, end_date, reason]
//     );

//     res.json({ message: "Leave applied successfully" });

//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });
app.get("/leaveRequests", async (req, res) => {
  const [rows] = await pool.query(`
    SELECT 
      lr.id,
      e.EmployeeName,
      lt.type_name AS leave_type,
      lr.start_date,
      lr.end_date,
      lr.reason,
      lr.status,
      lr.applied_on
    FROM leave_requests lr
    JOIN employee e ON lr.employee_id = e.EmployeeID
    JOIN leave_types lt ON lr.leave_type_id = lt.id
    ORDER BY lr.applied_on DESC
  `);

  res.json(rows);
});


// APPLY LEAVE API
app.post("/leave/apply", async (req, res) => {
  const { employee_id, leave_type_id, start_date, end_date, reason } = req.body;

  await pool.query(`
    INSERT INTO leave_requests 
    (employee_id, leave_type_id, start_date, end_date, reason)
    VALUES (?, ?, ?, ?, ?)
  `, [employee_id, leave_type_id, start_date, end_date, reason]);

  res.json({ message: "Leave Applied Successfully ✅" });
});




// FETCH LEAVE TYPES
app.get("/leave/types", async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM leave_types");
  res.json(rows);
});

app.post("/approveLeave", async (req, res) => {
  const { id } = req.body;

  await pool.query(
    "UPDATE leave_requests SET status='Approved' WHERE id=?",
    [id]
  );

  res.json({ message: "Leave Approved" });
});
app.post("/rejectLeave", async (req, res) => {
  const { id } = req.body;

  await pool.query(
    "UPDATE leave_requests SET status='Rejected' WHERE id=?",
    [id]
  );

  res.json({ message: "Leave Rejected" });
});



// ✅ Mark BOM alerts as read
app.post("/bom-alerts/read", async (req, res) => {
  try {
    await pool.query(`UPDATE bom_history SET viewed = 1`);
    res.json({ message: "All BOM alerts marked as read" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.post("/updateBomItem", async (req, res) => {
  const { bom_id, part_id, new_qty, user } = req.body;

  try {
    // 1️⃣ OLD BOM MASTER
    const [oldBomRows] = await pool.query(
      "SELECT * FROM bom_master WHERE bom_id=?",
      [bom_id]
    );

    if (!oldBomRows.length) {
      return res.status(404).json({ message: "BOM not found" });
    }

    const oldBom = oldBomRows[0];

    // 2️⃣ OLD QTY
    const [[oldItem]] = await pool.query(
      "SELECT qty_required FROM bom_items WHERE bom_id=? AND part_id=?",
      [bom_id, part_id]
    );

    if (!oldItem) {
      return res.status(404).json({ message: "BOM item not found" });
    }

    const old_qty = oldItem.qty_required;

    // 3️⃣ NEW REVISION + BOM ID
    const newRevision = oldBom.revision + 1;

    const newBomId =
      "BOM_" +
      oldBom.bom_name.toUpperCase().replace(/\s+/g, "_") +
      "_R" +
      newRevision;

    // 4️⃣ INSERT NEW BOM MASTER
    await pool.query(
      `INSERT INTO bom_master
       (bom_id, bom_name, revision, project_id)
       VALUES (?,?,?,?)`,
      [newBomId, oldBom.bom_name, newRevision, oldBom.project_id]
    );

    // 5️⃣ COPY BOM ITEMS
    await pool.query(
      `INSERT INTO bom_items (bom_id, part_id, material_name, qty_required)
       SELECT ?, part_id, material_name, qty_required
       FROM bom_items
       WHERE bom_id=?`,
      [newBomId, bom_id]
    );

    // 6️⃣ UPDATE REQUIRED PART
    await pool.query(
      "UPDATE bom_items SET qty_required=? WHERE bom_id=? AND part_id=?",
      [new_qty, newBomId, part_id]
    );

    // 7️⃣ SAVE HISTORY ✅
    await pool.query(
      `INSERT INTO bom_history
       (bom_id, part_id, old_qty, new_qty, change_type, changed_by)
       VALUES (?, ?, ?, ?, 'REVISION', ?)`,
      [newBomId, part_id, old_qty, new_qty, user || "system"]
    );

    res.json({
      message: "✅ New BOM Revision Created",
      old_bom: bom_id,
      new_bom: newBomId
    });

  } catch (err) {
    console.error("BOM update error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/bom-alerts/:projectId", async (req, res) => {
  const { projectId } = req.params;

  try {
    const [rows] = await pool.query(`
      SELECT revision, created_at
      FROM bom_master
      WHERE project_id = ?
      ORDER BY created_at DESC
      LIMIT 1
    `, [projectId]);

    if (rows.length > 0) {
      const lastUpdate = new Date(rows[0].created_at);
      const now = new Date();
      const diffMinutes = (now - lastUpdate) / (1000 * 60);

      if (diffMinutes <= 10) {
        return res.json([rows[0]]);
      }
    }
    res.json([]);
  } catch (err) {
    res.status(500).json({ error: "BOM alert failed" });
  }
});



app.post("/procurement-summary", async (req, res) => {
  const { project_id, monthlyQty } = req.body;

  console.log("PROCUREMENT REQUEST RECEIVED:", req.body);

  try {
    const [bom] = await pool.query(`
      SELECT bi.part_id, bi.material_name, bi.qty_required
      FROM bom_items bi
      JOIN bom_master bm ON bm.id = bi.bom_id
      WHERE bm.project_id = ?
    `, [project_id]);

    if (!bom.length) {
      return res.status(400).json({ message: "No BOM found for project" });
    }

    const [stock] = await pool.query(`SELECT * FROM current_stock`);

    const stockMap = {};
    stock.forEach(item => {
      stockMap[item.part_id] = item.current_balance;
    });

    // ✅ WITH VENDOR NAME + PRICE
    const summary = await Promise.all(bom.map(async (item) => {

      const required = item.qty_required * monthlyQty;
      const available = stockMap[item.part_id] || 0;
      const toBuy = Math.max(required - available, 0);

      const [[vendor]] = await pool.query(`
  SELECT v.supplier AS vendor_name, vmp.price
  FROM vendor_material_price vmp
  JOIN vendorform v ON v.id = vmp.vendor_id
  WHERE vmp.material_name = ?
  LIMIT 1
`, [item.material_name]);


      return {
        part_id: item.part_id,
        material_name: item.material_name,
        required,
        available,
        toBuy,
        vendor_name: vendor ? vendor.vendor_name : "Not Mapped",
        price: vendor ? vendor.price : 0,
        total_cost: vendor ? vendor.price * toBuy : 0
      };


    }));

    res.json(summary);

  } catch (err) {
    console.error("PROCUREMENT ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});



app.post('/projectDetailsDashBoard', async (req, res) => {
  try {
    const { viewRow } = req.body;
    console.log('Received data from Postman:', viewRow);

    // Extract project_id from viewRow
    const { project_id } = viewRow;

    // Fetch data from projecttemplate table based on project_id
    const fetchDataQuery = 'SELECT * FROM projecttemplate WHERE project_id = ?';
    const projectTemplateData = await pool.query(fetchDataQuery, [project_id]);

    // Fetch ProjectName from projecttable based on project_id
    const fetchProjectNameQuery = 'SELECT ProjectName FROM projecttable WHERE project_id = ?';
    const projectNameData = await pool.query(fetchProjectNameQuery, [project_id]);

    const projectName = projectNameData[0][0]?.ProjectName || ''; // Get the first project name (if exists)

    // Optionally, you can include the fetched data in your response
    const responseData = {
      projectTemplateData: projectTemplateData[0].map(item => ({
        ...item,
        projectName: projectName,
      })),
    };

    res.status(200).json(responseData);
  } catch (err) {
    console.error('Error fetching DashBoard data:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch DashBoard data' });
  }
});


app.post("/submitVendorForm", async (req, res) => {
  try {
    const formData = req.body;
    const dataToInsert = {
      supplier: formData.nameOfSupplier,
      date: formData.formDate,
      office_address: formData.formOfficeAddress,
      office_contact_person: formData.formOfficeContactPerson,
      office_designation: formData.formOfficeDesignation,
      office_telephone: formData.formOfficeTelephone,
      office_email: formData.formOfficeEmail,
      office_fax: formData.formOfficeFax,
      work_address: formData.formWorkAddress,
      work_contact_person: formData.formWorkContactPerson,
      work_designation: formData.formWorkDesignation,
      work_telephone: formData.formWorkTelephone,
      work_email: formData.formWorkEmail,
      work_fax: formData.formWorkFax,
      business: formData.formBussiness,
      product: formData.formProduct,
      iso_certified: formData.formIsoCertified,
      relevant_field: formData.formRelevantField,
      major_client: formData.formMajorClient,
      order_date: formData.formOrderDate,
      lead_time: formData.formLeadTime,
    };
    // console.log(JSON.stringify(dataToInsert.vendor_id))
    // console.log(dataToInsert)
    // console.log(JSON.stringify(dataToInsert))
    const columns = Object.keys(dataToInsert).join(",");
    const values = Object.values(dataToInsert)
      .map((value) => `'${value}'`)
      .join(",");
    const sql = `INSERT INTO vendorform (${columns}) VALUES (${values})`;
    // console.log(columns)
    // console.log(values)
    // console.log(sql)
    const result = await pool.query(sql, values, (err, results) => {
      if (err) {
        console.error("Error inserting data: ", err);
        res.status(500).json({ error: "Internal Server Error" });
      }
      res.status(200).json({ message: "Data inserted successfully" });
    });
    res.status(200).send(result[0]);
  } catch (err) {
    res.status(500).json({ error: err });
  }
});

app.get("/api/vendorform", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM vendorform", []);
    const vendorId = await pool.query("SELECT vendor_id FROM vendorform", []);

    // Format the date to DD-MM-YYYY before sending it in the response
    const formattedData = result[0].map(item => ({
      ...item,
      date: new Date(item.date).toLocaleDateString('en-GB').replace(/\//g, '-'), // 'en-GB' sets the format to DD-MM-YYYY
    }));

    // Send a single response with both sets of data
    res.status(200).send({
      data: formattedData,
      vendorId: vendorId[0],
    });

  } catch (err) {
    // Handle errors and send an appropriate response
    res.status(500).send({
      error: err.message, // Assuming 'err' has a 'message' property
    });
  }
});

app.post('/vendorExcel', upload.single('excelFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(sheet, {
      rawDates: true,
      dateNF: 'yyyy-mm-dd',
    });

    // Convert raw date values to JavaScript Date objects
    jsonData.forEach((entry) => {
      entry.date = formatDate(entry.date);
      entry.order_date = formatDate(entry.order_date);
    });

    // Function to format the date as "YYYY-MM-DD"
    function formatDate(rawDate) {
      const dateObj = XLSX.SSF.parse_date_code(rawDate);
      const year = dateObj.y;
      const month = dateObj.m; // Month is 0-indexed
      const day = dateObj.d;

      return `${year}-${month < 10 ? '0' : ''}${month}-${day < 10 ? '0' : ''}${day}`;
    }

    // Insert data into the vendorform table
    for (const data of jsonData) {
      await pool.query(
        `INSERT INTO vendorform 
         (supplier, date, office_address, office_contact_person, office_designation, office_telephone, 
          office_email, office_fax, work_address, work_contact_person, work_designation, work_telephone, 
          work_email, work_fax, business, product, iso_certified, relevant_field, major_client, 
          order_date, Lead_time, vendor_id) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          data.supplier, data.date, data.office_address, data.office_contact_person, data.office_designation,
          data.office_telephone, data.office_email, data.office_fax, data.work_address,
          data.work_contact_person, data.work_designation, data.work_telephone, data.work_email,
          data.work_fax, data.business, data.product, data.iso_certified, data.relevant_field,
          data.major_client, data.order_date, data.Lead_time, null, // Replace with your vendor ID generation logic
        ]
      );
    }

    console.log('Data successfully inserted into vendorform table.');
    res.status(200).json({ message: 'Data successfully inserted into vendorform table', jsonData: jsonData });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});





// Raw material from request form
app.post("/rawMaterialForm", async (req, res) => {
  try {
    const rawMaterialFormDate = req.body;
    console.log(JSON.stringify(rawMaterialFormDate));
    const rawMaterialFormDataInsert = {
      material_id: rawMaterialFormDate.rawmaterialId,
      material_name: rawMaterialFormDate.rawmaterialName,
      barcode_no: rawMaterialFormDate.rawmaterialBarcode,
      category: rawMaterialFormDate.materialCategory,
      type: rawMaterialFormDate.types,
      description: rawMaterialFormDate.description,
      value: rawMaterialFormDate.formValues,
      package: rawMaterialFormDate.packageDetails
    };
    console.log(rawMaterialFormDataInsert)
    const columns = Object.keys(rawMaterialFormDataInsert).join(",");
    const values = Object.values(rawMaterialFormDataInsert)
      .map((value) => `'${value}'`)
      .join(",");
    const sql = `INSERT INTO material (${columns}) VALUES (${values})`;
    // console.log(columns)
    // console.log(values)
    console.log(sql);
    const result = await pool.query(sql, values, (err, results) => {
      if (err) {
        console.error("Error inserting data: ", err);
        res.status(500).json({ error: "Internal Server Error" });
      }
      res.status(200).json({ message: "Data inserted successfully" });
    });
    res.status(200).send(result[0]);
    // console.log(JSON.stringify(rawMaterialFormDataInsert))
  } catch (err) {
    res.status(500).json({ error: err });
    console.log("error", err);
  }
});
// ✅ DELETE RAW MATERIAL
app.delete("/rawmaterial/delete/:material_id", async (req, res) => {
  try {
    const { material_id } = req.params;

    const [result] = await pool.query(
      "DELETE FROM raw_material WHERE material_id=?",
      [material_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Material not found" });
    }

    res.json({ success: true, material_id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});






//sending data to invoice form from material database
// sending dat to material table in rawDatatable.jsx
app.get("/rawmaterial/data", async (req, res) => {
  try {
    // Fetch material data
    const materialResult = await pool.query("SELECT * FROM material", []);
    const materialData = materialResult[0];

    // Fetch the last entry for each material name from the stock table
    const instockQtyPromises = materialData.map(async (material) => {
      const stockResult = await pool.query(
        "SELECT closing_balance AS instock_qty FROM stock WHERE material_name = ? ORDER BY id DESC LIMIT 1",
        [material.material_name]
      );
      return {
        ...material,
        instock_qty: stockResult[0][0] ? stockResult[0][0].instock_qty : 0, // Default to 0 if no stock entry
      };
    });

    // Wait for all promises to resolve
    const materialWithInstockQty = await Promise.all(instockQtyPromises);

    res.status(200).send({
      data: materialWithInstockQty,
    });
  } catch (err) {
    res.status(500).send({ err: err.message });
  }
});

// Import necessary modules and configure your Express app

app.get("/rawmaterial/category", async (req, res) => {
  const [rows] = await pool.query(
    "SELECT category_name, prefix FROM material_category WHERE is_active=1"
  );
  res.json({ data: rows });
});



app.get("/debug/db", async (req, res) => {
  try {
    const [db] = await pool.query("SELECT DATABASE() AS db");
    const [tables] = await pool.query("SHOW TABLES");
    const [count] = await pool.query("SELECT COUNT(*) AS total FROM raw_material");
    const [rows] = await pool.query("SELECT * FROM raw_material LIMIT 5");

    res.json({
      db,
      tables,
      count,
      rows
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/debug-category", async (req, res) => {
  const [db] = await pool.query("SELECT DATABASE() AS db");
  const [count] = await pool.query("SELECT COUNT(*) AS total FROM raw_material");
  const [rows] = await pool.query("SELECT * FROM raw_material LIMIT 5");
  const [cat] = await pool.query("SELECT DISTINCT category FROM raw_material");

  res.json({
    db,
    count,
    rows,
    category: cat
  });
});

app.get("/check-db", async (req, res) => {
  const [db] = await pool.query("SELECT DATABASE() AS db");
  res.json(db);
});

// invoice form in data to mysql


// app.post('/invoiceStockForm', async (req, res) => {
//   try {
//     const { invoicePostData, matState, formattedDate } = req.body;
//     console.log(invoicePostData)
//     console.log(matState)
//     // Get the vendor_id from the vendor table based on the vendor_name
//     const [vendorRow] = await pool.query(
//       "SELECT id FROM vendorform WHERE supplier = ?",
//       [invoicePostData.invoiceFormVendorName]
//     );

//     if (vendorRow.length === 0) {
//       // Vendor not found, handle accordingly (throw an error, send a response, etc.)
//       throw new Error('Vendor not found.');
//     }

//     const vendorId = vendorRow[0].id;

//     // Insert data into the invoice table
//     const insertInvoiceQuery = `INSERT INTO invoice (invoice_number, invoice_date, vendor_id, received_date,submit_date) VALUES (?, ?, ?, ?,?)`;
//     const invoiceValues = [
//       invoicePostData.invoiceFormInvoiceId,
//       invoicePostData.invoiceFormInvoiceDate,
//       vendorId, // Use the obtained vendor_id
//       invoicePostData.invoiceFormReceivedDate,
//       formattedDate
//     ];

//     await pool.query(insertInvoiceQuery, invoiceValues);

//     console.log('Data inserted into invoice table successfully.');

//     // Insert data into the invoicetemplate table and stocktable
//     for (const { materialName, receivedQty } of matState) {
//       const [materialRow] = await pool.query(
//         "SELECT material_id FROM material WHERE material_name = ?",
//         [materialName]
//       );

//       if (materialRow.length > 0) {
//         const materialID = materialRow[0].material_id;

//         // Construct stock_material_id
//         const stock_material_id = `${invoicePostData.invoiceFormInvoiceId}_${vendorId}_${materialID}`;

//         // Get the previous closing balance from stock table
//         const [previousStockRow] = await pool.query(
//           "SELECT closing_balance FROM stocktable WHERE material_name = ? ORDER BY id DESC LIMIT 1",
//           [materialName]
//         );

//         let openingStock = 0;
//         let closingBalance = parseInt(receivedQty);

//         // changed the logic here :- 

//         // if (previousStockRow.length > 0) {
//         //   openingStock = previousStockRow[0].closing_balance; // Set opening stock to the previous closing balance
//         //   closingBalance = openingStock + parseInt(receivedQty);
//         // }

//         // Insert a new row with the calculated values
//         const MRID = null;

//         const insertStockQuery = `INSERT INTO stocktable (opening_stock, closing_balance, invoice_number, MRID, stock_material_id, material_name,approved_qty) VALUES (?, ?, ?, ?, ?, ?,?)`;
//         const stockValues = [openingStock, closingBalance, invoicePostData.invoiceFormInvoiceId, MRID, stock_material_id, materialName, null];

//         await pool.query(insertStockQuery, stockValues);

//         // Insert data into the invoicetemplate table
//         const insertTemplateQuery = `INSERT INTO invoicetemplate (material_id, received_qty, invoice_number) VALUES (?, ?, ?)`;
//         const templateValues = [materialID, parseInt(receivedQty), invoicePostData.invoiceFormInvoiceId];

//         await pool.query(insertTemplateQuery, templateValues);

//         console.log(`Data inserted into invoicetemplate table for material: ${materialName}`);
//       }
//     }

//     res.status(200).send('Data inserted successfully into invoice, invoicetemplate, and stock tables');
//   } catch (err) {
//     console.error('Error processing request: ' + err.message);
//     res.status(500).send({ error: err.message });
//   }
// });

app.post('/invoiceStockForm', async (req, res) => {
  try {
    const { invoicePostData, matState, formattedDate } = req.body;

    // 1️⃣ Get vendor ID
    const [vendorRow] = await pool.query(
      "SELECT id FROM vendorform WHERE supplier = ?",
      [invoicePostData.invoiceFormVendorName]
    );

    if (vendorRow.length === 0) {
      throw new Error("Vendor not found");
    }

    const vendorId = vendorRow[0].id;

    // 2️⃣ Insert into invoice table
    const insertInvoiceQuery = `
      INSERT INTO invoice (invoice_number, invoice_date, vendor_id, received_date, submit_date)
      VALUES (?, ?, ?, ?, ?)
    `;

    await pool.query(insertInvoiceQuery, [
      invoicePostData.invoiceFormInvoiceId,
      invoicePostData.invoiceFormInvoiceDate,
      vendorId,
      invoicePostData.invoiceFormReceivedDate,
      formattedDate
    ]);

    // 3️⃣ Process each material
    for (const { materialName, receivedQty } of matState) {

      // ✅ FIXED: USE material_master
      const [materialRow] = await pool.query(
        "SELECT part_id FROM material_master WHERE description = ?",
        [materialName]
      );

      if (materialRow.length === 0) {
        console.warn(`Material not found: ${materialName}`);
        continue;
      }

      const partId = materialRow[0].part_id;

      const stock_material_id = `${invoicePostData.invoiceFormInvoiceId}_${vendorId}_${partId}`;

      // ✅ FIXED: USE stock (NOT stocktable)
      const [previousStock] = await pool.query(
        "SELECT closing_balance FROM stock WHERE material_name = ? ORDER BY id DESC LIMIT 1",
        [materialName]
      );

      let openingStock = 0;

      if (previousStock.length > 0) {
        openingStock = previousStock[0].closing_balance;
      }

      let closingBalance = openingStock + parseInt(receivedQty);

      // ✅ FIXED: INSERT INTO stock
      const insertStockQuery = `
        INSERT INTO stock
        (opening_stock, closing_balance, invoice_number, MRID, stock_material_id, material_name, approved_qty)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;

      await pool.query(insertStockQuery, [
        openingStock,
        closingBalance,
        invoicePostData.invoiceFormInvoiceId,
        null,
        stock_material_id,
        materialName,
        null
      ]);

      console.log(`Stock updated for ${materialName}`);
    }

    res.status(200).json({ message: "Invoice & Stock saved successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});



app.get("/openingStock", async (req, res) => {
  try {
    const { materialName } = req.query;

    let query = "SELECT * FROM stock";
    let values = [];

    if (materialName) {
      query += " WHERE material_name = ?";
      values = [materialName];
    }

    const openingStockResult = await pool.query(query, values);
    console.log(openingStockResult[0]);

    res.status(200).send({
      data: openingStockResult[0],
    });
  } catch (err) {
    res.status(500).send({ err: err.message });
  }
});



app.get("/getcompletestockdata", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT * FROM stock
      ORDER BY updated_at DESC
    `);

    res.json({ data: rows });

  } catch (error) {
    console.error("GET COMPLETE STOCK ERROR:", error.message);
    res.status(500).json({ error: error.message });
  }
});



app.get('/getinstockqtyandclosingbalance', async (req, res) => {
  try {
    const stockMaterialId = req.query.stockMaterialId;

    // Use the connection pool to execute a query
    const [rows] = await pool.execute(
      'SELECT opening_stock, closing_balance FROM stock WHERE stock_material_id = ?',
      [stockMaterialId]
    );

    // Check if a row was found
    if (rows.length === 1) {
      const result = rows[0];
      res.json({
        instockQty: result.opening_stock,
        closingBalance: result.closing_balance,
      });
    } else {
      res.json({
        instockQty: 0,
        closingBalance: 0,
      });
    }
  } catch (error) {
    console.error('Error fetching Instock Qty and Closing Balance:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// search for materail id in completee stock form
app.get("/api/materials/:materialId", async (req, res) => {
  const materialId = req.params.materialId;
  console.log("materialId:", JSON.stringify(materialId));
  try {
    const [result] = await pool.query(
      "SELECT * FROM material WHERE material_id = ?",
      [materialId],
      (error, results) => {
        if (error) {
          console.error("Error querying the database: " + error.message);
          res.status(500).json({ error: "Internal server error" });
          return;
        }
        if (results.length === 0) {
          res.status(404).json({ error: "Material not found in the database" });
        } else {
          const data = results[0];
          res.json(data);
        }
      }
    );
    console.log(result[0]);
    res.status(200).send({
      data: result[0],
    });
  } catch (error) {
    console.error("Error fetching material data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


// invoice form data to data base
app.get("/stockData", async (req, res) => {
  try {
    const materialResult = await pool.query("select * from stock", []);
    console.log(materialResult[0]);
    res.status(200).send({
      data: materialResult[0],
    });
  } catch (err) {
    res.status(500).send({ err: err.message });
  }
});
//fetcing data from employee table from data base
app.get("/employee", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        EmployeeID,
        EmployeeName
      FROM employee
      WHERE Status = 'Active'
    `);

    res.json({ data: rows });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});



app.post("/api/material-request", async (req, res) => {
  try {
    const { requestDate, requestedBy, materialInputs } = req.body;
    // console.log(materialInputs)
    // Find the EmployeeID based on the requestedBy name
    const [employeeRow] = await pool.query(
      "SELECT EmployeeID FROM employee WHERE EmployeeName = ?",
      [requestedBy]
    );
    if (employeeRow.length === 0) {
      res.status(404).json({ error: "Employee not found in the database" });
      return;
    }
    const employeeID = employeeRow[0].EmployeeID;
    // Generate a unique MRID
    const MRID = `MR${Math.floor(Math.random() * 100000000)
      .toString()
      .padStart(6, "0")}`;
    // Insert the material request into the database
    // console.log(MRID)
    const insertQuery =
      "INSERT INTO materialrequest (MRID, EmployeeID, Date, Status , deny_reason) VALUES (?, ?, ?, ?,?)";
    const values = [MRID, employeeID, requestDate, "Pending", null];
    console.log(values)
    try {
      await pool.query(insertQuery, values);
      const materialInsertQuery = "INSERT INTO materialrequesttemplate (MRID, material_iD, issued_qty, material_name) VALUES (?, ?, ?,?)";
      for (const { name, qty } of materialInputs) {
        // Retrieve the material ID based on the material name
        const [materialRow] = await pool.query(
          "SELECT material_id FROM material WHERE material_name = ?",
          [name]
        );
        if (materialRow.length > 0) {
          const materialID = materialRow[0].material_id;
          // Insert the data into the materialrequesttemplate table
          await pool.query(materialInsertQuery, [MRID, materialID, qty, name]);
        } else {
          console.error(`Material with name ${name} not found.`);
          // Handle the case where the material is not found in the material table
          return res.status(400).json({ error: `Material with name ${name} not found` });
        }
      }
      return res.status(200).json({ message: "Material request submitted successfully", MRID });
    } catch (error) {
      console.error("Error inserting into the database:", error);
      return res.status(500).json({ error: "An error occurred while processing your request" });
    }
  } catch (error) {
    console.error("Error in the try-catch block:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});


app.post('/approveRequestStockChange', async (req, res) => {
  try {
    const { materialData, stockData, formattedDate } = req.body;
    console.log(materialData)
    console.log(stockData)

    for (const stockItem of stockData) {
      if (stockItem.enterQtyToApprove > 0) {
        // Find MRIDs for the corresponding material_id from materialdata
        const matchingMaterialData = materialData.find(
          (material) => material.material_iD === stockItem.material_id
        );

        if (matchingMaterialData) {
          const MRID = matchingMaterialData.MRID;

          // Update closing balance and opening stock based on enterQtyToApprove
          const updatedClosingBalance = stockItem.closing_balance - stockItem.enterQtyToApprove;
          const updatedOpeningStock = stockItem.closing_balance;

          // Insert a new row into stocktable for the found MRID
          await pool.query(
            `INSERT INTO stock (opening_stock, closing_balance, invoice_number, MRID, stock_material_id, material_name,approved_qty) 
             VALUES (?, ?, ?, ?, ?, ?,?)`,
            [
              updatedOpeningStock,
              updatedClosingBalance,
              stockItem.invoice_number,
              // null,
              MRID,
              stockItem.stock_material_id,
              stockItem.material_name,
              stockItem.enterQtyToApprove
            ]
          );

          // Update the status in the materialrequest table
          await pool.query(
            `UPDATE materialrequest
             SET status = 'Approved'
             WHERE MRID = ?`,
            [MRID]
          );
        }
      }
    }

    return res.status(200).json({ message: 'Data successfully sent' });
  } catch (error) {
    console.error('Error in the try-catch block:', error.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
});



app.post('/denyRequest', async (req, res) => {
  try {
    const { approveRowData, denyReason } = req.body;
    console.log(`Request Id: ${JSON.stringify(approveRowData)}`);

    // Update the status and set the deny reason in the existing record
    await pool.query(
      `UPDATE materialrequest
       SET status = 'Denied', deny_reason = ?
       WHERE MRID = ?`,
      [denyReason, approveRowData]
    );

    return res.status(200).json({ message: "Material request denied successfully", MRID: approveRowData });
  } catch (err) {
    console.error('Error in denyRequest:', err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// HISTORY API
app.get("/materialHistory/:partId", async (req, res) => {
  const partId = req.params.partId;

  try {
    const [history] = await pool.query(`
      SELECT 
        s.part_id,
        s.material_name,
        s.opening_stock,
        s.closing_balance,
        s.approved_qty,
        s.invoice_number,
        i.invoice_date,
        mr.requested_by,
        mr.request_date,
        p.ProjectName
      FROM stock s

      LEFT JOIN invoice i 
        ON s.invoice_number = i.invoice_number

      -- Latest request per part
      LEFT JOIN material_request mr 
        ON mr.request_id = (
          SELECT MAX(request_id)
          FROM material_request
          WHERE part_id = s.part_id
        )

      -- Correct project mapping
      LEFT JOIN projecttemplate t
        ON t.material_name = s.material_name

      LEFT JOIN projecttable p
        ON p.project_id = t.project_id

      WHERE s.part_id = ?
      ORDER BY s.updated_at DESC
    `, [partId]);

    res.json(history);
  } catch (err) {
    console.log("Material History Error:", err);
    res.status(500).json({ error: err.message });
  }
});



// sending data to request table or request.jsx 
app.get('/requestData', async (req, res) => {
  try {
    // Retrieve data from materialrequest table
    const requestResult = await pool.query("SELECT * FROM materialrequest", []);
    // Retrieve data from materialrequesttemplate table
    const templateResult = await pool.query("SELECT * FROM materialrequesttemplate", []);
    // Iterate through the request results and retrieve employee names
    const requestDataWithEmployeeNames = await Promise.all(
      requestResult[0].map(async (request) => {
        const employeeID = request.EmployeeID;
        const [employeeRow] = await pool.query(
          "SELECT EmployeeName, EmployeeDept FROM employee WHERE EmployeeID = ?",
          [employeeID]
        );
        const employeeName = employeeRow[0].EmployeeName;
        const employeeDept = employeeRow[0].EmployeeDept
        // Find the corresponding template data based on MRID
        const templateData = templateResult[0].filter((template) => template.MRID === request.MRID);
        return {
          ...request,
          EmployeeDept: employeeDept,
          EmployeeName: employeeName, // Add EmployeeName to the request data
          TemplateData: templateData, // Add template data to the request data
        };
      })
    );
    // console.log(data)
    res.status(200).send({
      data: requestDataWithEmployeeNames,
    });
  } catch (err) {
    res.status(500).send({ err: err.message });
  }
});


app.get("*", (req, res) => {
  res.status(404).send("Page not found");
});

app.listen(port, IP_ADDRESS, () => {
  console.log(`Server is running on http://${IP_ADDRESS}:${port}`);
});

// app.listen(port, () => {
//   // console.log(`Server is running on http://${IP_ADDRESS}:${port}`);
//   console.log( `server is started`)
// });
