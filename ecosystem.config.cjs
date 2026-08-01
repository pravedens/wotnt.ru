module.exports = {
  apps: [
    {
      name: 'wotnt',
      cwd: '/var/www/www-root/data/www/wotnt.ru',
      script: '.output/server/index.mjs',
      interpreter: 'node',
      env: {
        NODE_ENV: 'production',
        HOST: '127.0.0.1',
        PORT: 3000,

        NUXT_PUBLIC_SITE_URL: 'https://wotnt.ru',
        NUXT_PUBLIC_API_BASE: 'https://wotgospel.ru/api',
      },
    },
  ],
}