module.exports = {
  apps: [
    {
      name: "leadupcarsapi",
      script: "/var/www/leadup_backend/index.js",
      watch: true,
      env_production: {
        NODE_ENV: "production",
      },
      ignore_watch: [
        "/var/www/leadup_backend/public/28w3ko/*",
        "/var/www/leadup_backend/logs/*"
      ],
    },
  ],
};