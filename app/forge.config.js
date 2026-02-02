const { FusesPlugin } = require('@electron-forge/plugin-fuses');
const { FuseV1Options, FuseVersion } = require('@electron/fuses');
require('dotenv').config();

module.exports = {
  publishers: [
    {
      name: '@electron-forge/publisher-github',
      config: {
        repository: {
          owner: 'Evan-X-Hu',
          name: 'Japanese_Lang_Project'
        },
        prerelease: false,
        draft: true
      }
    }
  ],
  packagerConfig: {
    asar: true,
  },
  rebuildConfig: {},
  makers: [
    // {
    //   name: '@electron-forge/maker-squirrel',
    //   config: {
    //     certificateFile: './cert.pfx',
    //     certificatePassword: process.env.CERTIFICATE_PASSWORD
    //   },
    // },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin', 'linux'],
    },
    // {
    //   name: '@electron-forge/maker-deb',
    //   config: {},
    // },
    //RPM maker disabled - has bugs on Fedora 42+
    // {
    //   name: '@electron-forge/maker-rpm',
    //   config: {
    //     options: {
    //       homepage: 'https://github.com/Evan-X-Hu/Japanese_Lang_Project',
    //       categories: ['Utility'],
    //     },
    //   },
    // },
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-auto-unpack-natives',
      config: {},
    },
    // Fuses are used to enable/disable various Electron functionality
    // at package time, before code signing the application
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
};
