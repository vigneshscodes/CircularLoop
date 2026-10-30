import dotenv from "dotenv";
import { getDriver, closeDriver } from "../config/db.js";
dotenv.config();
const constraints=[
  "CREATE CONSTRAINT item_id IF NOT EXISTS FOR (n:Item) REQUIRE n.id IS UNIQUE",
  "CREATE CONSTRAINT component_id IF NOT EXISTS FOR (n:Component) REQUIRE n.id IS UNIQUE",
  "CREATE CONSTRAINT material_id IF NOT EXISTS FOR (n:Material) REQUIRE n.id IS UNIQUE",
  "CREATE CONSTRAINT action_id IF NOT EXISTS FOR (n:Action) REQUIRE n.id IS UNIQUE",
  "CREATE CONSTRAINT facility_id IF NOT EXISTS FOR (n:Facility) REQUIRE n.id IS UNIQUE",
  "CREATE CONSTRAINT category_id IF NOT EXISTS FOR (n:Category) REQUIRE n.id IS UNIQUE"
];
try {
  const driver=getDriver(); await driver.verifyConnectivity();
  const session=driver.session({database:process.env.NEO4J_DATABASE||"neo4j"});
  try { for(const query of constraints) { await session.run(query); console.log("Applied:",query); } }
  finally { await session.close(); }
  console.log("CircularLoop schema ready.");
} catch(error) { console.error("Schema setup failed:",error.message); process.exitCode=1; }
finally { await closeDriver(); }
