const fs = require("fs")
const path = require("path")

function scan(dir, results = []) {
  const files = fs.readdirSync(dir)

  for (const file of files) {
    const fullPath = path.join(dir, file)
    const stat = fs.statSync(fullPath)

    if (stat.isDirectory()) {
      scan(fullPath, results)
    } else if (file.endsWith(".ts") || file.endsWith(".tsx")) {
      const content = fs.readFileSync(fullPath, "utf8")

      if (
        content.includes("SUPABASE_SERVICE_ROLE_KEY") ||
        content.includes(".from(")
      ) {
        results.push({
          file: fullPath,
          service_role: content.includes("SUPABASE_SERVICE_ROLE_KEY"),
          queries: (content.match(/\.from\(/g) || []).length
        })
      }
    }
  }

  return results
}

const results = scan("./app")

fs.writeFileSync("audit-results.json", JSON.stringify(results, null, 2))

console.log("✅ audit-results.json generado")