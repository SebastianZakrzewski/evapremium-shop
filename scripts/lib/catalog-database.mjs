import fs from "node:fs"
import path from "node:path"
import dotenv from "dotenv"
import pg from "pg"

const PROJECT_REF = "kmepxyervpeujwvgdqtm"

const isPlaceholderUrl = (value) =>
  !value ||
  value.includes("username:password") ||
  value.includes("localhost:5432/eva_website_db")

const readServiceKeyFromEnvFile = (root) => {
  const envPath = path.join(root, ".env")
  if (!fs.existsSync(envPath)) return null
  const match = fs.readFileSync(envPath, "utf8").match(
    /^SUPABASE_SERVICE_ROLE_KEY=(.+)$/m,
  )
  return match?.[1]?.trim() ?? null
}

const buildPoolerUrls = (serviceKey) => {
  const encoded = encodeURIComponent(serviceKey)
  return [
    `postgresql://postgres.${PROJECT_REF}:${encoded}@aws-0-eu-central-1.pooler.supabase.com:6543/postgres`,
    `postgresql://postgres.${PROJECT_REF}:${encoded}@aws-0-eu-central-1.pooler.supabase.com:5432/postgres`,
    `postgresql://postgres:${encoded}@db.${PROJECT_REF}.supabase.co:5432/postgres`,
    `postgresql://postgres.${PROJECT_REF}:${encoded}@aws-0-eu-west-1.pooler.supabase.com:6543/postgres`,
  ]
}

const resolveConnectionCandidates = (root) => {
  dotenv.config({ path: path.join(root, ".env.local") })
  dotenv.config({ path: path.join(root, ".env") })

  const candidates = [
    process.env.DATABASE_URL,
    process.env.DIRECT_URL,
    process.env.SUPABASE_DB_URL,
    process.env.POSTGRES_URL,
  ].filter((value) => value && !isPlaceholderUrl(value))

  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY?.startsWith("eyJ")
      ? process.env.SUPABASE_SERVICE_ROLE_KEY
      : readServiceKeyFromEnvFile(root)

  if (serviceKey?.startsWith("eyJ")) {
    candidates.push(...buildPoolerUrls(serviceKey))
  }

  return [...new Set(candidates)]
}

export const loadCatalogDatabaseClient = async (root) => {
  const candidates = resolveConnectionCandidates(root)

  if (!candidates.length) {
    throw new Error(
      "Missing DATABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env",
    )
  }

  const errors = []

  for (const connectionString of candidates) {
    const client = new pg.Client({
      connectionString,
      ssl: connectionString.includes("localhost")
        ? undefined
        : { rejectUnauthorized: false },
    })

    try {
      await client.connect()
      return client
    } catch (error) {
      errors.push(
        `${connectionString.split("@")[1] ?? "unknown"}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      )
      await client.end().catch(() => {})
    }
  }

  throw new Error(
    `Could not connect to Postgres. Attempts:\n${errors.join("\n")}`,
  )
}
