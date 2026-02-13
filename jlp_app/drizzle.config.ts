import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'sqlite',
  schema: './src/electron/database/schema/index.ts',
  out: './drizzle',
});
