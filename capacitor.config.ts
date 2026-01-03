import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.example.app',
  appName: 'T~T Stock',
  webDir: 'dist',

 plugins: {
  SplashScreen: {
    launchShowDuration: 0,
    backgroundColor: '#26A69A',
    androidScaleType: 'CROP',
    showSpinner: false
  }
}

};

export default config;
