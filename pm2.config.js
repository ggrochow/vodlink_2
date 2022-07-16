module.exports = {
  apps: [
    {
      name: "vodlink_api",
      script: "./api/index.js",
      env: {
        NODE_ENV: "production",
      },
    },
    {
      name: "vodlink_jobs",
      script: "./job_system/index.js",
      kill_timeout: 5500,
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
