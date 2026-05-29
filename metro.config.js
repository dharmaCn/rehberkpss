const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Firebase JS SDK v10 + Expo SDK 54 uyumu:
// Metro'nun package "exports" çözümlemesi açıkken Firebase'in alt paketleri
// (@firebase/app, @firebase/component) birden fazla kopya olarak yüklenip
// "Component auth has not been registered yet" hatasına yol açıyor.
// exports çözümlemesini kapatınca tüm firebase paketleri tek ve tutarlı
// şekilde (react-native main alanı üzerinden) çözülür ve auth doğru kaydolur.
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
