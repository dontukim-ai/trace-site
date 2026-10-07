import { defineConfig } from 'astro/config';
// 도메인이 정해지면 site 값을 바꾼다 (sitemap·canonical에 쓰임)
export default defineConfig({
  site: 'https://example.com',
  trailingSlash: 'ignore',
  build: { format: 'directory' },
});
