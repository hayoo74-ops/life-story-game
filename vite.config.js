import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

// Project Pages lives under this path; override only for another hosting layout.
const native=process.env.NATIVE_BUILD==='true';
const base = native?'./':process.env.VITE_BASE_PATH || '/life-story-game/';

export default defineConfig({
  base,
  plugins: [VitePWA({
    disable:native,
    registerType: 'prompt',
    base, scope: base,
    includeAssets: ['icon.svg', 'icon-192.png', 'icon-512.png'],
    manifest: {
      name: 'LIFE STORY — 나의 인생', short_name: 'LIFE STORY', lang: 'ko',
      description: '기억의 골목을 걷는 픽셀 스토리 어드벤처',
      theme_color: '#efebdf', background_color: '#efebdf', display: 'standalone',
      orientation: 'any', id: base, start_url: base, scope: base,
      icons: [{src:'icon-192.png',sizes:'192x192',type:'image/png'}, {src:'icon-512.png',sizes:'512x512',type:'image/png',purpose:'any maskable'}]
    },
    workbox: {globPatterns:['**/*.{js,css,html,png,svg,woff2}'], maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, navigateFallback: 'index.html', cleanupOutdatedCaches:true}
  })],
  build: {outDir:native?'dist-native':'dist',target:'es2022',chunkSizeWarningLimit: 1600, rollupOptions:{output:{manualChunks:{phaser:['phaser']}}}}
});
