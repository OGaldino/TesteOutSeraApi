import { defineConfig } from '@playwright/test';

export default defineConfig({
  timeout: 30000,
  retries: process.env.CI ? 2 : 0,
  reporter: [
    ['list'],                     // Saída de linha
    ['html', { open: 'never' }],  // Relatório HTML nativo
    ['allure-playwright'],     // (Opcional) Ative se usar Allure
  ],
  use: {
    baseURL: 'https://reqres.in/api',
    extraHTTPHeaders: {
      'x-api-key': 'reqres-free-v1',
      'accept': 'application/json',
      'cache-control': 'no-cache'
    },
    screenshot: 'only-on-failure',
    video: 'off',
    trace: 'off',
  }
});