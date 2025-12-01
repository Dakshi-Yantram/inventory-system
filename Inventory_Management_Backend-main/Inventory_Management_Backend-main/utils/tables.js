const vendor = `CREATE TABLE vendorform (
  id INT AUTO_INCREMENT PRIMARY KEY,
  supplier VARCHAR(255),
  date DATE,
  office_address VARCHAR(255),
  office_contact_person VARCHAR(255),
  office_designation VARCHAR(255),
  office_telephone VARCHAR(20),
  office_email VARCHAR(255),
  office_fax VARCHAR(20),
  work_address VARCHAR(255),
  work_contact_person VARCHAR(255),
  work_designation VARCHAR(255),
  work_telephone VARCHAR(20),
  work_email VARCHAR(255),
  work_fax VARCHAR(20),
  business VARCHAR(255),
  product VARCHAR(255),
  iso_certified VARCHAR(255),
  relevant_field VARCHAR(255),
  major_client VARCHAR(255),
  order_date DATE,
  Lead_time VARCHAR(255),
  vendor_id VARCHAR(50)
);
`

const employee = `CREATE TABLE employee (
  EmployeeID VARCHAR(10) PRIMARY KEY,
  EmployeeName VARCHAR(255),
  EmployeeDept VARCHAR(255)
);`

const material = `CREATE TABLE material (
  material_id VARCHAR(30) PRIMARY KEY,
  material_name VARCHAR(200),
  barcode_no VARCHAR(50),
  category VARCHAR(50),
  type VARCHAR(255),
  description VARCHAR(255),
  value VARCHAR(255),
  package VARCHAR(255)
);
`
const materialrequest = `CREATE TABLE materialrequest (
  MRID VARCHAR(30) PRIMARY KEY,
  EmployeeID VARCHAR(10),
  Date DATE,
  Status VARCHAR(50),
  deny_reason VARCHAR(255),
  FOREIGN KEY (EmployeeID) REFERENCES employee(EmployeeID)
);
`



const materialrequesttemplate = `CREATE TABLE materialrequesttemplate (
  id INT AUTO_INCREMENT PRIMARY KEY,
  MRID VARCHAR(20),
  material_iD VARCHAR(20),
  issued_qty INT,
  material_name VARCHAR(30),
  FOREIGN KEY (MRID) REFERENCES materialrequest(MRID),
  FOREIGN KEY (material_iD) REFERENCES material(material_id)
);
`

const invoice = `CREATE TABLE invoice (
  invoice_number VARCHAR(30) PRIMARY KEY,
  invoice_date DATE,
  received_date DATE,
  submit_date DATE,
  vendor_id INT,
  FOREIGN KEY (vendor_id) REFERENCES vendorform(id)
);

`

const invoicetemplate = `CREATE TABLE invoicetemplate (
  idnum INT AUTO_INCREMENT PRIMARY KEY,
  material_id VARCHAR(30),
  received_qty INT,
  invoice_number VARCHAR(30),
  FOREIGN KEY (material_id) REFERENCES material(material_id),
  FOREIGN KEY (invoice_number) REFERENCES invoice(invoice_number)
);
`



const stocktable = `CREATE TABLE stocktable (
    stock_id INT AUTO_INCREMENT PRIMARY KEY,
    opening_stock INT,
    closing_balance INT,
    invoice_number VARCHAR(30),
    MRID VARCHAR(30),
    stock_material_id VARCHAR(100),
    material_name VARCHAR(200),
    approved_qty INT,
    FOREIGN KEY (MRID) REFERENCES materialrequest(MRID),
    FOREIGN KEY (invoice_number) REFERENCES invoice(invoice_number)
);
`


const projecttable = `CREATE TABLE projecttable (
  project_id INT AUTO_INCREMENT PRIMARY KEY,
  ProjectName VARCHAR(100),
  AddedOn DATE,
  UpdatedOn DATE
);
`

const projecttemplate = `CREATE TABLE projecttemplate (
  ID INT AUTO_INCREMENT PRIMARY KEY,
  project_id INT,
  material_name VARCHAR(30),
  qty_pcb INT,
  ExtraPercentage INT,
  material_id VARCHAR(30),
  FOREIGN KEY (project_id) REFERENCES projecttable(project_id),
  FOREIGN KEY (material_id) REFERENCES material(material_id)
);
`


