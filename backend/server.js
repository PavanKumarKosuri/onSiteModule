process.env.TZ = 'Asia/Kolkata';
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const compression = require("compression");
const dotenv = require("dotenv");

dotenv.config();

const adminRoutes = require("./routes/admin.routes");
const ltRoutes = require("./routes/lt.routes");
const userRoutes = require("./routes/user.routes");
const qrRoutes = require("./routes/qr.routes");
const flaboRoutes = require("./routes/flabo.routes");
const vendorRoutes = require("./routes/vendor.routes");
const hrRoutes = require("./routes/hr.routes");
const dashboardRoutes = require("./routes/dashboard.routes");

const app = express();
const port = 8080;

app.use(
  cors({
    origin: [
      "https://flabo.checkmed.in",
      "https://camp.checkmed.in",
      "https://manage.checkmed.in",
      "https://camps.checkmed.in",
    ],
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
  })
);

app.use(bodyParser.json());
app.use(helmet());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));
app.use(compression());

app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-store, must-revalidate");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,DELETE,PATCH,OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  next();
});

const { db } = require("./config/db.config");

function createDatabaseAndTables(callback) {
  db.query(`CREATE DATABASE IF NOT EXISTS labby;`, (err) => {
    if (err) {
      console.error("Error creating database:", err);
      return;
    }
    useDatabaseAndCreateTables(callback);
  });
}

function useDatabaseAndCreateTables(callback) {
  db.query(`USE labby;`, (err) => {
    if (err) {
      console.error("Error selecting database:", err);
      return;
    }
    createTablesSequentially(0, callback);
  });
}

const createTables = [
  `CREATE TABLE IF NOT EXISTS admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL
  );`,
  `CREATE TABLE IF NOT EXISTS eligibleusers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employeeId VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    phoneNumber VARCHAR(255) NOT NULL
  );`,
  `CREATE TABLE IF NOT EXISTS flabos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    unqId VARCHAR(255) NOT NULL,
    phoneNumber VARCHAR(255) NOT NULL,
    age INT,
    gender VARCHAR(10),
    placedCity VARCHAR(255),
    placedCompany VARCHAR(255),
    photo BLOB
  );`,
  `CREATE TABLE IF NOT EXISTS generateqr (
    id INT AUTO_INCREMENT PRIMARY KEY,
    city VARCHAR(255) NOT NULL,
    companyName VARCHAR(255) NOT NULL
  );`,
  `CREATE TABLE IF NOT EXISTS hrdata (
    id INT AUTO_INCREMENT PRIMARY KEY,
    empid VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    phonenumber VARCHAR(255) NOT NULL,
    city VARCHAR(255) NOT NULL,
    companyname VARCHAR(255) NOT NULL,
    uniquekey VARCHAR(255) NOT NULL
  );`,
  `CREATE TABLE IF NOT EXISTS ltadmin (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL
  );`,
  `CREATE TABLE IF NOT EXISTS packages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    generateqr_id INT NOT NULL,
    packageName VARCHAR(255) NOT NULL,
    FOREIGN KEY (generateqr_id) REFERENCES generateqr(id)
  );`,
  `CREATE TABLE IF NOT EXISTS subpackages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    package_id INT NOT NULL,
    subPackageName VARCHAR(255) NOT NULL,
    FOREIGN KEY (package_id) REFERENCES packages(id)
  );`,
  `CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    phoneNumber VARCHAR(255) NOT NULL,
    patientName VARCHAR(255),
    employeeId VARCHAR(255),
    email VARCHAR(255),
    age INT,
    gender VARCHAR(10),
    package VARCHAR(255),
    subPackage VARCHAR(255),
    bookingId VARCHAR(255),
    reportsTaken TINYINT(1),
    additionalInfo TEXT,
    city VARCHAR(255),
    companyName VARCHAR(255),
    timeslot VARCHAR(255)
  );`,
  `CREATE TABLE IF NOT EXISTS vendors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phoneNumber VARCHAR(255) NOT NULL,
    otherDetails TEXT
  );`,
];

function createTablesSequentially(index, callback) {
  if (index >= createTables.length) {
    callback();
    return;
  }

  db.query(createTables[index], (err) => {
    if (err) {
      console.error(`Error creating table ${index + 1}:`, err);
    }
    createTablesSequentially(index + 1, callback);
  });
}

function checkDatabaseExistsAndProceed(callback) {
  const checkDatabaseQuery = `SHOW DATABASES LIKE 'labby';`;

  db.query(checkDatabaseQuery, (err, results) => {
    if (err) {
      console.error("Error checking for database existence:", err);
      return;
    }

    if (results.length === 0) {
      createDatabaseAndTables(callback);
    } else {
      useDatabaseAndCreateTables(callback);
    }
  });
}

const adminController = require("./controllers/admin.controller");
const ltController = require("./controllers/lt.controller");

function initializeControllers() {
  adminController.createAdminUser();
  ltController.createLtUser();
}

// Routes
app.use("/api", adminRoutes);
app.use("/api", ltRoutes);
app.use("/api", userRoutes);
app.use("/api", qrRoutes);
app.use("/api", flaboRoutes);
app.use("/api", vendorRoutes);
app.use("/api", hrRoutes);
app.use("/api", dashboardRoutes);

// Check database and start server
checkDatabaseExistsAndProceed(() => {
  initializeControllers();
  app.listen(port, () => {
    console.log(`Server started on port: ${port}`);
  });
});
