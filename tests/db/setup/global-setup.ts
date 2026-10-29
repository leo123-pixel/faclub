import type { TestProject } from "vitest/node";
import { applySql, migrationFiles, shimFiles, startCluster } from "./cluster";

declare module "vitest" {
  export interface ProvidedContext {
    dbUrl: string;
  }
}

export default async function setup(project: TestProject) {
  const cluster = await startCluster("pg-test", 54329);
  await applySql(cluster.url, [
    ...shimFiles("roles.sql", "auth-shim.sql", "storage-shim.sql"),
    ...migrationFiles(),
  ]);
  project.provide("dbUrl", cluster.url);
  return () => cluster.stop();
}
