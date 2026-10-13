import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
// 운영 도메인 (sitemap·canonical·OG 주소에 쓰임)
export default defineConfig({
  site: 'https://filterreport.co.kr',
  trailingSlash: 'ignore',
  build: { format: 'directory' },
  integrations: [sitemap()],
});
