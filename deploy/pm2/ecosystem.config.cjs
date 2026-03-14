module.exports = {
  apps: [
    {
      name: 'api-server',
      cwd: '/var/www/frontend-interview-bank/current/api-server',
      script: 'dist/main.js',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '300M',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
    },
  ],
};
