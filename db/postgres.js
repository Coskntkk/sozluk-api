require("dotenv").config();
const debug = require("debug")("sql");
const Sequelize = require("sequelize");

const DB_ENV_KEYS = [
  "DB_USER",
  "DB_PASSWORD",
  "DB_ADDRESS",
  "DB_PORT",
  "DB_NAME",
];

const missingDbEnv = DB_ENV_KEYS.filter((key) => !process.env[key]);
if (missingDbEnv.length > 0) {
  console.error(
    "Missing database environment variables:",
    missingDbEnv.join(", "),
  );
  console.error(
    "Create a .env file in the project root (see .env.example):\n  cp .env.example .env",
  );
  process.exit(1);
}

const pdb = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  adres: process.env.DB_ADDRESS,
  port: parseInt(process.env.DB_PORT, 10),
  dbname: process.env.DB_NAME,
};

if (Number.isNaN(pdb.port)) {
  console.error("DB_PORT must be a valid number.");
  process.exit(1);
}

const purl = `postgres://${pdb.user}:${pdb.password}@${pdb.adres}:${pdb.port}/${pdb.dbname}`;

const postgres = new Sequelize(purl, {
  logging: debug,
  define: {
    underscored: true,
    freezeTableName: true,
    timestamps: true,
  },
  pool: {
    max: 10,
    min: 0,
    idle: 20000,
    acquire: 120000,
  },
});

const testDbConnection = async (dbName, strValue) => {
  try {
    console.log(`Connecting to ${strValue}...`);
    await dbName.authenticate();
    console.log(`Connected to ${strValue} succesfully at`, new Date());
  } catch (error) {
    console.error(`Unable to connect to the ${strValue}:`, error.message);
    process.exit(1);
  }
};

function syncPrimary() {
  return postgres.sync({ force: false });
}

testDbConnection(postgres, pdb.dbname);
postgres.didSync = syncPrimary().catch((error) => {
  console.error("Database sync failed:", error.message);
  process.exit(1);
});

module.exports = postgres;
