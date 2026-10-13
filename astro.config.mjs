import { defineConfig } from 'astro/config';
// 운영 도메인 (sitemap·canonical에 쓰임)
export default defineConfig({
  site: 'https://filterreport.co.kr',
  trailingSlash: 'ignore',
  build: { format: 'directory' },
});
