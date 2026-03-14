import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.anjaninikunj.beantracker',
  appName: 'Bean Sales',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
