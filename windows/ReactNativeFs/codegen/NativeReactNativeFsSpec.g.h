
/*
 * This file is auto-generated from a NativeModule spec file in js.
 *
 * This is a C++ Spec class that should be used with MakeTurboModuleProvider to register native modules
 * in a way that also verifies at compile time that the native module matches the interface required
 * by the TurboModule JS spec.
 */
#pragma once

#include <NativeModules.h>
#include <tuple>

namespace winrt::ReactNativeFs {

struct ReactNativeFsSpec_FileOptionsT {
    std::optional<std::string> NSFileProtectionKey;
};

struct ReactNativeFsSpec_NativeDownloadFileOptions {
    double jobId;
    std::string fromUrl;
    std::string toFile;
    bool background;
    double backgroundTimeout;
    bool cacheable;
    double connectionTimeout;
    bool discretionary;
    ::React::JSValue headers;
    double progressDivider;
    double progressInterval;
    double readTimeout;
    bool hasBeginCallback;
    bool hasProgressCallback;
    bool hasResumableCallback;
};

struct ReactNativeFsSpec_DownloadResult {
    double jobId;
    double statusCode;
    double bytesWritten;
};

struct ReactNativeFsSpec_FSInfoResultT {
    double totalSpace;
    double totalSpaceEx;
    double freeSpace;
    double freeSpaceEx;
};

struct ReactNativeFsSpec_MkdirOptionsT {
    std::optional<bool> NSURLIsExcludedFromBackupKey;
    std::optional<std::string> NSFileProtectionKey;
};

struct ReactNativeFsSpec_NativeReadDirResItemT {
    double ctime;
    double mtime;
    std::string name;
    std::string path;
    double size;
    std::string type;
};

struct ReactNativeFsSpec_NativeStatResultT {
    double ctime;
    double mtime;
    double size;
    std::string type;
    double mode;
    std::string originalFilepath;
};

struct ReactNativeFsSpec_TouchOptions {
    std::optional<double> ctime;
    std::optional<double> mtime;
};

struct ReactNativeFsSpec_UploadFileItem {
    std::string name;
    std::string filename;
    std::string filepath;
    std::string filetype;
};

struct ReactNativeFsSpec_NativeUploadFileOptions {
    std::string toUrl;
    std::optional<bool> binaryStreamOnly;
    std::vector<ReactNativeFsSpec_UploadFileItem> files;
    std::optional<::React::JSValue> headers;
    std::optional<::React::JSValue> fields;
    std::optional<std::string> method;
};

struct ReactNativeFsSpec_UploadResult {
    double jobId;
    double statusCode;
    ::React::JSValue headers;
    std::string body;
};

struct ReactNativeFsSpec_Constants {
    std::string CachesDirectoryPath;
    std::string DocumentDirectoryPath;
    std::string DownloadDirectoryPath;
    std::string ExternalCachesDirectoryPath;
    std::string ExternalDirectoryPath;
    std::string ExternalStorageDirectoryPath;
    std::optional<std::string> MainBundlePath;
    std::string TemporaryDirectoryPath;
    std::string FileTypeRegular;
    std::string FileTypeDirectory;
    double DocumentDirectory;
    std::optional<std::string> LibraryDirectoryPath;
    std::optional<std::string> PicturesDirectoryPath;
    std::optional<std::string> RoamingDirectoryPath;
    std::optional<std::string> FileProtectionKeys;
};


inline winrt::Microsoft::ReactNative::FieldMap GetStructInfo(ReactNativeFsSpec_FileOptionsT*) noexcept {
    winrt::Microsoft::ReactNative::FieldMap fieldMap {
        {L"NSFileProtectionKey", &ReactNativeFsSpec_FileOptionsT::NSFileProtectionKey},
    };
    return fieldMap;
}

inline winrt::Microsoft::ReactNative::FieldMap GetStructInfo(ReactNativeFsSpec_NativeDownloadFileOptions*) noexcept {
    winrt::Microsoft::ReactNative::FieldMap fieldMap {
        {L"jobId", &ReactNativeFsSpec_NativeDownloadFileOptions::jobId},
        {L"fromUrl", &ReactNativeFsSpec_NativeDownloadFileOptions::fromUrl},
        {L"toFile", &ReactNativeFsSpec_NativeDownloadFileOptions::toFile},
        {L"background", &ReactNativeFsSpec_NativeDownloadFileOptions::background},
        {L"backgroundTimeout", &ReactNativeFsSpec_NativeDownloadFileOptions::backgroundTimeout},
        {L"cacheable", &ReactNativeFsSpec_NativeDownloadFileOptions::cacheable},
        {L"connectionTimeout", &ReactNativeFsSpec_NativeDownloadFileOptions::connectionTimeout},
        {L"discretionary", &ReactNativeFsSpec_NativeDownloadFileOptions::discretionary},
        {L"headers", &ReactNativeFsSpec_NativeDownloadFileOptions::headers},
        {L"progressDivider", &ReactNativeFsSpec_NativeDownloadFileOptions::progressDivider},
        {L"progressInterval", &ReactNativeFsSpec_NativeDownloadFileOptions::progressInterval},
        {L"readTimeout", &ReactNativeFsSpec_NativeDownloadFileOptions::readTimeout},
        {L"hasBeginCallback", &ReactNativeFsSpec_NativeDownloadFileOptions::hasBeginCallback},
        {L"hasProgressCallback", &ReactNativeFsSpec_NativeDownloadFileOptions::hasProgressCallback},
        {L"hasResumableCallback", &ReactNativeFsSpec_NativeDownloadFileOptions::hasResumableCallback},
    };
    return fieldMap;
}

inline winrt::Microsoft::ReactNative::FieldMap GetStructInfo(ReactNativeFsSpec_DownloadResult*) noexcept {
    winrt::Microsoft::ReactNative::FieldMap fieldMap {
        {L"jobId", &ReactNativeFsSpec_DownloadResult::jobId},
        {L"statusCode", &ReactNativeFsSpec_DownloadResult::statusCode},
        {L"bytesWritten", &ReactNativeFsSpec_DownloadResult::bytesWritten},
    };
    return fieldMap;
}

inline winrt::Microsoft::ReactNative::FieldMap GetStructInfo(ReactNativeFsSpec_FSInfoResultT*) noexcept {
    winrt::Microsoft::ReactNative::FieldMap fieldMap {
        {L"totalSpace", &ReactNativeFsSpec_FSInfoResultT::totalSpace},
        {L"totalSpaceEx", &ReactNativeFsSpec_FSInfoResultT::totalSpaceEx},
        {L"freeSpace", &ReactNativeFsSpec_FSInfoResultT::freeSpace},
        {L"freeSpaceEx", &ReactNativeFsSpec_FSInfoResultT::freeSpaceEx},
    };
    return fieldMap;
}

inline winrt::Microsoft::ReactNative::FieldMap GetStructInfo(ReactNativeFsSpec_MkdirOptionsT*) noexcept {
    winrt::Microsoft::ReactNative::FieldMap fieldMap {
        {L"NSURLIsExcludedFromBackupKey", &ReactNativeFsSpec_MkdirOptionsT::NSURLIsExcludedFromBackupKey},
        {L"NSFileProtectionKey", &ReactNativeFsSpec_MkdirOptionsT::NSFileProtectionKey},
    };
    return fieldMap;
}

inline winrt::Microsoft::ReactNative::FieldMap GetStructInfo(ReactNativeFsSpec_NativeReadDirResItemT*) noexcept {
    winrt::Microsoft::ReactNative::FieldMap fieldMap {
        {L"ctime", &ReactNativeFsSpec_NativeReadDirResItemT::ctime},
        {L"mtime", &ReactNativeFsSpec_NativeReadDirResItemT::mtime},
        {L"name", &ReactNativeFsSpec_NativeReadDirResItemT::name},
        {L"path", &ReactNativeFsSpec_NativeReadDirResItemT::path},
        {L"size", &ReactNativeFsSpec_NativeReadDirResItemT::size},
        {L"type", &ReactNativeFsSpec_NativeReadDirResItemT::type},
    };
    return fieldMap;
}

inline winrt::Microsoft::ReactNative::FieldMap GetStructInfo(ReactNativeFsSpec_NativeStatResultT*) noexcept {
    winrt::Microsoft::ReactNative::FieldMap fieldMap {
        {L"ctime", &ReactNativeFsSpec_NativeStatResultT::ctime},
        {L"mtime", &ReactNativeFsSpec_NativeStatResultT::mtime},
        {L"size", &ReactNativeFsSpec_NativeStatResultT::size},
        {L"type", &ReactNativeFsSpec_NativeStatResultT::type},
        {L"mode", &ReactNativeFsSpec_NativeStatResultT::mode},
        {L"originalFilepath", &ReactNativeFsSpec_NativeStatResultT::originalFilepath},
    };
    return fieldMap;
}

inline winrt::Microsoft::ReactNative::FieldMap GetStructInfo(ReactNativeFsSpec_TouchOptions*) noexcept {
    winrt::Microsoft::ReactNative::FieldMap fieldMap {
        {L"ctime", &ReactNativeFsSpec_TouchOptions::ctime},
        {L"mtime", &ReactNativeFsSpec_TouchOptions::mtime},
    };
    return fieldMap;
}

inline winrt::Microsoft::ReactNative::FieldMap GetStructInfo(ReactNativeFsSpec_UploadFileItem*) noexcept {
    winrt::Microsoft::ReactNative::FieldMap fieldMap {
        {L"name", &ReactNativeFsSpec_UploadFileItem::name},
        {L"filename", &ReactNativeFsSpec_UploadFileItem::filename},
        {L"filepath", &ReactNativeFsSpec_UploadFileItem::filepath},
        {L"filetype", &ReactNativeFsSpec_UploadFileItem::filetype},
    };
    return fieldMap;
}

inline winrt::Microsoft::ReactNative::FieldMap GetStructInfo(ReactNativeFsSpec_NativeUploadFileOptions*) noexcept {
    winrt::Microsoft::ReactNative::FieldMap fieldMap {
        {L"toUrl", &ReactNativeFsSpec_NativeUploadFileOptions::toUrl},
        {L"binaryStreamOnly", &ReactNativeFsSpec_NativeUploadFileOptions::binaryStreamOnly},
        {L"files", &ReactNativeFsSpec_NativeUploadFileOptions::files},
        {L"headers", &ReactNativeFsSpec_NativeUploadFileOptions::headers},
        {L"fields", &ReactNativeFsSpec_NativeUploadFileOptions::fields},
        {L"method", &ReactNativeFsSpec_NativeUploadFileOptions::method},
    };
    return fieldMap;
}

inline winrt::Microsoft::ReactNative::FieldMap GetStructInfo(ReactNativeFsSpec_UploadResult*) noexcept {
    winrt::Microsoft::ReactNative::FieldMap fieldMap {
        {L"jobId", &ReactNativeFsSpec_UploadResult::jobId},
        {L"statusCode", &ReactNativeFsSpec_UploadResult::statusCode},
        {L"headers", &ReactNativeFsSpec_UploadResult::headers},
        {L"body", &ReactNativeFsSpec_UploadResult::body},
    };
    return fieldMap;
}

inline winrt::Microsoft::ReactNative::FieldMap GetStructInfo(ReactNativeFsSpec_Constants*) noexcept {
    winrt::Microsoft::ReactNative::FieldMap fieldMap {
        {L"CachesDirectoryPath", &ReactNativeFsSpec_Constants::CachesDirectoryPath},
        {L"DocumentDirectoryPath", &ReactNativeFsSpec_Constants::DocumentDirectoryPath},
        {L"DownloadDirectoryPath", &ReactNativeFsSpec_Constants::DownloadDirectoryPath},
        {L"ExternalCachesDirectoryPath", &ReactNativeFsSpec_Constants::ExternalCachesDirectoryPath},
        {L"ExternalDirectoryPath", &ReactNativeFsSpec_Constants::ExternalDirectoryPath},
        {L"ExternalStorageDirectoryPath", &ReactNativeFsSpec_Constants::ExternalStorageDirectoryPath},
        {L"MainBundlePath", &ReactNativeFsSpec_Constants::MainBundlePath},
        {L"TemporaryDirectoryPath", &ReactNativeFsSpec_Constants::TemporaryDirectoryPath},
        {L"FileTypeRegular", &ReactNativeFsSpec_Constants::FileTypeRegular},
        {L"FileTypeDirectory", &ReactNativeFsSpec_Constants::FileTypeDirectory},
        {L"DocumentDirectory", &ReactNativeFsSpec_Constants::DocumentDirectory},
        {L"LibraryDirectoryPath", &ReactNativeFsSpec_Constants::LibraryDirectoryPath},
        {L"PicturesDirectoryPath", &ReactNativeFsSpec_Constants::PicturesDirectoryPath},
        {L"RoamingDirectoryPath", &ReactNativeFsSpec_Constants::RoamingDirectoryPath},
        {L"FileProtectionKeys", &ReactNativeFsSpec_Constants::FileProtectionKeys},
    };
    return fieldMap;
}

struct ReactNativeFsSpec : winrt::Microsoft::ReactNative::TurboModuleSpec {
  static constexpr auto constants = std::tuple{
      TypedConstant<ReactNativeFsSpec_Constants>{0},
  };
  static constexpr auto methods = std::tuple{
      Method<void(std::string) noexcept>{0, L"addListener"},
      Method<void(double) noexcept>{1, L"removeListeners"},
      Method<void(std::string, std::string, Promise<void>) noexcept>{2, L"appendFile"},
      Method<void(std::string, std::string, ReactNativeFsSpec_FileOptionsT, Promise<void>) noexcept>{3, L"copyFile"},
      Method<void(ReactNativeFsSpec_NativeDownloadFileOptions, Promise<ReactNativeFsSpec_DownloadResult>) noexcept>{4, L"downloadFile"},
      Method<void(std::string, Promise<bool>) noexcept>{5, L"exists"},
      Method<void(Promise<ReactNativeFsSpec_FSInfoResultT>) noexcept>{6, L"getFSInfo"},
      Method<void(std::string, std::string, Promise<std::string>) noexcept>{7, L"hash"},
      Method<void(std::string, ReactNativeFsSpec_MkdirOptionsT, Promise<void>) noexcept>{8, L"mkdir"},
      Method<void(std::string, std::string, ReactNativeFsSpec_FileOptionsT, Promise<void>) noexcept>{9, L"moveFile"},
      Method<void(std::string, double, double, Promise<std::string>) noexcept>{10, L"read"},
      Method<void(std::string, Promise<std::string>) noexcept>{11, L"readFile"},
      Method<void(std::string, Promise<std::vector<ReactNativeFsSpec_NativeReadDirResItemT>>) noexcept>{12, L"readDir"},
      Method<void(std::string, Promise<ReactNativeFsSpec_NativeStatResultT>) noexcept>{13, L"stat"},
      Method<void(double) noexcept>{14, L"stopDownload"},
      Method<void(double) noexcept>{15, L"stopUpload"},
      Method<void(std::string, ReactNativeFsSpec_TouchOptions, Promise<void>) noexcept>{16, L"touch"},
      Method<void(std::string, Promise<void>) noexcept>{17, L"unlink"},
      Method<void(ReactNativeFsSpec_NativeUploadFileOptions, Promise<ReactNativeFsSpec_UploadResult>) noexcept>{18, L"uploadFiles"},
      Method<void(std::string, std::string, double, Promise<void>) noexcept>{19, L"write"},
      Method<void(std::string, std::string, ReactNativeFsSpec_FileOptionsT, Promise<void>) noexcept>{20, L"writeFile"},
      Method<void(std::string, std::string, Promise<void>) noexcept>{21, L"copyFileAssets"},
      Method<void(std::string, std::string, Promise<void>) noexcept>{22, L"copyFileRes"},
      Method<void(std::string, Promise<bool>) noexcept>{23, L"existsAssets"},
      Method<void(std::string, Promise<bool>) noexcept>{24, L"existsRes"},
      Method<void(Promise<std::vector<std::string>>) noexcept>{25, L"getAllExternalFilesDirs"},
      Method<void(std::string, Promise<std::string>) noexcept>{26, L"readFileAssets"},
      Method<void(std::string, Promise<std::string>) noexcept>{27, L"readFileRes"},
      Method<void(std::string, Promise<std::vector<ReactNativeFsSpec_NativeReadDirResItemT>>) noexcept>{28, L"readDirAssets"},
      Method<void(std::string, Promise<std::string>) noexcept>{29, L"scanFile"},
      Method<void(std::string, bool, bool, Promise<bool>) noexcept>{30, L"setReadable"},
      Method<void(std::string, std::string, double, double, double, double, std::string, Promise<std::string>) noexcept>{31, L"copyAssetsFileIOS"},
      Method<void(std::string, std::string, Promise<std::string>) noexcept>{32, L"copyAssetsVideoIOS"},
      Method<void(double) noexcept>{33, L"completeHandlerIOS"},
      Method<void(double, Promise<bool>) noexcept>{34, L"isResumable"},
      Method<void(std::string, Promise<std::string>) noexcept>{35, L"pathForBundle"},
      Method<void(std::string, Promise<std::string>) noexcept>{36, L"pathForGroup"},
      Method<void(double) noexcept>{37, L"resumeDownload"},
      Method<void(std::string, std::string, Promise<void>) noexcept>{38, L"copyFolder"},
  };

  template <class TModule>
  static constexpr void ValidateModule() noexcept {
    constexpr auto constantCheckResults = CheckConstants<TModule, ReactNativeFsSpec>();
    constexpr auto methodCheckResults = CheckMethods<TModule, ReactNativeFsSpec>();

    REACT_SHOW_CONSTANT_SPEC_ERRORS(
          0,
          "ReactNativeFsSpec_Constants",
          "    REACT_GET_CONSTANTS(GetConstants) ReactNativeFsSpec_Constants GetConstants() noexcept {/*implementation*/}\n"
          "    REACT_GET_CONSTANTS(GetConstants) static ReactNativeFsSpec_Constants GetConstants() noexcept {/*implementation*/}\n");

    REACT_SHOW_METHOD_SPEC_ERRORS(
          0,
          "addListener",
          "    REACT_METHOD(addListener) void addListener(std::string event) noexcept { /* implementation */ }\n"
          "    REACT_METHOD(addListener) static void addListener(std::string event) noexcept { /* implementation */ }\n");
    REACT_SHOW_METHOD_SPEC_ERRORS(
          1,
          "removeListeners",
          "    REACT_METHOD(removeListeners) void removeListeners(double count) noexcept { /* implementation */ }\n"
          "    REACT_METHOD(removeListeners) static void removeListeners(double count) noexcept { /* implementation */ }\n");
    REACT_SHOW_METHOD_SPEC_ERRORS(
          2,
          "appendFile",
          "    REACT_METHOD(appendFile) void appendFile(std::string path, std::string b64, ::React::ReactPromise<void> &&result) noexcept { /* implementation */ }\n"
          "    REACT_METHOD(appendFile) static void appendFile(std::string path, std::string b64, ::React::ReactPromise<void> &&result) noexcept { /* implementation */ }\n");
    REACT_SHOW_METHOD_SPEC_ERRORS(
          3,
          "copyFile",
          "    REACT_METHOD(copyFile) void copyFile(std::string from, std::string into, ReactNativeFsSpec_FileOptionsT && options, ::React::ReactPromise<void> &&result) noexcept { /* implementation */ }\n"
          "    REACT_METHOD(copyFile) static void copyFile(std::string from, std::string into, ReactNativeFsSpec_FileOptionsT && options, ::React::ReactPromise<void> &&result) noexcept { /* implementation */ }\n");
    REACT_SHOW_METHOD_SPEC_ERRORS(
          4,
          "downloadFile",
          "    REACT_METHOD(downloadFile) void downloadFile(ReactNativeFsSpec_NativeDownloadFileOptions && options, ::React::ReactPromise<ReactNativeFsSpec_DownloadResult> &&result) noexcept { /* implementation */ }\n"
          "    REACT_METHOD(downloadFile) static void downloadFile(ReactNativeFsSpec_NativeDownloadFileOptions && options, ::React::ReactPromise<ReactNativeFsSpec_DownloadResult> &&result) noexcept { /* implementation */ }\n");
    REACT_SHOW_METHOD_SPEC_ERRORS(
          5,
          "exists",
          "    REACT_METHOD(exists) void exists(std::string path, ::React::ReactPromise<bool> &&result) noexcept { /* implementation */ }\n"
          "    REACT_METHOD(exists) static void exists(std::string path, ::React::ReactPromise<bool> &&result) noexcept { /* implementation */ }\n");
    REACT_SHOW_METHOD_SPEC_ERRORS(
          6,
          "getFSInfo",
          "    REACT_METHOD(getFSInfo) void getFSInfo(::React::ReactPromise<ReactNativeFsSpec_FSInfoResultT> &&result) noexcept { /* implementation */ }\n"
          "    REACT_METHOD(getFSInfo) static void getFSInfo(::React::ReactPromise<ReactNativeFsSpec_FSInfoResultT> &&result) noexcept { /* implementation */ }\n");
    REACT_SHOW_METHOD_SPEC_ERRORS(
          7,
          "hash",
          "    REACT_METHOD(hash) void hash(std::string path, std::string algorithm, ::React::ReactPromise<std::string> &&result) noexcept { /* implementation */ }\n"
          "    REACT_METHOD(hash) static void hash(std::string path, std::string algorithm, ::React::ReactPromise<std::string> &&result) noexcept { /* implementation */ }\n");
    REACT_SHOW_METHOD_SPEC_ERRORS(
          8,
          "mkdir",
          "    REACT_METHOD(mkdir) void mkdir(std::string path, ReactNativeFsSpec_MkdirOptionsT && options, ::React::ReactPromise<void> &&result) noexcept { /* implementation */ }\n"
          "    REACT_METHOD(mkdir) static void mkdir(std::string path, ReactNativeFsSpec_MkdirOptionsT && options, ::React::ReactPromise<void> &&result) noexcept { /* implementation */ }\n");
    REACT_SHOW_METHOD_SPEC_ERRORS(
          9,
          "moveFile",
          "    REACT_METHOD(moveFile) void moveFile(std::string from, std::string into, ReactNativeFsSpec_FileOptionsT && options, ::React::ReactPromise<void> &&result) noexcept { /* implementation */ }\n"
          "    REACT_METHOD(moveFile) static void moveFile(std::string from, std::string into, ReactNativeFsSpec_FileOptionsT && options, ::React::ReactPromise<void> &&result) noexcept { /* implementation */ }\n");
    REACT_SHOW_METHOD_SPEC_ERRORS(
          10,
          "read",
          "    REACT_METHOD(read) void read(std::string path, double length, double position, ::React::ReactPromise<std::string> &&result) noexcept { /* implementation */ }\n"
          "    REACT_METHOD(read) static void read(std::string path, double length, double position, ::React::ReactPromise<std::string> &&result) noexcept { /* implementation */ }\n");
    REACT_SHOW_METHOD_SPEC_ERRORS(
          11,
          "readFile",
          "    REACT_METHOD(readFile) void readFile(std::string path, ::React::ReactPromise<std::string> &&result) noexcept { /* implementation */ }\n"
          "    REACT_METHOD(readFile) static void readFile(std::string path, ::React::ReactPromise<std::string> &&result) noexcept { /* implementation */ }\n");
    REACT_SHOW_METHOD_SPEC_ERRORS(
          12,
          "readDir",
          "    REACT_METHOD(readDir) void readDir(std::string path, ::React::ReactPromise<std::vector<ReactNativeFsSpec_NativeReadDirResItemT>> &&result) noexcept { /* implementation */ }\n"
          "    REACT_METHOD(readDir) static void readDir(std::string path, ::React::ReactPromise<std::vector<ReactNativeFsSpec_NativeReadDirResItemT>> &&result) noexcept { /* implementation */ }\n");
    REACT_SHOW_METHOD_SPEC_ERRORS(
          13,
          "stat",
          "    REACT_METHOD(stat) void stat(std::string path, ::React::ReactPromise<ReactNativeFsSpec_NativeStatResultT> &&result) noexcept { /* implementation */ }\n"
          "    REACT_METHOD(stat) static void stat(std::string path, ::React::ReactPromise<ReactNativeFsSpec_NativeStatResultT> &&result) noexcept { /* implementation */ }\n");
    REACT_SHOW_METHOD_SPEC_ERRORS(
          14,
          "stopDownload",
          "    REACT_METHOD(stopDownload) void stopDownload(double jobId) noexcept { /* implementation */ }\n"
          "    REACT_METHOD(stopDownload) static void stopDownload(double jobId) noexcept { /* implementation */ }\n");
    REACT_SHOW_METHOD_SPEC_ERRORS(
          15,
          "stopUpload",
          "    REACT_METHOD(stopUpload) void stopUpload(double jobId) noexcept { /* implementation */ }\n"
          "    REACT_METHOD(stopUpload) static void stopUpload(double jobId) noexcept { /* implementation */ }\n");
    REACT_SHOW_METHOD_SPEC_ERRORS(
          16,
          "touch",
          "    REACT_METHOD(touch) void touch(std::string path, ReactNativeFsSpec_TouchOptions && options, ::React::ReactPromise<void> &&result) noexcept { /* implementation */ }\n"
          "    REACT_METHOD(touch) static void touch(std::string path, ReactNativeFsSpec_TouchOptions && options, ::React::ReactPromise<void> &&result) noexcept { /* implementation */ }\n");
    REACT_SHOW_METHOD_SPEC_ERRORS(
          17,
          "unlink",
          "    REACT_METHOD(unlink) void unlink(std::string path, ::React::ReactPromise<void> &&result) noexcept { /* implementation */ }\n"
          "    REACT_METHOD(unlink) static void unlink(std::string path, ::React::ReactPromise<void> &&result) noexcept { /* implementation */ }\n");
    REACT_SHOW_METHOD_SPEC_ERRORS(
          18,
          "uploadFiles",
          "    REACT_METHOD(uploadFiles) void uploadFiles(ReactNativeFsSpec_NativeUploadFileOptions && options, ::React::ReactPromise<ReactNativeFsSpec_UploadResult> &&result) noexcept { /* implementation */ }\n"
          "    REACT_METHOD(uploadFiles) static void uploadFiles(ReactNativeFsSpec_NativeUploadFileOptions && options, ::React::ReactPromise<ReactNativeFsSpec_UploadResult> &&result) noexcept { /* implementation */ }\n");
    REACT_SHOW_METHOD_SPEC_ERRORS(
          19,
          "write",
          "    REACT_METHOD(write) void write(std::string path, std::string b64, double position, ::React::ReactPromise<void> &&result) noexcept { /* implementation */ }\n"
          "    REACT_METHOD(write) static void write(std::string path, std::string b64, double position, ::React::ReactPromise<void> &&result) noexcept { /* implementation */ }\n");
    REACT_SHOW_METHOD_SPEC_ERRORS(
          20,
          "writeFile",
          "    REACT_METHOD(writeFile) void writeFile(std::string path, std::string b64, ReactNativeFsSpec_FileOptionsT && options, ::React::ReactPromise<void> &&result) noexcept { /* implementation */ }\n"
          "    REACT_METHOD(writeFile) static void writeFile(std::string path, std::string b64, ReactNativeFsSpec_FileOptionsT && options, ::React::ReactPromise<void> &&result) noexcept { /* implementation */ }\n");
    REACT_SHOW_METHOD_SPEC_ERRORS(
          21,
          "copyFileAssets",
          "    REACT_METHOD(copyFileAssets) void copyFileAssets(std::string from, std::string into, ::React::ReactPromise<void> &&result) noexcept { /* implementation */ }\n"
          "    REACT_METHOD(copyFileAssets) static void copyFileAssets(std::string from, std::string into, ::React::ReactPromise<void> &&result) noexcept { /* implementation */ }\n");
    REACT_SHOW_METHOD_SPEC_ERRORS(
          22,
          "copyFileRes",
          "    REACT_METHOD(copyFileRes) void copyFileRes(std::string from, std::string into, ::React::ReactPromise<void> &&result) noexcept { /* implementation */ }\n"
          "    REACT_METHOD(copyFileRes) static void copyFileRes(std::string from, std::string into, ::React::ReactPromise<void> &&result) noexcept { /* implementation */ }\n");
    REACT_SHOW_METHOD_SPEC_ERRORS(
          23,
          "existsAssets",
          "    REACT_METHOD(existsAssets) void existsAssets(std::string path, ::React::ReactPromise<bool> &&result) noexcept { /* implementation */ }\n"
          "    REACT_METHOD(existsAssets) static void existsAssets(std::string path, ::React::ReactPromise<bool> &&result) noexcept { /* implementation */ }\n");
    REACT_SHOW_METHOD_SPEC_ERRORS(
          24,
          "existsRes",
          "    REACT_METHOD(existsRes) void existsRes(std::string path, ::React::ReactPromise<bool> &&result) noexcept { /* implementation */ }\n"
          "    REACT_METHOD(existsRes) static void existsRes(std::string path, ::React::ReactPromise<bool> &&result) noexcept { /* implementation */ }\n");
    REACT_SHOW_METHOD_SPEC_ERRORS(
          25,
          "getAllExternalFilesDirs",
          "    REACT_METHOD(getAllExternalFilesDirs) void getAllExternalFilesDirs(::React::ReactPromise<std::vector<std::string>> &&result) noexcept { /* implementation */ }\n"
          "    REACT_METHOD(getAllExternalFilesDirs) static void getAllExternalFilesDirs(::React::ReactPromise<std::vector<std::string>> &&result) noexcept { /* implementation */ }\n");
    REACT_SHOW_METHOD_SPEC_ERRORS(
          26,
          "readFileAssets",
          "    REACT_METHOD(readFileAssets) void readFileAssets(std::string path, ::React::ReactPromise<std::string> &&result) noexcept { /* implementation */ }\n"
          "    REACT_METHOD(readFileAssets) static void readFileAssets(std::string path, ::React::ReactPromise<std::string> &&result) noexcept { /* implementation */ }\n");
    REACT_SHOW_METHOD_SPEC_ERRORS(
          27,
          "readFileRes",
          "    REACT_METHOD(readFileRes) void readFileRes(std::string path, ::React::ReactPromise<std::string> &&result) noexcept { /* implementation */ }\n"
          "    REACT_METHOD(readFileRes) static void readFileRes(std::string path, ::React::ReactPromise<std::string> &&result) noexcept { /* implementation */ }\n");
    REACT_SHOW_METHOD_SPEC_ERRORS(
          28,
          "readDirAssets",
          "    REACT_METHOD(readDirAssets) void readDirAssets(std::string path, ::React::ReactPromise<std::vector<ReactNativeFsSpec_NativeReadDirResItemT>> &&result) noexcept { /* implementation */ }\n"
          "    REACT_METHOD(readDirAssets) static void readDirAssets(std::string path, ::React::ReactPromise<std::vector<ReactNativeFsSpec_NativeReadDirResItemT>> &&result) noexcept { /* implementation */ }\n");
    REACT_SHOW_METHOD_SPEC_ERRORS(
          29,
          "scanFile",
          "    REACT_METHOD(scanFile) void scanFile(std::string path, ::React::ReactPromise<std::string> &&result) noexcept { /* implementation */ }\n"
          "    REACT_METHOD(scanFile) static void scanFile(std::string path, ::React::ReactPromise<std::string> &&result) noexcept { /* implementation */ }\n");
    REACT_SHOW_METHOD_SPEC_ERRORS(
          30,
          "setReadable",
          "    REACT_METHOD(setReadable) void setReadable(std::string filepath, bool readable, bool ownerOnly, ::React::ReactPromise<bool> &&result) noexcept { /* implementation */ }\n"
          "    REACT_METHOD(setReadable) static void setReadable(std::string filepath, bool readable, bool ownerOnly, ::React::ReactPromise<bool> &&result) noexcept { /* implementation */ }\n");
    REACT_SHOW_METHOD_SPEC_ERRORS(
          31,
          "copyAssetsFileIOS",
          "    REACT_METHOD(copyAssetsFileIOS) void copyAssetsFileIOS(std::string imageUri, std::string destPath, double width, double height, double scale, double compression, std::string resizeMode, ::React::ReactPromise<std::string> &&result) noexcept { /* implementation */ }\n"
          "    REACT_METHOD(copyAssetsFileIOS) static void copyAssetsFileIOS(std::string imageUri, std::string destPath, double width, double height, double scale, double compression, std::string resizeMode, ::React::ReactPromise<std::string> &&result) noexcept { /* implementation */ }\n");
    REACT_SHOW_METHOD_SPEC_ERRORS(
          32,
          "copyAssetsVideoIOS",
          "    REACT_METHOD(copyAssetsVideoIOS) void copyAssetsVideoIOS(std::string imageUri, std::string destPath, ::React::ReactPromise<std::string> &&result) noexcept { /* implementation */ }\n"
          "    REACT_METHOD(copyAssetsVideoIOS) static void copyAssetsVideoIOS(std::string imageUri, std::string destPath, ::React::ReactPromise<std::string> &&result) noexcept { /* implementation */ }\n");
    REACT_SHOW_METHOD_SPEC_ERRORS(
          33,
          "completeHandlerIOS",
          "    REACT_METHOD(completeHandlerIOS) void completeHandlerIOS(double jobId) noexcept { /* implementation */ }\n"
          "    REACT_METHOD(completeHandlerIOS) static void completeHandlerIOS(double jobId) noexcept { /* implementation */ }\n");
    REACT_SHOW_METHOD_SPEC_ERRORS(
          34,
          "isResumable",
          "    REACT_METHOD(isResumable) void isResumable(double jobId, ::React::ReactPromise<bool> &&result) noexcept { /* implementation */ }\n"
          "    REACT_METHOD(isResumable) static void isResumable(double jobId, ::React::ReactPromise<bool> &&result) noexcept { /* implementation */ }\n");
    REACT_SHOW_METHOD_SPEC_ERRORS(
          35,
          "pathForBundle",
          "    REACT_METHOD(pathForBundle) void pathForBundle(std::string bundle, ::React::ReactPromise<std::string> &&result) noexcept { /* implementation */ }\n"
          "    REACT_METHOD(pathForBundle) static void pathForBundle(std::string bundle, ::React::ReactPromise<std::string> &&result) noexcept { /* implementation */ }\n");
    REACT_SHOW_METHOD_SPEC_ERRORS(
          36,
          "pathForGroup",
          "    REACT_METHOD(pathForGroup) void pathForGroup(std::string group, ::React::ReactPromise<std::string> &&result) noexcept { /* implementation */ }\n"
          "    REACT_METHOD(pathForGroup) static void pathForGroup(std::string group, ::React::ReactPromise<std::string> &&result) noexcept { /* implementation */ }\n");
    REACT_SHOW_METHOD_SPEC_ERRORS(
          37,
          "resumeDownload",
          "    REACT_METHOD(resumeDownload) void resumeDownload(double jobId) noexcept { /* implementation */ }\n"
          "    REACT_METHOD(resumeDownload) static void resumeDownload(double jobId) noexcept { /* implementation */ }\n");
    REACT_SHOW_METHOD_SPEC_ERRORS(
          38,
          "copyFolder",
          "    REACT_METHOD(copyFolder) void copyFolder(std::string from, std::string into, ::React::ReactPromise<void> &&result) noexcept { /* implementation */ }\n"
          "    REACT_METHOD(copyFolder) static void copyFolder(std::string from, std::string into, ::React::ReactPromise<void> &&result) noexcept { /* implementation */ }\n");
  }
};

} // namespace winrt::ReactNativeFs
