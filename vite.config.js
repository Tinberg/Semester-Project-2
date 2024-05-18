// vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        explore: 'html/explore.html',
        listing: 'html/listing.html',
        profile: 'html/profile.html',
        myProfile: 'html/my-profile.html',
        login: 'html/login.html',
        register: 'html/register.html',
        about: 'html/about.html'
      }
    }
  }
});