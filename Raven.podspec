require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
  s.name         = "Raven"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.homepage     = package["homepage"]
  s.license      = package["license"]
  s.authors      = package["author"]

  s.platforms    = { :ios => "14.0" }
  s.source       = { :git => "https://github.com/dream-horizon-org/raven-client.git", :tag => "#{s.version}" }
  s.source_files = "ios/**/*.{h,m,mm,swift}"
  s.public_header_files = "ios/RavenTurbo.h"
  s.private_header_files = "ios/**/*.h"

  s.swift_version = "5.0"
  s.pod_target_xcconfig = {
    'SWIFT_VERSION' => '5.0',
    'DEFINES_MODULE' => 'YES',
  }

  s.dependency 'MMKV', '~> 1.3.0'
  s.spm_dependency 'raven-ios-sdk/RavenIOSSDK'

  install_modules_dependencies(s)
  s.dependency "React-Core"
end
