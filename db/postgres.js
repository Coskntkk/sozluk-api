const debug = require("debug")("sql");
const Sequelize = require("sequelize");

// Set up database credentials
let pdb = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  adres: process.env.DB_ADDRESS,
  port: parseInt(process.env.DB_PORT),
  dbname: process.env.DB_NAME,
};

// Create a new instance of a database connection
const purl = `postgres://${pdb.user}:${pdb.password}@${pdb.adres}:${pdb.port}/${pdb.dbname}`;

// Connect to the database
const postgres = new Sequelize(purl, {
  logging: debug, // export DEBUG=sql in the environment to get SQL queries
  define: {
    underscored: true, // use snake_case rather than camelCase column names
    freezeTableName: true, // don't change table names from the one specified
    timestamps: true, // automatically include timestamp columns
  },
  pool: {
    max: 10,
    min: 0,
    idle: 20000,
    acquire: 120000,
  },
  query: {
    // raw: true
    // nest: true
    // make sure to use raw: true, nest: true in all queries
  },
});

// Test the connection
const testDbConnection = async (dbName, strValue) => {
  try {
    console.log(`Connecting to ${strValue}...`);
    await dbName.authenticate();
    console.log(`Connected to ${strValue} succesfully at`, new Date());
  } catch (error) {
    console.error(`Unable to connect to the ${strValue}:`, error);
  }
};
function syncPrimary(/*retries = 0, maxRetries = 5*/) {
  return postgres.sync({ force: false });
}

testDbConnection(postgres, pdb.dbname);
postgres.didSync = syncPrimary();

module.exports = postgres;
