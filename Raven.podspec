require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
  s.name         = "Raven"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.homepage     = package["homepage"]
  s.license      = package["license"]
  s.authors      = package["author"]

  # Use explicit iOS version for Expo compatibility
  # Expo requires a specific minimum version rather than the dynamic min_ios_version_supported
  s.platforms    = { :ios => "13.4" }
  s.source       = { :git => "https://github.com/dream-horizon-org/raven-client.git", :tag => "#{s.version}" }

  # Include all iOS native files (including RavenStorage)
  s.source_files = "ios/**/*.{h,m,mm,swift}"
  s.private_header_files = "ios/RavenStorage/StorageUtils.h"

  # Swift support
  s.swift_version = "5.0"

  # MMKV dependency for RavenStorage
  s.dependency 'MMKV', '~> 1.3.0'

  # React Native dependencies
  install_modules_dependencies(s)
  
  # Ensure React Native is available (required for Expo)
  s.dependency "React-Core"
end
