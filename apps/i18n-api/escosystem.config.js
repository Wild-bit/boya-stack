
module.exports = {
  apps: [
    {
      name: "i18n-api",
      cwd:__dirname,
      script: "dist/main.js",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      max_memory_restart: "500M",
      env: {
        NODE_ENV: "production",
        PORT: 4000
      }
    }
  ]
};