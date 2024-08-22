const fs = require("fs-extra");
const path = require("path");

async function build() {
  try {
    require("child_process").execSync("tsc", { stdio: "inherit" });

    await fs.copy(
      path.join(__dirname, "src", "views"),
      path.join(__dirname, "dist", "views")
    );
    await fs.copy(
      path.join(__dirname, "src", "public"),
      path.join(__dirname, "dist", "public")
    );

    console.log("Build complete!");
  } catch (err) {
    console.error("Build failed:", err);
    process.exit(1);
  }
}

build();
