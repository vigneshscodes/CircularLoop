import neo4j from "neo4j-driver";
import dotenv from "dotenv";
dotenv.config();

const { NEO4J_URI, NEO4J_USERNAME, NEO4J_PASSWORD, NEO4J_DATABASE = "neo4j" } = process.env;
let driver;

export function getDriver() {
  if (!driver) {
    if (!NEO4J_URI || !NEO4J_USERNAME || !NEO4J_PASSWORD) {
      throw new Error("Neo4j is not configured. Set NEO4J_URI, NEO4J_USERNAME and NEO4J_PASSWORD.");
    }
    driver = neo4j.driver(NEO4J_URI, neo4j.auth.basic(NEO4J_USERNAME, NEO4J_PASSWORD), {
      maxConnectionPoolSize: 20,
      connectionAcquisitionTimeout: 10000
    });
  }
  return driver;
}
export async function readQuery(cypher, params = {}) {
  const session = getDriver().session({ database: process.env.NEO4J_DATABASE || "neo4j", defaultAccessMode: neo4j.session.READ });
  try { return await session.executeRead(tx => tx.run(cypher, params)); }
  finally { await session.close(); }
}
export async function writeQuery(cypher, params = {}) {
  const session = getDriver().session({ database: process.env.NEO4J_DATABASE || "neo4j" });
  try { return await session.executeWrite(tx => tx.run(cypher, params)); }
  finally { await session.close(); }
}
export async function closeDriver() {
  if (driver) { await driver.close(); driver = undefined; }
}
export { neo4j };
