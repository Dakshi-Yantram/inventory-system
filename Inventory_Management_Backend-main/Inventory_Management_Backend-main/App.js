const express = require("express");
const morgan = require("morgan");
const multer = require("multer");
const dotenv = require("dotenv");
const pool = require("./DataBase/Connection");
async function logAudit(username, action, partId, description) {
  await pool.query(
    `INSERT INTO audit_log (username, action, part_id, description)
     VALUES (?, ?, ?, ?)`,
    [username, action, partId, description]
  );
}


const XLSX = require("xlsx");
const cors = require("cors");
const app = express();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
dotenv.config();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("combined"));
app.use(cors());
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


const QRCode = require("qrcode");
app.get("/report/stock/excel", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT part_id, material_name, closing_balance, updated_at
      FROM stock
      ORDER BY updated_at DESC
    `);

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Stock Report");

    sheet.columns = [
      { header: "Part ID", key: "part_id" },
      { header: "Material Name", key: "material_name" },
      { header: "Closing Stock", key: "closing_balance" },
      { header: "Last Updated", key: "updated_at" }
    ];

    rows.forEach(row => sheet.addRow(row));

    res.setHeader("Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", "attachment; filename=stock_report.xlsx");

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    res.status(500).json({ error: err.message });
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

// ------------ DAILY PDF REPORT ------------
app.get("/report/pdf/daily", async (req, res) => {
  try {
    const [stock] = await pool.query(`SELECT part_id, closing_balance FROM stock ORDER BY updated_at DESC`);
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
      "SELECT * FROM stock WHERE part_id = ? ORDER BY id DESC LIMIT 1",
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
  const { username, password } = req.body;

  try {
    const [rows] = await pool.query(
      "SELECT id, username, role FROM users WHERE username = ? AND password = ?",
      [username, password]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    return res.status(200).json({
      message: "Login successful",
      user: rows[0],        // { id, username, role }
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
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




app.post('/procurementSummary', async (req, res) => {
  try {
    const result = req.body;
    console.log(result);

    const closingBalances = [];

    for (const entry of result) {
      const materialName = entry.materialName;

      // Step 1: Fetch all closing_balances from stock table based on materialName
      const closingBalanceQuery = 'SELECT closing_balance FROM stock WHERE material_name = ?';
      const [stockData] = await pool.query(closingBalanceQuery, [materialName]);

      // Default value for closing balance
      let closingBalance = 0;

      if (stockData && stockData.length > 0) {
        // Get the closing_balance of the last item retrieved
        closingBalance = stockData[stockData.length - 1].closing_balance;
      } else {
        console.warn(`Closing balance not found for materialName: ${materialName}. Setting closing balance to 0.`);
      }

      // Step 2: Add the closing_balance to the result array
      const resultEntry = {
        ...entry,
        closing_balance: closingBalance,
      };

      closingBalances.push(resultEntry);
    }

    console.log(closingBalances);
    res.status(200).json({ closingBalances });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to process request' });
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

app.get("/rawmaterial/categoty", async (req, res) => {
  try {
    // Assuming you have a database connection pool named 'pool'
    const materialResult = await pool.query("SELECT * FROM material", []);
    res.status(200).send({
      data: materialResult[0],
    });
  } catch (err) {
    res.status(500).send({ err: err.message });
  }
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
    const stockResult = await pool.query("SELECT * FROM stock", []);

    const dataWithInvoiceInfo = await Promise.all(
      stockResult[0].map(async (stockItem) => {
        const [invoiceResult] = await pool.query(
          "SELECT invoice_date, submit_date FROM invoice WHERE invoice_number = ?",
          [stockItem.invoice_number]
        );


        // Split the stock_material_id and get the last part as material_id
        // const materialIdParts = stockItem.stock_material_id.split('_').slice(2);

        // const materialId = materialIdParts[materialIdParts.length - 1];
        let materialId = null;

        if (stockItem.stock_material_id) {
          const parts = stockItem.stock_material_id.split('_');
          materialId = parts[2] || null;
        }



        // Query invoicetemplate to get the received_qty based on material_id
        // const [templateResult] = await pool.query(
        //   "SELECT received_qty FROM invoicetemplate WHERE material_id = ? AND invoice_number = ?",
        //   [materialId || 0, stockItem.invoice_number]
        // );
        const receivedQty = stockItem.quantity || null;

        // Query materialrequesttemplate to get the issue_qty based on MRID and material_id
        // const [requestTemplateResult] = await pool.query(
        //   "SELECT issued_qty FROM materialrequesttemplate WHERE MRID = ? AND material_id = ?",
        //   [stockItem.MRID || "", materialId || 0]
        // );

        return {
          ...stockItem,
          invoice_date: invoiceResult.length ? invoiceResult[0].invoice_date : null,
          submit_date: invoiceResult.length ? invoiceResult[0].submit_date : null,

          material_id: materialId,
          // received_qty: templateResult[0] ? templateResult[0].received_qty : null,
          received_qty: receivedQty,
          // issued_qty: requestTemplateResult[0] ? requestTemplateResult[0].issued_qty : null,
          issued_qty: stockItem.approved_qty || null,

        };
      })
    );

    // Filter data to get the last closing balance for each material_name
    const lastClosingBalance = {};
    dataWithInvoiceInfo.forEach((item) => {
      const { material_name, closing_balance } = item;
      if (!lastClosingBalance[material_name] || item.timestamp > lastClosingBalance[material_name].timestamp) {
        lastClosingBalance[material_name] = {
          closing_balance,
          timestamp: item.timestamp,
        };
      }
    });

    // Create an array with the last closing balance for each material_name
    const dataWithLastClosingBalance = dataWithInvoiceInfo.map((item) => ({
      ...item,
      last_closing_balance: lastClosingBalance[item.material_name].closing_balance,
    }));

    res.status(200).send({
      data: dataWithLastClosingBalance,
    });
  } catch (err) {
    res.status(500).send({ err: err.message });
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
    const employeeResult = await pool.query("select * from Employee", []);
    console.log(employeeResult[0]);
    res.status(200).send({
      data: employeeResult[0],
    });
  } catch (err) {
    res.status(500).send({ err: err.message });
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
