module.exports = {
  dependency: {
    platforms: {
      android: {
        packageImportPath: 'import com.ravenclient.RavenPackage;',
        packageInstance: 'new RavenPackage()',
      },
      ios: {},
    },
  },
};