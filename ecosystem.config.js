module.exports = {
  apps: [
    {
      name: "leadupcarsapi",
      script: "/home/deployer/app/autoFinance_backend/index.js",
      watch: true,
      env_production: {
        NODE_ENV: "production",
      },
      ignore_watch: [
        "/home/deployer/app/autoFinance_backend/public/28w3ko/*",
        "/home/deployer/app/autoFinance_backend/logs/*"
      ],
    },
  ],
};