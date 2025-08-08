// Copyright (C) Microsoft Corporation. All rights reserved.

#include "pch.h"

#include "ReactNativeModule.h"

#include <filesystem>
#include <sstream>
#include <stack>
#include <windows.h>
#include <winrt/Windows.Storage.FileProperties.h>
#include <winrt/Windows.Storage.Streams.h>
#include <winrt/Windows.Storage.h>

#include <winrt/Windows.Web.Http.h>
#include <winrt/Windows.Web.Http.Headers.h>
#include <winrt/Windows.ApplicationModel.h>
#include <winrt/Windows.Foundation.h>
#include <winrt/Windows.Storage.Pickers.h>
#include <winrt/Windows.Storage.AccessCache.h>

#include "RNFSException.h"

using namespace winrt;
using namespace winrt::ReactNativeFs;
using namespace winrt::Windows::ApplicationModel;
using namespace winrt::Windows::Storage;
using namespace winrt::Windows::Storage::Streams;
using namespace winrt::Windows::Storage::Pickers;
using namespace winrt::Windows::Foundation;
using namespace winrt::Windows::Web::Http;


union touchTime {
    int64_t initialTime;
    DWORD splitTime[2];
};

//
// For downloads and uploads
//
CancellationDisposable::CancellationDisposable(IAsyncInfo const& async, std::function<void()>&& onCancel) noexcept
    : m_async{ async }
    , m_onCancel{ std::move(onCancel) }
{
}

CancellationDisposable::CancellationDisposable(CancellationDisposable&& other) noexcept
    : m_async{ std::move(other.m_async) }
    , m_onCancel{ std::move(other.m_onCancel) }
{
}

CancellationDisposable& CancellationDisposable::operator=(CancellationDisposable&& other) noexcept
{
    if (this != &other)
    {
        CancellationDisposable temp{ std::move(*this) };
        m_async = std::move(other.m_async);
        m_onCancel = std::move(other.m_onCancel);
    }
    return *this;
}

CancellationDisposable::~CancellationDisposable() noexcept
{
    Cancel();
}

void CancellationDisposable::Cancel() noexcept
{
    if (m_async)
    {
        if (m_async.Status() == AsyncStatus::Started)
        {
            m_async.Cancel();
        }

        if (m_onCancel)
        {
            m_onCancel();
        }
    }
}

TaskCancellationManager::~TaskCancellationManager() noexcept
{
    // Do the explicit cleaning to make sure that CancellationDisposable
    // destructors run while this instance still has valid fields because
    // they are used by the onCancel callback.
    // We also want to clear the m_pendingTasks before running the
    // CancellationDisposable destructors since they touch the m_pendingTasks.
    std::map<JobId, CancellationDisposable> pendingTasks;
    {
        std::scoped_lock lock{ m_mutex };
        pendingTasks = std::move(m_pendingTasks);
    }
}

IAsyncAction TaskCancellationManager::Add(JobId jobId, IAsyncAction const& asyncAction) noexcept
{
    std::scoped_lock lock{ m_mutex };
    m_pendingTasks.try_emplace(jobId, asyncAction, [this, jobId]()
        {
            Cancel(jobId);
        });
    return asyncAction;
}

void TaskCancellationManager::Cancel(JobId jobId) noexcept
{
    // The destructor of the token does the cancellation. We must do it outside of lock.
    CancellationDisposable token;

    {
        std::scoped_lock lock{ m_mutex };
        if (!m_pendingTasks.empty())
        {
            if (auto it = m_pendingTasks.find(jobId); it != m_pendingTasks.end())
            {
                token = std::move(it->second);
                m_pendingTasks.erase(it);
            }
        }
    }
}

//
// For stat implementation
//
struct handle_closer
{
    void operator()(HANDLE h) noexcept
    {
        assert(h != INVALID_HANDLE_VALUE); if (h) CloseHandle(h);
    }
};

static inline HANDLE safe_handle(HANDLE h) noexcept
{
    return (h == INVALID_HANDLE_VALUE) ? nullptr : h;
}

void ReactNativeModule::Initialize(ReactContext const& reactContext) noexcept
{
    m_reactContext = reactContext;
}


//
// RNFS implementations
//
ReactNativeFsSpec_Constants ReactNativeModule::GetConstants() noexcept
{
    ReactNativeFsSpec_Constants res;
    res.MainBundlePath = to_string(Package::Current().InstalledLocation().Path());
    res.CachesDirectoryPath = to_string(ApplicationData::Current().LocalCacheFolder().Path());
    res.DocumentDirectoryPath = to_string(ApplicationData::Current().LocalFolder().Path());
    res.DownloadDirectoryPath = to_string(UserDataPaths::GetDefault().Downloads());
    res.ExternalDirectoryPath = to_string(UserDataPaths::GetDefault().Documents());
    res.TemporaryDirectoryPath = to_string(ApplicationData::Current().TemporaryFolder().Path());
    res.PicturesDirectoryPath = to_string(UserDataPaths::GetDefault().Pictures());
    // TODO: Check to see if these can be accessed after package created
    res.RoamingDirectoryPath = to_string(ApplicationData::Current().RoamingFolder().Path());
    res.FileTypeRegular = "0";
    res.FileTypeDirectory = "1";
    return res;
}

winrt::fire_and_forget ReactNativeModule::mkdir(std::wstring directory, JSValueObject options, ReactPromise<void> promise) noexcept
try
{
    size_t pathLength{ directory.length() };

    if (pathLength <= 0) {
        promise.Reject("Invalid path length");
    }
    else {
        bool hasTrailingSlash{ directory[pathLength - 1] == '\\' || directory[pathLength - 1] == '/' };
        std::filesystem::path path(hasTrailingSlash ? directory.substr(0, pathLength - 1) : directory);
        path.make_preferred();

        auto parentPath{ path.parent_path().wstring() };
        std::stack<std::wstring> directoriesToMake;
        directoriesToMake.push(path.filename().wstring());

        StorageFolder folder{ nullptr };
        while (folder == nullptr) {
            try {
                folder = co_await StorageFolder::GetFolderFromPathAsync(parentPath);
            }
            catch (const hresult_error& ex) {
                hresult result{ ex.code() };
                if (result == HRESULT_FROM_WIN32(ERROR_FILE_NOT_FOUND)) {
                    auto index{ parentPath.find_last_of('\\') };
                    directoriesToMake.push(parentPath.substr(index + 1));
                    parentPath = parentPath.substr(0, index);
                }
                else {
                    promise.Reject(winrt::to_string(ex.message()).c_str());
                }
            }
        }

        while (!directoriesToMake.empty()) {
            folder = co_await folder.CreateFolderAsync(directoriesToMake.top(), CreationCollisionOption::OpenIfExists);
            directoriesToMake.pop();
        }
        promise.Resolve();
    }
}
catch (const hresult_error& ex)
{
    // "Unexpected error while making directory."
    promise.Reject( winrt::to_string(ex.message()).c_str() );
}


winrt::fire_and_forget ReactNativeModule::moveFile(std::wstring srcPath, std::wstring destPath, JSValueObject options, ReactPromise<void> promise) noexcept
try
{
    winrt::hstring srcDirectoryPath, srcFileName;
    splitPath(srcPath, srcDirectoryPath, srcFileName);

    winrt::hstring destDirectoryPath, destFileName;
    splitPath(destPath, destDirectoryPath, destFileName);

    StorageFolder srcFolder{ co_await StorageFolder::GetFolderFromPathAsync(srcDirectoryPath) };
    StorageFolder destFolder{ co_await StorageFolder::GetFolderFromPathAsync(destDirectoryPath) };
    StorageFile file{ co_await srcFolder.GetFileAsync(srcFileName) };

    co_await file.MoveAsync(destFolder, destFileName, NameCollisionOption::ReplaceExisting);

    promise.Resolve();
}
catch (const hresult_error& ex)
{
    // "Failed to move file."
    promise.Reject(winrt::to_string(ex.message()).c_str());
}


winrt::fire_and_forget ReactNativeModule::copyFile(std::wstring srcPath, std::wstring destPath, JSValueObject options, ReactPromise<void> promise) noexcept
try
{
    winrt::hstring srcDirectoryPath, srcFileName;
    splitPath(srcPath, srcDirectoryPath, srcFileName);

    winrt::hstring destDirectoryPath, destFileName;
    splitPath(destPath, destDirectoryPath, destFileName);

    StorageFolder srcFolder{ co_await StorageFolder::GetFolderFromPathAsync(srcDirectoryPath) };
    StorageFolder destFolder{ co_await StorageFolder::GetFolderFromPathAsync(destDirectoryPath) };
    StorageFile file{ co_await srcFolder.GetFileAsync(srcFileName) };

    co_await file.CopyAsync(destFolder, destFileName, NameCollisionOption::ReplaceExisting);

    promise.Resolve();
}
catch (const hresult_error& ex)
{
    // "Failed to copy file."
    promise.Reject(winrt::to_string(ex.message()).c_str());
}


winrt::fire_and_forget ReactNativeModule::copyFolder(
    std::wstring srcFolderPath,
    std::wstring destFolderPath,
    ReactPromise<void> promise) noexcept
try
{
    std::filesystem::path srcPath{ srcFolderPath };
    srcPath.make_preferred();
    std::filesystem::path destPath{ destFolderPath };
    destPath.make_preferred();

    StorageFolder srcFolder{ co_await StorageFolder::GetFolderFromPathAsync(winrt::to_hstring(srcPath.c_str())) };
    StorageFolder destFolder{ co_await StorageFolder::GetFolderFromPathAsync(winrt::to_hstring(destPath.c_str())) };

    auto items{ co_await srcFolder.GetItemsAsync() };
    for (auto item : items)
    {
        if (item.IsOfType(StorageItemTypes::File))
        {
            StorageFile file{ co_await StorageFile::GetFileFromPathAsync(item.Path()) };
            co_await file.CopyAsync(destFolder, file.Name(), NameCollisionOption::ReplaceExisting);
        }
        else if (item.IsOfType(StorageItemTypes::Folder))
        {
            StorageFolder src{ co_await StorageFolder::GetFolderFromPathAsync(item.Path()) };
            StorageFolder dest{ co_await destFolder.CreateFolderAsync(item.Name(), CreationCollisionOption::OpenIfExists) };
            copyFolderHelper(src, dest);
        }
    }

    promise.Resolve();
    co_return;
}
catch (const hresult_error& ex)
{
    // "Failed to copy file."
    promise.Reject(winrt::to_string(ex.message()).c_str());
}

winrt::fire_and_forget ReactNativeModule::copyFolderHelper(
    winrt::Windows::Storage::StorageFolder src,
    winrt::Windows::Storage::StorageFolder dest) noexcept
try
{
    auto items{ co_await src.GetItemsAsync() };
    for (auto item : items)
    {
        if (item.IsOfType(StorageItemTypes::File))
        {
            StorageFile file{ co_await StorageFile::GetFileFromPathAsync(item.Path()) };
            co_await file.CopyAsync(dest, file.Name(), NameCollisionOption::ReplaceExisting);
        }
        else if (item.IsOfType(StorageItemTypes::Folder))
        {
            StorageFolder srcFolder{ co_await StorageFolder::GetFolderFromPathAsync(item.Path()) };
            StorageFolder destFolder{ co_await dest.CreateFolderAsync(item.Name(), CreationCollisionOption::OpenIfExists) };
            copyFolderHelper(srcFolder, destFolder);
        }
    }
}
catch (...)
{
    co_return;
}


winrt::fire_and_forget ReactNativeModule::getFSInfo(ReactPromise<JSValueObject> promise) noexcept
try
{
    auto localFolder{ Windows::Storage::ApplicationData::Current().LocalFolder() };
    auto properties{ co_await localFolder.Properties().RetrievePropertiesAsync({L"System.FreeSpace", L"System.Capacity"}) };

    JSValueObject result;
    result["freeSpace"] = unbox_value<uint64_t>(properties.Lookup(L"System.FreeSpace"));
    result["totalSpace"] = unbox_value<uint64_t>(properties.Lookup(L"System.Capacity"));

    promise.Resolve(result);
}
catch (const hresult_error& ex)
{
    // "Failed to retrieve file system info."
    promise.Reject(winrt::to_string(ex.message()).c_str());
}


winrt::fire_and_forget ReactNativeModule::unlink(std::wstring filePath, ReactPromise<void> promise) noexcept
try
{
    size_t pathLength{ filePath.length() };

    if (pathLength <= 0) {
        promise.Reject("Invalid path.");
    }
    else {
        bool hasTrailingSlash{ filePath[pathLength - 1] == '\\' || filePath[pathLength - 1] == '/' };
        std::filesystem::path path(hasTrailingSlash ? filePath.substr(0, pathLength - 1) : filePath);
        path.make_preferred();

        StorageFolder folder{ co_await StorageFolder::GetFolderFromPathAsync(path.parent_path().wstring()) };
        auto target{ co_await folder.GetItemAsync(path.filename().wstring()) };
        co_await target.DeleteAsync();

        promise.Resolve();
    }
}
catch (const hresult_error& ex)
{
    hresult result{ ex.code() };
    if (result == HRESULT_FROM_WIN32(ERROR_FILE_NOT_FOUND)) // FileNotFoundException
    {
        promise.Reject(ReactError{ "ENOENT", "ENOENT: no such file or directory, open " + winrt::to_string(filePath) });
    }
    else
    {
        // "Failed to unlink file" 
        promise.Reject( winrt::to_string(ex.message()).c_str() );
    }
}


winrt::fire_and_forget ReactNativeModule::exists(std::wstring filePath, ReactPromise<bool> promise) noexcept
try
{
    size_t fileLength{ filePath.length() };

    if (fileLength <= 0) {
        promise.Resolve(false);
    }
    else {
        bool hasTrailingSlash{ filePath[fileLength - 1] == '\\' || filePath[fileLength - 1] == '/' };
        std::filesystem::path path(hasTrailingSlash ? filePath.substr(0, fileLength - 1) : filePath);

        winrt::hstring directoryPath, fileName;
        splitPath(filePath, directoryPath, fileName);
        StorageFolder folder{ co_await StorageFolder::GetFolderFromPathAsync(directoryPath) };
        if (fileName.size() > 0) {
            co_await folder.GetItemAsync(fileName);
        }
        promise.Resolve(true);
    }
}
catch (const hresult_error& ex)
{
    hresult result{ ex.code() };
    if (result == HRESULT_FROM_WIN32(ERROR_FILE_NOT_FOUND)) {
        promise.Resolve(false);
    }
    // "Failed to check if file or directory exists.
    promise.Reject(winrt::to_string(ex.message()).c_str());
}


void ReactNativeModule::stopDownload(int32_t jobID) noexcept
{
    m_tasks.Cancel(jobID);
}


void ReactNativeModule::stopUpload(int32_t jobID) noexcept
{
    m_tasks.Cancel(jobID);
}


winrt::fire_and_forget ReactNativeModule::readFile(std::wstring filePath, ReactPromise<std::string> promise) noexcept
try
{
    winrt::hstring directoryPath, fileName;
    splitPath(filePath, directoryPath, fileName);

    StorageFolder folder{ co_await StorageFolder::GetFolderFromPathAsync(directoryPath) };
    StorageFile file{ co_await folder.GetFileAsync(fileName) };

    Streams::IBuffer buffer{ co_await FileIO::ReadBufferAsync(file) };
    winrt::hstring base64Content{ Cryptography::CryptographicBuffer::EncodeToBase64String(buffer) };
    promise.Resolve(winrt::to_string(base64Content));
}
catch (const hresult_error& ex)
{
    hresult result{ ex.code() };
    if (result == HRESULT_FROM_WIN32(ERROR_FILE_NOT_FOUND)) // FileNotFoundException
    {
        promise.Reject(ReactError{ "ENOENT", "ENOENT: no such file or directory, open " + winrt::to_string(filePath) });
    }
    else if (result == HRESULT_FROM_WIN32(E_ACCESSDENIED)) // UnauthorizedAccessException
    {
        promise.Reject(ReactError{ "EISDIR", "EISDIR: illegal operation on a directory, read" });
    }
    else
    {
        // "Failed to read file."
        promise.Reject(winrt::to_string(ex.message()).c_str());
    }
}


winrt::fire_and_forget ReactNativeModule::stat(std::wstring filePath, ReactPromise<JSValueObject> promise) noexcept
try
{
    size_t pathLength{ filePath.length() };

    if (pathLength <= 0) {
        promise.Reject("Invalid path.");
    }
    else {
        bool hasTrailingSlash{ filePath[pathLength - 1] == '\\' || filePath[pathLength - 1] == '/' };
        std::filesystem::path path(hasTrailingSlash ? filePath.substr(0, pathLength - 1) : filePath);
        path.make_preferred();

        StorageFolder folder{ co_await StorageFolder::GetFolderFromPathAsync(path.parent_path().wstring()) };
        IStorageItem item{ co_await folder.GetItemAsync(path.filename().wstring()) };

        auto properties{ co_await item.GetBasicPropertiesAsync() };
        JSValueObject fileInfo;
        fileInfo["ctime"] = winrt::clock::to_time_t(item.DateCreated());
        fileInfo["mtime"] = winrt::clock::to_time_t(properties.DateModified());
        fileInfo["size"] = std::to_string(properties.Size());
        fileInfo["type"] = item.IsOfType(StorageItemTypes::Folder) ? "1" : "0";
        promise.Resolve(fileInfo);
    }
}
catch (...)
{
    promise.Reject(ReactError{ "ENOENT", "ENOENT: no such file or directory, open " + winrt::to_string(filePath) });
}


winrt::fire_and_forget ReactNativeModule::readDir(std::wstring directory, ReactPromise<JSValueArray> promise) noexcept
try
{
    std::filesystem::path path(directory);
    path.make_preferred();
    StorageFolder targetDirectory{ co_await StorageFolder::GetFolderFromPathAsync(path.c_str()) };

    JSValueArray resultsArray;

    auto items{ co_await targetDirectory.GetItemsAsync() };
    for (auto item : items)
    {
        auto properties{ co_await item.GetBasicPropertiesAsync() };

        JSValueObject itemInfo;
        itemInfo["ctime"] = winrt::clock::to_time_t(targetDirectory.DateCreated());
        itemInfo["mtime"] = winrt::clock::to_time_t(properties.DateModified());
        itemInfo["name"] = to_string(item.Name());
        itemInfo["path"] = to_string(item.Path());
        itemInfo["size"] = properties.Size();
        itemInfo["type"] = item.IsOfType(StorageItemTypes::Folder) ? "1" : "0";

        resultsArray.push_back(std::move(itemInfo));
    }

    promise.Resolve(resultsArray);
}
catch (const hresult_error& ex)
{
    // "Failed to read directory."
    promise.Reject(winrt::to_string(ex.message()).c_str());
}


winrt::fire_and_forget ReactNativeModule::read(std::wstring filePath, uint32_t length, uint64_t position, ReactPromise<std::string> promise) noexcept
try
{
    winrt::hstring directoryPath, fileName;
    splitPath(filePath, directoryPath, fileName);

    StorageFolder folder{ co_await StorageFolder::GetFolderFromPathAsync(directoryPath) };
    StorageFile file{ co_await folder.GetFileAsync(fileName) };

    Streams::Buffer buffer{ length };

    Streams::IRandomAccessStream stream{ co_await file.OpenReadAsync() };
    stream.Seek(position);

    stream.ReadAsync(buffer, length, Streams::InputStreamOptions::None);
    std::string result{ winrt::to_string(Cryptography::CryptographicBuffer::EncodeToBase64String(buffer)) };

    promise.Resolve(result);
}
catch (const hresult_error& ex)
{
    hresult result{ ex.code() };
    if (result == HRESULT_FROM_WIN32(ERROR_FILE_NOT_FOUND)) // FileNotFoundException
    {
        promise.Reject(ReactError{ "ENOENT", "ENOENT: no such file or directory, open " + winrt::to_string(filePath) });
    }
    else if (result == HRESULT_FROM_WIN32(E_ACCESSDENIED)) // UnauthorizedAccessException
    {
        promise.Reject(ReactError{"EISDIR", "EISDIR: Could not open file for reading" });
    }
    else 
    {
        // "Failed to read from file."
        promise.Reject(winrt::to_string(ex.message()).c_str());
    }
}


winrt::fire_and_forget ReactNativeModule::hash(std::wstring filePath, std::string algorithm, ReactPromise<std::string> promise) noexcept
try
{
    // Note: SHA224 is not part of winrt 
    if (algorithm.compare("sha224") == 0)
    {
        promise.Reject(ReactError{ "Error", "WinRT does not offer sha224 encryption." });
        co_return;
    }

    winrt::hstring directoryPath, fileName;
    splitPath(filePath, directoryPath, fileName);

    StorageFolder folder{ co_await StorageFolder::GetFolderFromPathAsync(directoryPath) };
    StorageFile file{ co_await folder.GetFileAsync(fileName) };

    auto search{ availableHashes.find(algorithm) };
    if (search == availableHashes.end())
    {
        promise.Reject(ReactError{ "Error", "Invalid hash algorithm " + algorithm});
        co_return;
    }

    CryptographyCore::HashAlgorithmProvider provider{ search->second() };
    Streams::IBuffer buffer{ co_await FileIO::ReadBufferAsync(file) };

    auto hashedBuffer{ provider.HashData(buffer) };
    auto result{ winrt::to_string(Cryptography::CryptographicBuffer::EncodeToHexString(hashedBuffer)) };

    promise.Resolve(result);
}
catch (const hresult_error& ex)
{
    hresult result{ ex.code() };
    if (result == HRESULT_FROM_WIN32(ERROR_FILE_NOT_FOUND)) // FileNotFoundException
    {
        promise.Reject(ReactError{ "ENOENT", "ENOENT: no such file or directory, open " + winrt::to_string(filePath) });
    }
    else if (result == HRESULT_FROM_WIN32(E_ACCESSDENIED)) // UnauthorizedAccessException
    {
        promise.Reject(ReactError{ "EISDIR", "EISDIR: illegal operation on a directory, read" });
    }
    else
    {
        // "Failed to get checksum from file."
        promise.Reject(winrt::to_string(ex.message()).c_str());
    }
}


winrt::fire_and_forget ReactNativeModule::writeFile(std::wstring filePath, std::wstring base64Content, JSValueObject options, ReactPromise<void> promise) noexcept
try
{
    winrt::hstring base64ContentStr{ base64Content };
    Streams::IBuffer buffer{ Cryptography::CryptographicBuffer::DecodeFromBase64String(base64ContentStr) };

    winrt::hstring directoryPath, fileName;
    splitPath(filePath, directoryPath, fileName);

    StorageFolder folder{ co_await StorageFolder::GetFolderFromPathAsync(directoryPath) };
    StorageFile file{ co_await folder.CreateFileAsync(fileName, CreationCollisionOption::ReplaceExisting) };

    Streams::IRandomAccessStream stream{ co_await file.OpenAsync(FileAccessMode::ReadWrite) };
    co_await stream.WriteAsync(buffer);

    promise.Resolve();
}
catch (const hresult_error& ex)
{
    hresult result{ ex.code() };
    if (result == HRESULT_FROM_WIN32(ERROR_FILE_NOT_FOUND)) // FileNotFoundException
    {
        promise.Reject(ReactError{ "ENOENT", "ENOENT: no such file or directory, open " + winrt::to_string(filePath) });
    }
    else
    {
        // Failed to write to file."
        promise.Reject(winrt::to_string(ex.message()).c_str());
    }
}


winrt::fire_and_forget ReactNativeModule::appendFile(std::wstring filePath, std::wstring base64Content, ReactPromise<void> promise) noexcept
try
{
    size_t fileLength = filePath.length();
    bool hasTrailingSlash{ filePath[fileLength - 1] == '\\' || filePath[fileLength - 1] == '/' };
    std::filesystem::path path(hasTrailingSlash ? filePath.substr(0, fileLength - 1) : filePath);

    winrt::hstring directoryPath, fileName;
    splitPath(filePath, directoryPath, fileName);

    StorageFolder folder{ co_await StorageFolder::GetFolderFromPathAsync(directoryPath) };
    StorageFile file{ co_await folder.CreateFileAsync(fileName, CreationCollisionOption::OpenIfExists) };

    winrt::hstring base64ContentStr{ base64Content };
    Streams::IBuffer buffer{ Cryptography::CryptographicBuffer::DecodeFromBase64String(base64ContentStr) };
    Streams::IRandomAccessStream stream{ co_await file.OpenAsync(FileAccessMode::ReadWrite) };

    stream.Seek(stream.Size()); // Writes to end of file
    co_await stream.WriteAsync(buffer);

    promise.Resolve();
}
catch (const hresult_error& ex)
{
    hresult result{ ex.code() };
    if (result == HRESULT_FROM_WIN32(ERROR_FILE_NOT_FOUND)) // FileNotFoundException
    {
        promise.Reject(ReactError{ "ENOENT", "ENOENT: no such file or directory, open " + winrt::to_string(filePath) });
    }
    else
    {
        // "Failed to append to file."
        promise.Reject(winrt::to_string(ex.message()).c_str());
    }
}
winrt::fire_and_forget ReactNativeModule::write(std::wstring filePath, std::wstring base64Content, int position, ReactPromise<void> promise) noexcept
try
{
    winrt::hstring directoryPath, fileName;
    splitPath(filePath, directoryPath, fileName);

    StorageFolder folder{ co_await StorageFolder::GetFolderFromPathAsync(directoryPath) };
    StorageFile file{ co_await folder.CreateFileAsync(fileName, CreationCollisionOption::OpenIfExists) };

    winrt::hstring base64ContentStr{ base64Content };
    Streams::IBuffer buffer{ Cryptography::CryptographicBuffer::DecodeFromBase64String(base64ContentStr) };
    Streams::IRandomAccessStream stream{ co_await file.OpenAsync(FileAccessMode::ReadWrite) };

    if (position < 0)
    {
        stream.Seek(stream.Size()); // Writes to end of file
    }
    else
    {
        stream.Seek(position);
    }
    co_await stream.WriteAsync(buffer);
    promise.Resolve();
}
catch (const hresult_error& ex)
{
    hresult result{ ex.code() };
    if (result == HRESULT_FROM_WIN32(ERROR_FILE_NOT_FOUND)) // FileNotFoundException
    {
        promise.Reject(ReactError{ "ENOENT", "ENOENT: no such file or directory, open " + winrt::to_string(filePath) });
    }
    else
    {
        // Failed to write to file."
        promise.Reject(winrt::to_string(ex.message()).c_str());
    }
}


winrt::fire_and_forget ReactNativeModule::downloadFile(JSValueObject options, ReactPromise<JSValueObject> promise) noexcept
{
    //JobID
    auto jobId{ options["jobId"].AsInt32() };
    try
    {
        //Filepath
        std::wstring filePath = winrt::to_hstring(options["toFile"].AsString()).c_str();
        std::filesystem::path path(filePath);
        path.make_preferred();
        if (path.filename().empty())
        {
            promise.Reject("Failed to determine filename in path");
            co_return;
        }

        //URL
        std::string fromURLString{ options["fromUrl"].AsString() };
        auto URLForURI = winrt::to_hstring(fromURLString);
        Uri uri{ URLForURI };

        //Headers
        auto const& headers{ options["headers"].AsObject() };

        //Progress Interval
        auto progressInterval{ options["progressInterval"].AsInt64() };

        //Progress Divider
        auto progressDivider{ options["progressDivider"].AsInt64() };

        winrt::Windows::Web::Http::HttpRequestMessage request{ winrt::Windows::Web::Http::HttpMethod::Get(), uri };
        Buffer buffer{ 8 * 1024 };
        HttpBufferContent content{ buffer };
        for (const auto& header : headers)
        {
            if (!request.Headers().TryAppendWithoutValidation(winrt::to_hstring(header.first), winrt::to_hstring(header.second.AsString())))
            {
                content.Headers().TryAppendWithoutValidation(winrt::to_hstring(header.first), winrt::to_hstring(header.second.AsString()));
            }
        }
        request.Content(content);

        co_await m_tasks.Add(jobId, ProcessDownloadRequestAsync(promise, request, filePath, jobId, progressInterval, progressDivider));
    }
    catch (const hresult_error& ex)
    {
        // "Failed to download file." 
        promise.Reject(winrt::to_string(ex.message()).c_str());
    }
    // NOTE: Do not cancel here; allow stopDownload() to cancel if requested.
}


winrt::fire_and_forget ReactNativeModule::uploadFiles(JSValueObject options, ReactPromise<JSValueObject> promise) noexcept
{
    auto jobId{ options["jobId"].AsInt32() };
    try
    {
        auto method{ options["method"].AsString() };

        winrt::Windows::Web::Http::HttpMethod httpMethod{ winrt::Windows::Web::Http::HttpMethod::Post() };
        if (method.compare("POST") != 0)
        {
            if (method.compare("PUT") == 0)
            {
                httpMethod = winrt::Windows::Web::Http::HttpMethod::Put();
            }
            else
            {
                promise.Reject("Invalid HTTP request: neither a POST nor a PUT request.");
                co_return;
            }
        }

        auto const& files{ options["files"].AsArray() };
        uint64_t totalUploadSize = 0;
        for (const auto& fileInfo : files)
        {
            auto const& fileObj{ fileInfo.AsObject() };
            auto filePath{ fileObj["filepath"].AsString() };

            // Convert std::string to std::wstring
            std::wstring wFilePath = winrt::to_hstring(filePath).c_str();

            winrt::hstring directoryPath, fileName;
            splitPath(wFilePath, directoryPath, fileName);

            try
            {
                StorageFolder folder{ co_await StorageFolder::GetFolderFromPathAsync(directoryPath) };
                StorageFile file{ co_await folder.GetFileAsync(fileName) };
                auto fileProperties{ co_await file.GetBasicPropertiesAsync() };
                totalUploadSize += fileProperties.Size();
            }
            catch (...)
            {
                continue;
            }
        }
        if (totalUploadSize <= 0)
        {
            promise.Reject("No files to upload");
            co_return;
        }

        co_await m_tasks.Add(jobId, ProcessUploadRequestAsync(promise, options, httpMethod, files, jobId, totalUploadSize));
    }
    catch (const hresult_error& ex)
    {
        // "Failed to upload file."
        promise.Reject(winrt::to_string(ex.message()).c_str());
    }
    // NOTE: Do not cancel here; allow stopUpload() to cancel if requested.
}


void ReactNativeModule::touch(std::wstring filePath, int64_t mtime, int64_t ctime, bool modifyCreationTime, ReactPromise<std::string> promise) noexcept
try
{

    std::filesystem::path path(filePath);
    path.make_preferred();
    auto s_path{ path.c_str() };
    PCWSTR actual_path{ s_path };
    DWORD accessMode{ GENERIC_READ | GENERIC_WRITE };
    DWORD shareMode{ FILE_SHARE_WRITE };
    DWORD creationMode{ OPEN_EXISTING };

    std::unique_ptr<void, handle_closer> handle(safe_handle(CreateFile2(actual_path, accessMode, shareMode, creationMode, nullptr)));
    if (!handle)
    {
        promise.Reject("Failed to create handle for file to touch.");
        return;
    }

    touchTime mtime_64{ mtime * 10000 + UNIX_EPOCH_IN_WINRT_INTERVAL };
    FILETIME mFileTime;
    mFileTime.dwLowDateTime = mtime_64.splitTime[0];
    mFileTime.dwHighDateTime = mtime_64.splitTime[1];

    if (modifyCreationTime)
    {
        touchTime ctime_64{ ctime * 10000 + UNIX_EPOCH_IN_WINRT_INTERVAL };
        FILETIME cFileTime;
        cFileTime.dwLowDateTime = ctime_64.splitTime[0];
        cFileTime.dwHighDateTime = ctime_64.splitTime[1];

        if (SetFileTime(handle.get(), &cFileTime, nullptr, &mFileTime) == 0)
        {
            promise.Reject("Failed to set new creation time and modified time of file.");
        }
        else
        {
            promise.Resolve(winrt::to_string(s_path));
        }
    }
    else
    {
        if (SetFileTime(handle.get(), nullptr, nullptr, &mFileTime) == 0)
        {
            promise.Reject("Failed to set new creation time and modified time of file.");
        }
        else
        {
            promise.Resolve(winrt::to_string(s_path));
        }
    }
}
catch (const hresult_error& ex)
{
    hresult result{ ex.code() };
    if (result == HRESULT_FROM_WIN32(ERROR_FILE_NOT_FOUND)) // FileNotFoundException
    {
        promise.Reject("ENOENT: no such file.");
    }
    else
    {
        // "Failed to touch file."
        promise.Reject(winrt::to_string(ex.message()).c_str());
    }
}


void ReactNativeModule::splitPath(const std::wstring& filePath, winrt::hstring& directoryPath, winrt::hstring& fileName) noexcept
{
    std::filesystem::path path(filePath);
    path.make_preferred();

    directoryPath = path.has_parent_path() ? winrt::to_hstring(path.parent_path().c_str()) : L"";
    fileName = path.has_filename() ? winrt::to_hstring(path.filename().c_str()) : L"";
}


IAsyncAction ReactNativeModule::ProcessDownloadRequestAsync(ReactPromise<JSValueObject> promise,
    winrt::Windows::Web::Http::HttpRequestMessage request, std::wstring_view filePath, int32_t jobId, int64_t progressInterval, int64_t progressDivider)
{
    try
    {
        HttpResponseMessage response = co_await m_httpClient.SendRequestAsync(request, HttpCompletionOption::ResponseHeadersRead);
        IReference<uint64_t> contentLength{ response.Content().Headers().ContentLength() };
        {
            JSValueObject headersMap;
            for (auto const& header : response.Headers())
            {
                headersMap[to_string(header.Key())] = to_string(header.Value());
            }

            emitDownloadBegin(
              JSValueObject{
                { "jobId", jobId },
                { "statusCode", (int)response.StatusCode() },
                { "contentLength", contentLength && contentLength.Type() == PropertyType::UInt64
                  ? JSValue(contentLength.Value())
                  : JSValue{nullptr} },
                { "headers", std::move(headersMap) },
            });
        }

        uint64_t totalRead{ 0 };

        std::filesystem::path fsFilePath{ filePath };

        StorageFolder storageFolder{ co_await StorageFolder::GetFolderFromPathAsync(fsFilePath.parent_path().wstring()) };
        StorageFile storageFile{ co_await storageFolder.CreateFileAsync(fsFilePath.filename().wstring(), CreationCollisionOption::ReplaceExisting) };
        IRandomAccessStream  stream{ co_await storageFile.OpenAsync(FileAccessMode::ReadWrite) };
        IOutputStream outputStream{ stream.GetOutputStreamAt(0) };

        auto contentStream = co_await response.Content().ReadAsInputStreamAsync();
        auto contentLengthForProgress = contentLength && contentLength.Type() == PropertyType::UInt64 ? contentLength.Value() : -1;
        
        Buffer buffer{ 8 * 1024 };
        uint32_t read = 0;
        int64_t initialProgressTime{ winrt::clock::now().time_since_epoch().count() / 10000 };
        int64_t currentProgressTime;
        uint64_t progressDividerUnsigned{ uint64_t(progressDivider) };

        for (;;)
        {
            buffer.Length(0);
            auto readBuffer = co_await contentStream.ReadAsync(buffer, buffer.Capacity(), InputStreamOptions::None);
            read = readBuffer.Length();
            if (readBuffer.Length() == 0)
            {
                break;
            }

            co_await outputStream.WriteAsync(readBuffer);
            totalRead += read;

            if (progressInterval > 0)
            {
                currentProgressTime = winrt::clock::now().time_since_epoch().count() / 10000;
                if(currentProgressTime - initialProgressTime >= progressInterval)
                {
                    m_reactContext.CallJSFunction(L"RCTDeviceEventEmitter", L"emit", L"DownloadProgress",
                        JSValueObject{
                            { "jobId", jobId },
                            { "contentLength", contentLength && contentLength.Type() == PropertyType::UInt64
                              ? JSValue(contentLength.Value()) : JSValue{nullptr} },
                            { "bytesWritten", totalRead },
                        });
                    initialProgressTime = winrt::clock::now().time_since_epoch().count() / 10000;
                }
            }
            else if (progressDivider <= 0)
            {
                m_reactContext.CallJSFunction(L"RCTDeviceEventEmitter", L"emit", L"DownloadProgress",
                    JSValueObject{
                        { "jobId", jobId },
                        { "contentLength", contentLength && contentLength.Type() == PropertyType::UInt64
                          ? JSValue(contentLength.Value()) : JSValue{nullptr} },
                        { "bytesWritten", totalRead },
                    });
            }
            else
            {
                if (totalRead * 100 / contentLengthForProgress >= progressDividerUnsigned ||
                    totalRead == contentLengthForProgress) {
                    m_reactContext.CallJSFunction(L"RCTDeviceEventEmitter", L"emit", L"DownloadProgress",
                        JSValueObject{
                            { "jobId", jobId },
                            { "contentLength", contentLength && contentLength.Type() == PropertyType::UInt64
                              ? JSValue(contentLength.Value()) : JSValue{nullptr} },
                            { "bytesWritten", totalRead },
                        });
                }
            }
        }

        promise.Resolve(JSValueObject
            {
                { "jobId", jobId },
                { "statusCode", (int)response.StatusCode() },
                { "bytesWritten", totalRead },
            });
    }
    catch (winrt::hresult_canceled const& ex)
    {
        std::stringstream ss;
        ss << "CANCELLED: job '" << jobId << "' to file '" << to_string(filePath) << "'";
        promise.Reject(ReactError{ std::to_string(ex.code()), ss.str(), JSValueObject{} });
    }
    catch (const hresult_error& ex)
    {
        promise.Reject(winrt::to_string(ex.message()).c_str());
    }
}


IAsyncAction ReactNativeModule::ProcessUploadRequestAsync(ReactPromise<JSValueObject> promise, JSValueObject& options,
    winrt::Windows::Web::Http::HttpMethod httpMethod, JSValueArray const& files, int32_t jobId, uint64_t totalUploadSize)
{
    try
    {
        winrt::hstring boundary{ L"-----" };
        std::string toUrl{ options["toUrl"].AsString() };
        std::wstring URLForURI(toUrl.begin(), toUrl.end());
        Uri uri{ URLForURI };

        winrt::Windows::Web::Http::HttpRequestMessage requestMessage{ httpMethod, uri };

        // Determine whether to stream raw binary or multipart form data
        bool binaryStreamOnly{
            options.find("binaryStreamOnly") != options.end() && options["binaryStreamOnly"].AsBoolean()
        };

        // Prepare the request content object accordingly
        winrt::Windows::Web::Http::IHttpContent requestContent{ nullptr };
        winrt::Windows::Web::Http::HttpMultipartFormDataContent multipartContent{ boundary };

        auto const& headers{ options["headers"].AsObject() };
        
        for (auto const& entry : headers)
        {
            // Apply headers either to the message or the content depending on validation
            if (requestContent)
            {
                if (!requestMessage.Headers().TryAppendWithoutValidation(winrt::to_hstring(entry.first), winrt::to_hstring(entry.second.AsString())))
                {
                    requestContent.Headers().TryAppendWithoutValidation(winrt::to_hstring(entry.first), winrt::to_hstring(entry.second.AsString()));
                }
            }
            else
            {
                requestMessage.Headers().TryAppendWithoutValidation(winrt::to_hstring(entry.first), winrt::to_hstring(entry.second.AsString()));
            }
        }

        // Emit begin event early
        m_reactContext.CallJSFunction(L"RCTDeviceEventEmitter", L"emit", L"UploadBegin",
            JSValueObject{
                { "jobId", jobId },
            });

        uint64_t totalUploaded{ 0 };

        if (binaryStreamOnly)
        {
            // Stream only the first file as raw request body
            if (files.Size() == 0)
            {
                promise.Reject("No files to upload");
                co_return;
            }

            auto const& firstFileObj{ files.GetAt(0).AsObject() };
            auto firstFilePath{ firstFileObj["filepath"].AsString() };
            std::wstring wFilePath = winrt::to_hstring(firstFilePath).c_str();

            winrt::hstring directoryPath, fileName;
            splitPath(wFilePath, directoryPath, fileName);
            StorageFolder folder{ co_await StorageFolder::GetFolderFromPathAsync(directoryPath) };
            StorageFile file{ co_await folder.GetFileAsync(fileName) };

            auto properties{ co_await file.GetBasicPropertiesAsync() };
            auto buffer{ co_await FileIO::ReadBufferAsync(file) };

            HttpBufferContent binaryContent{ buffer };
            // Default to octet-stream if caller did not set Content-Type in headers
            binaryContent.Headers().TryAppendWithoutValidation(L"Content-Type", L"application/octet-stream");

            requestMessage.Content(binaryContent);

            // Emit a final progress snapshot
            totalUploaded = properties.Size();
            m_reactContext.CallJSFunction(L"RCTDeviceEventEmitter", L"emit", L"UploadProgress",
                JSValueObject{
                    { "jobId", jobId },
                    { "totalBytesExpectedToSend", totalUploadSize },
                    { "totalBytesSent", totalUploaded },
                });
        }
        else
        {
            // Multipart: add any form fields as individual parts
            auto const& fields{ options["fields"].AsObject() };
            for (auto const& field : fields)
            {
                winrt::Windows::Web::Http::HttpStringContent fieldContent{ winrt::to_hstring(field.second.AsString()) };
                multipartContent.Add(fieldContent, winrt::to_hstring(field.first));
            }

            // Add file parts
            for (const auto& fileInfo : files)
            {
                auto const& fileObj{ fileInfo.AsObject() };
                auto name{ winrt::to_hstring(fileObj["name"].AsString()) };
                auto filename{ winrt::to_hstring(fileObj["filename"].AsString()) };
                auto filePath{ fileObj["filepath"].AsString()};

                std::wstring wFilePath = winrt::to_hstring(filePath).c_str();

                try
                {
                    winrt::hstring directoryPath, fileName;
                    splitPath(wFilePath, directoryPath, fileName);
                    StorageFolder folder{ co_await StorageFolder::GetFolderFromPathAsync(directoryPath) };
                    StorageFile file{ co_await folder.GetFileAsync(fileName) };
                    auto properties{ co_await file.GetBasicPropertiesAsync() };

                    HttpBufferContent entry{ co_await FileIO::ReadBufferAsync(file) };
                    multipartContent.Add(entry, name, filename);

                    totalUploaded += properties.Size();
                    m_reactContext.CallJSFunction(L"RCTDeviceEventEmitter", L"emit", L"UploadProgress",
                        JSValueObject{
                            { "jobId", jobId },
                            { "totalBytesExpectedToSend", totalUploadSize },
                            { "totalBytesSent", totalUploaded },
                        });
                }
                catch (...)
                {
                    continue;
                }
            }

            requestContent = multipartContent;
            requestMessage.Content(requestContent);
        }

        HttpResponseMessage response = co_await m_httpClient.SendRequestAsync(requestMessage, HttpCompletionOption::ResponseHeadersRead);

        auto statusCode{ std::to_string(int(response.StatusCode())) };
        auto resultContent{ winrt::to_string(co_await response.Content().ReadAsStringAsync()) };

        // Build a headers map similar to download implementation
        JSValueObject headersMap;
        for (auto const& header : response.Headers())
        {
            headersMap[to_string(header.Key())] = to_string(header.Value());
        }
        for (auto const& header : response.Content().Headers())
        {
            headersMap[to_string(header.Key())] = to_string(header.Value());
        }

        promise.Resolve(JSValueObject
            {
                { "jobId", jobId },
                { "statusCode", std::stoi(statusCode) },
                { "headers", std::move(headersMap)},
                { "body", resultContent},
            });
    }
    catch (winrt::hresult_canceled const& ex)
    {
        std::stringstream ss;
        ss << "CANCELLED: job '" << jobId << "' to file '" << "'";
        promise.Reject(ReactError{ std::to_string(ex.code()), ss.str(), JSValueObject{} });
    }
    catch (const hresult_error& ex)
    {
        promise.Reject(winrt::to_string(ex.message()).c_str());
    }
}

void ReactNativeModule::pickFile(JSValueObject options, ReactPromise<JSValueArray> promise) noexcept
{
    m_reactContext.UIDispatcher().Post([this, options = std::move(options), promise = std::move(promise)]() mutable {
        try
        {
            // read options
            std::string pickerType = "multipleFiles"; // Default value
            if (options.find("pickerType") != options.end())
            {
                pickerType = options["pickerType"].AsString();
            }

            std::vector<std::wstring> fileTypes;
            if (options.find("fileExtensions") != options.end())
            {
                for (const auto& mimeType : options["fileExtensions"].AsArray())
                {
                    fileTypes.push_back(std::wstring(winrt::to_hstring(mimeType.AsString())));
                }
            }

            // folder picker
            if (pickerType == "folder")
            {
                FolderPicker picker;
                picker.SuggestedStartLocation(PickerLocationId::DocumentsLibrary);
                picker.FileTypeFilter().Append(L"*");

                picker.PickSingleFolderAsync().Completed([promise = std::move(promise)](IAsyncOperation<StorageFolder> const& operation, AsyncStatus const status) mutable {
                    try
                    {
                        if (status == AsyncStatus::Completed)
                        {
                            StorageFolder folder = operation.GetResults();
                            if (folder)
                            {
                                JSValueArray result;
                                result.push_back(JSValueObject{
                                    {"name", winrt::to_string(folder.Name())},
                                    {"path", winrt::to_string(folder.Path())}
                                });
                                promise.Resolve(std::move(result));
                            }
                            else
                            {
                                promise.Reject("No folder was picked.");
                            }
                        }
                        else
                        {
                            promise.Reject("Folder picker operation was not completed.");
                        }
                    }
                    catch (const hresult_error& ex)
                    {
                        promise.Reject(winrt::to_string(ex.message()).c_str());
                    }
                });
            }

            // file picker
            else
            {
                FileOpenPicker picker;
                picker.ViewMode(PickerViewMode::Thumbnail);
                picker.SuggestedStartLocation(PickerLocationId::DocumentsLibrary);

                if (!fileTypes.empty())
                {
                    for (const auto& fileType : fileTypes)
                    {
                        picker.FileTypeFilter().Append(fileType);
                    }
                }
                else
                {
                    picker.FileTypeFilter().Append(L"*");
                }

                // single files
                if (pickerType == "singleFile")
                {
                    picker.PickSingleFileAsync().Completed([promise = std::move(promise)](IAsyncOperation<StorageFile> const& operation, AsyncStatus const status) mutable {
                        try
                        {
                            if (status == AsyncStatus::Completed)
                            {
                                StorageFile file = operation.GetResults();
                                if (file)
                                {
                                    JSValueArray result;
                                    result.push_back(winrt::to_string(file.Path()));
                                    promise.Resolve(std::move(result));
                                }
                                else
                                {
                                    promise.Reject("No file was picked.");
                                }
                            }
                            else
                            {
                                promise.Reject("File picker operation was not completed.");
                            }
                        }
                        catch (const hresult_error& ex)
                        {
                            promise.Reject(winrt::to_string(ex.message()).c_str());
                        }
                    });
                }

                // multiple files
                else if (pickerType == "multipleFiles")
                {
                    picker.PickMultipleFilesAsync().Completed([promise = std::move(promise)](IAsyncOperation<IVectorView<StorageFile>> const& operation, AsyncStatus const status) mutable {
                        try
                        {
                            if (status == AsyncStatus::Completed)
                            {
                                auto files = operation.GetResults();
                                if (files.Size() > 0)
                                {
                                    JSValueArray result;
                                    for (const auto& file : files)
                                    {
                                        result.push_back(winrt::to_string(file.Path()));
                                    }
                                    promise.Resolve(std::move(result));
                                }
                                else
                                {
                                    promise.Reject("No files were picked.");
                                }
                            }
                            else
                            {
                                promise.Reject("File picker operation was not completed.");
                            }
                        }
                        catch (const hresult_error& ex)
                        {
                            promise.Reject(winrt::to_string(ex.message()).c_str());
                        }
                    });
                }
                else
                {
                    promise.Reject("Invalid pickerType option.");
                }
            }
        }
        catch (const hresult_error& ex)
        {
            promise.Reject(winrt::to_string(ex.message()).c_str());
        }
    });
}

void ReactNativeModule::addListener(std::string eventName) noexcept
{
    // Keep: Required for RN built in Event Emitter Calls.
}

void ReactNativeModule::removeListeners(int count) noexcept
{
    // Keep: Required for RN built in Event Emitter Calls.
}