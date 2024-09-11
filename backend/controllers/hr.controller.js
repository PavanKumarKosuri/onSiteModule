// backend\controllers\hr.controller.js
const { db } = require("../config/db.config");
const { v4: uuidv4 } = require("uuid");
const xlsx = require("xlsx");

const eligibleEmployees = async (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }

  try {
    const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
    const sheetNameList = workbook.SheetNames;
    const xlData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetNameList[0]]);

    const getCurrentDataQuery =
      "SELECT employeeId, name, phoneNumber FROM eligibleusers";

    db.query(getCurrentDataQuery, (err, currentData) => {
      if (err) {
        console.error("Error fetching current data from MySQL:", err);
        return res.status(500).send("Error fetching current data.");
      }

      const currentDataMap = currentData.reduce((acc, row) => {
        acc[row.employeeId] = row;
        return acc;
      }, {});

      const valuesToUpdate = [];
      const valuesToInsert = [];

      xlData.forEach((row) => {
        const currentRow = currentDataMap[row.employeeId];
        if (currentRow) {
          if (
            currentRow.name !== row.name ||
            currentRow.phoneNumber !== row.phoneNumber
          ) {
            valuesToUpdate.push([row.name, row.phoneNumber, row.employeeId]);
          }
        } else {
          valuesToInsert.push([row.employeeId, row.name, row.phoneNumber]);
        }
      });

      if (valuesToInsert.length > 0) {
        const insertQuery = `
          INSERT INTO eligibleusers (employeeId, name, phoneNumber) 
          VALUES ?`;

        db.query(insertQuery, [valuesToInsert], (err, result) => {
          if (err) {
            console.error("Error inserting data into MySQL:", err);
            return res.status(500).send("Error uploading data.");
          }
          if (valuesToUpdate.length === 0) {
            return res
              .status(200)
              .send("File uploaded and data inserted successfully.");
          }

          handleUpdate();
        });
      } else {
        handleUpdate();
      }

      function handleUpdate() {
        if (valuesToUpdate.length > 0) {
          const updatePromises = valuesToUpdate.map((row) => {
            const updateQuery = `
              UPDATE eligibleusers 
              SET name = ?, phoneNumber = ?
              WHERE employeeId = ?`;

            return new Promise((resolve, reject) => {
              db.query(updateQuery, row, (err, result) => {
                if (err) {
                  console.error("Error updating data in MySQL:", err);
                  reject(err);
                } else {
                  resolve(result);
                }
              });
            });
          });

          Promise.all(updatePromises)
            .then(() => {
              res
                .status(200)
                .send("File uploaded and data updated successfully.");
            })
            .catch((err) => {
              res.status(500).send("Error uploading data.");
            });
        } else {
          res.status(200).send("File uploaded and no updates needed.");
        }
      }
    });
  } catch (error) {
    console.error("Error processing file upload:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const uploadExcel = async (req, res) => {
  const data = req.body.data;

  if (!data || !Array.isArray(data)) {
    return res.status(400).json({ error: "Invalid data format" });
  }

  const processedData = [];
  const skippedData = [];
  let processedCount = 0;

  for (const row of data) {
    const { empid, email, name, phonenumber, city, companyname } = row;
    let { uniquekey } = row;

    if (!empid || !email || !name || !phonenumber || !city || !companyname) {
      skippedData.push(row);
      continue;
    }

    if (!uniquekey) {
      uniquekey = uuidv4();
    }

    try {
      const [existing] = await queryPromise(
        "SELECT uniquekey FROM hrdata WHERE empid = ? OR email = ?",
        [empid, email]
      );

      if (existing && existing.uniquekey) {
        skippedData.push({ ...row, uniquekey: existing.uniquekey });
        continue;
      }

      await queryPromise("INSERT INTO hrdata SET ?", {
        empid,
        email,
        name,
        phonenumber,
        city,
        companyname,
        uniquekey,
      });

      processedData.push({ ...row, uniquekey });
      processedCount++;
    } catch (error) {
      console.error("Error processing row:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  res.json({ processedData, skippedData, processedCount });
};

const getAllHrData = (req, res) => {
  const { empid, name, city, companyname } = req.query;
  let query = "SELECT * FROM hrdata WHERE 1=1";
  const params = [];

  if (empid) {
    query += " AND empid = ?";
    params.push(empid);
  }
  if (name) {
    query += " AND name LIKE ?";
    params.push(`%${name}%`);
  }
  if (city) {
    query += " AND city LIKE ?";
    params.push(`%${city}%`);
  }
  if (companyname) {
    query += " AND companyname LIKE ?";
    params.push(`%${companyname}%`);
  }

  db.query(query, params, (err, results) => {
    if (err) {
      console.error("Error fetching HR data:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
    res.json(results);
  });
};

const updateHrData = (req, res) => {
  const { id } = req.params;
  const updatedHr = req.body;

  db.query(
    "UPDATE hrdata SET ? WHERE id = ?",
    [updatedHr, id],
    (err, result) => {
      if (err) {
        console.error("Error updating HR data:", err);
        return res.status(500).json({ error: "Internal server error" });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "HR data not found" });
      }
      res.json({ message: "HR data updated successfully" });
    }
  );
};

const addHrData = (req, res) => {
  const newHr = req.body;

  db.query("INSERT INTO hrdata SET ?", newHr, (err, result) => {
    if (err) {
      console.error("Error adding HR data:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
    res.json({ message: "HR data added successfully", id: result.insertId });
  });
};

const deleteHrData = (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM hrdata WHERE id = ?", [id], (err, result) => {
    if (err) {
      console.error("Error deleting HR data:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "HR data not found" });
    }
    res.json({ message: "HR data deleted successfully" });
  });
};

const getUniqueKey = (req, res) => {
  const { empid, email } = req.query;

  if (!empid || !email) {
    return res.status(400).json({ error: "Missing empid or email parameter" });
  }

  db.query(
    "SELECT uniquekey FROM hrdata WHERE empid = ? AND email = ?",
    [empid, email],
    (err, results) => {
      if (err) {
        console.error("Error fetching unique key:", err);
        return res.status(500).json({ error: "Internal server error" });
      }

      if (results.length > 0) {
        res.json({ uniquekey: results[0].uniquekey });
      } else {
        const uniquekey = uuidv4();
        res.json({ uniquekey });
      }
    }
  );
};

const getLastEntries = (req, res) => {
  const { count } = req.query;

  if (!count) {
    return res.status(400).json({ error: "Missing count parameter" });
  }

  db.query(
    "SELECT * FROM hrdata ORDER BY id DESC LIMIT ?",
    [parseInt(count, 10)],
    (err, results) => {
      if (err) {
        console.error("Error fetching last entries:", err);
        return res.status(500).json({ error: "Internal server error" });
      }

      res.json(results);
    }
  );
};

const validateHr = (req, res) => {
  const { city, companyName, uniqueKey } = req.params;

  const query =
    "SELECT * FROM hrdata WHERE city = ? AND companyname = ? AND uniquekey = ?";
  db.query(query, [city, companyName, uniqueKey], (err, results) => {
    if (err) {
      console.error("Error executing query:", err);
      res.status(500).send("Internal Server Error");
    } else if (results.length > 0) {
      res.status(200).send("Valid HR");
    } else {
      res.status(404).send("Not Found");
    }
  });
};

function queryPromise(query, params) {
  return new Promise((resolve, reject) => {
    db.query(query, params, (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
}

module.exports = {
  eligibleEmployees,
  uploadExcel,
  getAllHrData,
  updateHrData,
  addHrData,
  deleteHrData,
  getUniqueKey,
  getLastEntries,
  validateHr,
};
