const { db } = require("../config/db.config");

const filterUsers = (req, res) => {
  const {
    phoneNumber,
    patientName,
    employeeId,
    reportsPending,
    city,
    companyName,
  } = req.query;
  let sql = "SELECT * FROM users WHERE 1=1";
  const params = [];

  if (phoneNumber) {
    sql += " AND phoneNumber = ?";
    params.push(phoneNumber);
  }

  if (patientName) {
    sql += " AND patientName LIKE ?";
    params.push(`${patientName}`);
  }

  if (employeeId) {
    sql += " AND employeeId = ?";
    params.push(employeeId);
  }

  if (reportsPending !== undefined && reportsPending !== "") {
    sql += " AND ReportsTaken = ?";
    params.push(reportsPending);
  }

  if (city) {
    sql += " AND city = ?";
    params.push(city);
  }

  if (companyName) {
    sql += " AND companyName = ?";
    params.push(companyName);
  }

  db.query(sql, params, (err, results) => {
    if (err) {
      console.error("Error retrieving filtered users:", err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }
    res.status(200).json(results);
  });
};

const generateQr = (req, res) => {
  const { city, companyName, packages } = req.body;

  if (!city || !companyName || !packages) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  let packagesArray;
  try {
    packagesArray = JSON.parse(packages);
  } catch (error) {
    console.error("Error parsing packages JSON:", error);
    return res.status(400).json({ error: "Invalid packages format" });
  }

  const filledPackages = packagesArray.filter((pkg) => pkg.value !== "");
  if (filledPackages.length < 2) {
    return res
      .status(400)
      .json({ error: "At least two packages must be provided" });
  }

  const mainQuery = `INSERT INTO generateqr (city, companyName) VALUES (?, ?)`;

  db.query(mainQuery, [city, companyName], (error, result) => {
    if (error) {
      console.error("Error inserting main data:", error.sqlMessage || error);
      return res.status(500).json({ error: "Error inserting main data" });
    }

    const generateqrId = result.insertId;

    const packageQueries = filledPackages.map((pkg) => {
      return new Promise((resolve, reject) => {
        const packageQuery = `INSERT INTO packages (generateqr_id, packageName) VALUES (?, ?)`;
        db.query(
          packageQuery,
          [generateqrId, pkg.value],
          (error, packageResult) => {
            if (error) {
              console.error(
                "Error inserting package:",
                error.sqlMessage || error
              );
              reject("Error inserting package");
            }

            const packageId = packageResult.insertId;
            const subPackageQueries = pkg.subPackages
              .filter((subPkg) => subPkg.value !== "")
              .map((subPkg) => {
                return new Promise((subResolve, subReject) => {
                  const subPackageQuery = `INSERT INTO subPackages (package_id, subPackageName) VALUES (?, ?)`;
                  db.query(
                    subPackageQuery,
                    [packageId, subPkg.value],
                    (error) => {
                      if (error) {
                        console.error(
                          "Error inserting sub-package:",
                          error.sqlMessage || error
                        );
                        subReject("Error inserting sub-package");
                      } else {
                        subResolve();
                      }
                    }
                  );
                });
              });

            Promise.all(subPackageQueries)
              .then(() => resolve())
              .catch(() => reject());
          }
        );
      });
    });

    Promise.all(packageQueries)
      .then(() =>
        res.status(200).json({ message: "QR data received", generateqrId })
      )
      .catch(() =>
        res.status(500).json({ error: "Error inserting packages/sub-packages" })
      );
  });
};

const fetchDashboardData = (req, res) => {
  const { city, companyName } = req.query;

  let totalUsersQuery = "SELECT COUNT(*) AS totalUsers FROM users";
  let samplesCollectedQuery =
    "SELECT COUNT(*) AS samplesCollected FROM users WHERE reportsTaken = 1";
  let samplesPendingQuery =
    "SELECT COUNT(*) AS samplesPending FROM users WHERE reportsTaken = 0";

  let conditions = [];

  if (city) {
    conditions.push(`city =?`);
  }

  if (companyName) {
    conditions.push(`companyName =?`);
  }

  if (conditions.length > 0) {
    totalUsersQuery += ` WHERE ${conditions.join(" AND ")}`;
    samplesCollectedQuery += ` AND ${conditions.join(" AND ")}`;
    samplesPendingQuery += ` AND ${conditions.join(" AND ")}`;
  }

  db.query(
    totalUsersQuery,
    conditions.map((condition) => {
      if (condition.includes("city")) {
        return city;
      } else {
        return companyName;
      }
    }),
    (error, totalUsersResult) => {
      if (error) {
        console.error("Error fetching total users:", error);
        return res.status(500).json({ error: "Error fetching total users" });
      }

      db.query(
        samplesCollectedQuery,
        conditions.map((condition) => {
          if (condition.includes("city")) {
            return city;
          } else {
            return companyName;
          }
        }),
        (error, samplesCollectedResult) => {
          if (error) {
            console.error("Error fetching samples collected:", error);
            return res
              .status(500)
              .json({ error: "Error fetching samples collected" });
          }

          db.query(
            samplesPendingQuery,
            conditions.map((condition) => {
              if (condition.includes("city")) {
                return city;
              } else {
                return companyName;
              }
            }),
            (error, samplesPendingResult) => {
              if (error) {
                console.error("Error fetching samples pending:", error);
                return res
                  .status(500)
                  .json({ error: "Error fetching samples pending" });
              }

              res.json({
                totalUsers: totalUsersResult[0].totalUsers,
                samplesCollected: samplesCollectedResult[0].samplesCollected,
                samplesPending: samplesPendingResult[0].samplesPending,
              });
            }
          );
        }
      );
    }
  );
};

const getCityOptions = (req, res) => {
  const { query } = req.query;
  const cityOptionsQuery = `SELECT DISTINCT city FROM users WHERE city LIKE ?`;
  db.query(cityOptionsQuery, [`%${query}%`], (error, results) => {
    if (error) {
      console.error("Error fetching city options:", error);
      return res.status(500).json({ error: "Error fetching city options" });
    }
    res.json(results.map((row) => ({ id: row.city, name: row.city })));
  });
};

const getCompanyNameOptions = (req, res) => {
  const { query } = req.query;
  const companyNameOptionsQuery = `SELECT DISTINCT companyName FROM users WHERE companyName LIKE ?`;
  db.query(companyNameOptionsQuery, [`%${query}%`], (error, results) => {
    if (error) {
      console.error("Error fetching company name options:", error);
      return res
        .status(500)
        .json({ error: "Error fetching company name options" });
    }
    res.json(
      results.map((row) => ({ id: row.companyName, name: row.companyName }))
    );
  });
};

const verifyEmployee = (req, res) => {
  const employeeId = req.query.employeeId;

  const query = "SELECT name FROM eligibleusers WHERE employeeId = ?";
  db.query(query, [employeeId], (error, results) => {
    if (error) {
      return res.status(500).send({ isValid: false });
    }

    if (results.length > 0) {
      return res.status(200).send({ isValid: true, name: results[0].name });
    } else {
      return res.status(200).send({ isValid: false });
    }
  });
};

module.exports = {
  filterUsers,
  generateQr,
  fetchDashboardData,
  getCityOptions,
  getCompanyNameOptions,
  verifyEmployee,
};
