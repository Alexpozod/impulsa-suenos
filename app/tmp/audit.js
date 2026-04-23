const fs = require("fs")
const path = require("path")

const baseDir = "./app"

function scan(dir) {
  const files = fs.readdirSync(dir)

  for (const file of files) {
    const fullPath = path.join(dir, file)
    const stat = fs.statSync(fullPath)

    if (stat.isDirectory()) {
      scan(fullPath)
    } else if (file.endsWith(".ts") || file.endsWith(".tsx")) {
      const content = fs.readFileSync(fullPath, "utf-8")

      if (
        content.includes(".from(") &&
        !content.includes("user_email") &&
        !content.includes("auth.getUser")
      ) {
        console.log("⚠️ POSIBLE DATA LEAK:", fullPath)
      }
    }
  }
}

scan(baseDir)