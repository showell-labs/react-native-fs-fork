# react-native-fs

<!-- Collection of hyperlinks. -->
[Date]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date
[New Architecture]: https://reactnative.dev/docs/the-new-architecture/landing-page
[Old Architecture]: https://reactnative.dev/docs/native-modules-intro
[React Native]: https://reactnative.dev/
[react-native-fs]: https://github.com/itinance/react-native-fs
<!-- End of hyperlinks collection. -->

<!-- Status badges section (also double as links to related repos / CICD / etc.). -->
[![Latest NPM Release](https://img.shields.io/npm/v/@dr.pogodin/react-native-fs.svg)](https://www.npmjs.com/package/@dr.pogodin/react-native-fs)
[![NPM Downloads](https://img.shields.io/npm/dm/@dr.pogodin/react-native-fs.svg)](https://www.npmjs.com/package/@dr.pogodin/react-native-fs)
[![CircleCI](https://dl.circleci.com/status-badge/img/gh/birdofpreyru/react-native-fs/tree/master.svg?style=shield)](https://app.circleci.com/pipelines/github/birdofpreyru/react-native-fs)
[![GitHub Repo stars](https://img.shields.io/github/stars/birdofpreyru/react-native-fs?style=social)](https://github.com/birdofpreyru/react-native-fs)
[![Dr. Pogodin Studio](https://raw.githubusercontent.com/birdofpreyru/react-native-fs/master/.README/logo-dr-pogodin-studio.svg)](https://dr.pogodin.studio/docs/react-native-fs)
<!-- End of status badges section. -->

File system access for [React Native] applications for Android, iOS,
Mac (Catalyst), and Windows platforms. Supports both [new][New Architecture]
and [old][Old Architecture] [RN][React Native] architectures.

[![Sponsor](https://raw.githubusercontent.com/birdofpreyru/react-native-fs/master/.README/sponsor.svg)](https://github.com/sponsors/birdofpreyru)

---

_This is a work-in-progress fork of [react-native-fs], aiming to upgrade the library to the standards of the latest React Native v0.72, with support of the [New Architecture], backward compatibility to the [Old Architecture], clean-up and fixes of the library API and internal implementation, and further library development following the best industry practices._

_To migrate from the legacy [react-native-fs] install this fork_
```bash
npm install --save @dr.pogodin/react-native-fs
```
_then upgrade its imports in the code:_
```ts
// The legacy RNFS was imported like this:
import RNFS from 'react-native-fs';

// Instead, this fork should be imported like this:
import * as RNFS from '@dr.pogodin/react-native-fs';
// or (preferrably) you should import separate constants / functions you need
// like:
import {
  TemporaryDirectoryPath,
  writeFile,
} from '@dr.pogodin/react-native-fs';
```
_When installing the library into a new project no additional steps are required._

**ROADMAP:**
- In the nearest future there will be a bunch of **v2.21.0-alpha.X** releases,
  taking care that more and more functions of the original library work as per
  documentation.

- The aim for upcoming **v2.21.0** release is to be a drop-in replacement for
  the latest **v2.20.0** release of the original library. It will have matching
  functionality and API, with exception of any minor changes needed to fix
  inconsistencies between **v2.20.0** and its documentation, and any changes
  that just have to be done to satisfy latest React Native standards.

- In further versions, **v2.X.Y**, we'll be taking care of improvements,
  and optimizations of existing functionality, as well as adding new APIs,
  and deprecating old ones (without yet dropping them out of the codebase),
  with the ultimate goal to release **v3** version of the library.

- The aims for **v3** release are the following:
  - To unify library APIs for all platforms &mdash; the current library has
    a lots of platform-dependent APIs, which goes against the purpose and spirit
    of React Native &mdash; we'll abstract out and unify everything that is
    possible, to allow smooth cross-plaform ride.
  - To make library API closer to [Node's File System API](https://nodejs.org/dist/latest-v18.x/docs/api/fs.html).
  - To ensure that library has no intrinsic limitations (like now it is not efficient
    for handling large files, _etc._)

**IMPORTANT:** _Below is partially revised documentation for the library. It still has to be completely revised and updated. For now, for each constant / function that have been verified and tested to work in this fork there will be a **VERIFIED** note next to its description, certifying the state of its support in this fork._

---

## Table of Contents
- [Getting Started]
- [API Reference]
- [Background Downloads Tutorial (iOS)](#background-downloads-tutorial-ios)
- [Test / Demo App](#test--demo-app)

## Getting Started
[Getting Started]: #getting-started

Just install & use:
```sh
$ npm install --save @dr.pogodin/react-native-fs
```

NOTE: Windows auto-link command (at least as it was needed for example project to install the lib hosted in the parent folder):
```sh
npx react-native autolink-windows --sln "windows\ReactNativeFsExample.sln" --proj "windows\ReactNativeFsExample\ReactNativeFsExample.vcxproj"
```

## Examples
_These are legacy examples, and should be revised, there is an Example app in the `/example` folder of the codebase, you probably should rather check it than these examples._

### Basic

```javascript
// require the module
var RNFS = require('react-native-fs');

// get a list of files and directories in the main bundle
RNFS.readDir(RNFS.MainBundlePath) // On Android, use "RNFS.DocumentDirectoryPath" (MainBundlePath is not defined)
  .then((result) => {
    console.log('GOT RESULT', result);

    // stat the first file
    return Promise.all([RNFS.stat(result[0].path), result[0].path]);
  })
  .then((statResult) => {
    if (statResult[0].isFile()) {
      // if we have a file, read it
      return RNFS.readFile(statResult[1], 'utf8');
    }

    return 'no file';
  })
  .then((contents) => {
    // log the file contents
    console.log(contents);
  })
  .catch((err) => {
    console.log(err.message, err.code);
  });
```

### File creation

```javascript
// require the module
var RNFS = require('react-native-fs');

// create a path you want to write to
// :warning: on iOS, you cannot write into `RNFS.MainBundlePath`,
// but `RNFS.DocumentDirectoryPath` exists on both platforms and is writable
var path = RNFS.DocumentDirectoryPath + '/test.txt';

// write the file
RNFS.writeFile(path, 'Lorem ipsum dolor sit amet', 'utf8')
  .then((success) => {
    console.log('FILE WRITTEN!');
  })
  .catch((err) => {
    console.log(err.message);
  });

```

### File deletion
```javascript
// create a path you want to delete
var path = RNFS.DocumentDirectoryPath + '/test.txt';

return RNFS.unlink(path)
  .then(() => {
    console.log('FILE DELETED');
  })
  // `unlink` will throw an error, if the item to unlink does not exist
  .catch((err) => {
    console.log(err.message);
  });
```

### File upload (Android and IOS only)

```javascript
// require the module
var RNFS = require('react-native-fs');

var uploadUrl = 'http://requestb.in/XXXXXXX';  // For testing purposes, go to http://requestb.in/ and create your own link
// create an array of objects of the files you want to upload
var files = [
  {
    name: 'test1',
    filename: 'test1.w4a',
    filepath: RNFS.DocumentDirectoryPath + '/test1.w4a',
    filetype: 'audio/x-m4a'
  }, {
    name: 'test2',
    filename: 'test2.w4a',
    filepath: RNFS.DocumentDirectoryPath + '/test2.w4a',
    filetype: 'audio/x-m4a'
  }
];

var upload
= (response) => {
  var jobId = response.jobId;
  console.log('UPLOAD HAS BEGUN! JobId: ' + jobId);
};

var uploadProgress = (response) => {
  var percentage = Math.floor((response.totalBytesSent/response.totalBytesExpectedToSend) * 100);
  console.log('UPLOAD IS ' + percentage + '% DONE!');
};

// upload files
RNFS.uploadFiles({
  toUrl: uploadUrl,
  files: files,
  method: 'POST',
  headers: {
    'Accept': 'application/json',
  },
  fields: {
    'hello': 'world',
  },
  begin: uploadBegin,
  progress: uploadProgress
}).promise.then((response) => {
    if (response.statusCode == 200) {
      console.log('FILES UPLOADED!'); // response.statusCode, response.headers, response.body
    } else {
      console.log('SERVER ERROR');
    }
  })
  .catch((err) => {
    if(err.description === "cancelled") {
      // cancelled by user
    }
    console.log(err);
  });

```

## API Reference
[API Reference]: #api-reference

- [Constants]
  - [CachesDirectoryPath] &mdash; The absolute path to the caches directory.
  - [DocumentDirectoryPath] &mdash; The absolute path to the document directory.
  - [DownloadDirectoryPath] &mdash; (Android & Windows) The absolute path to
    the download directory (on android and Windows only).
  - [ExternalCachesDirectoryPath] &mdash; (Android) The absolute path to
    the external caches directory.
  - [ExternalDirectoryPath] &mdash; (Android) The absolute path to
    the external files, shared directory.
  - [ExternalStorageDirectoryPath] &mdash; (Android) The absolute path to
    the external storage, shared directory.
  - [LibraryDirectoryPath] &mdash; (iOS) The absolute path to
    the NSLibraryDirectory.
  - [MainBundlePath] &mdash; (non-Android) The absolute path to
    the main bundle directory.
  - [PicturesDirectoryPath] &mdash; The absolute path to the pictures directory.
  - [RoamingDirectoryPath] &mdash; (Windows) The absolute path to the roaming
    directory.
  - [TemporaryDirectoryPath] &mdash; The absolute path to the temporary
    directory.
- [Functions]
  - [copyFile()] &mdash; Copies a file to a new destination.
  - [copyFileAssets()] &mdash; (Android only) Copies an asset file to
    the given destination.
  - [exists()] &mdash; Checks if an item exists at the given path.
  - [existsAssets()] &mdash; Checks if an item exists at the given path inside
    the Android assets folder.
  - [getFSInfo()] &mdash; Gets info on the free and total storage space
    on the device, and its external storage.
  - [mkdir()] &mdash; Creates folder(s) at the given path.
  - [moveFile()] &mdash; Moves a file (or a folder with files) to a new location.
  - [readdir()] &mdash; Lists the content of a folder (names only).
  - [readDir()] &mdash; Lists the content of a folder (with item details).
  - [readDirAssets()] &mdash; (Android only) Lists the content of a folder at
    the given path inside the Android assets folder.
  - [readFile()] &mdash; Reads the file at a path and return its content as
    a string.
  - [readFileAssets()] &mdash; (Android-only) Reads the file at a path in
    the Android app's assets folder.
  - [stat()] &mdash; Returns info on a file system item.
  - [unlink()] &mdash; Unlinks (removes) a file or directory with files.
and return its contents.
- [Types]
  - [EncodingT] &mdash; Union of valid file encoding values.
  - [FileOptionsT] &mdash; Extra options for [copyFile()].
  - [FSInfoResultT] &mdash; The type of result resolved by [getFSInfo()].
  - [MkdirOptionsT] &mdash; Extra options for [mkdir()].
  - [ReadDirResItemT] &mdash; Elements returned by [readDir()].
  - [ReadDirAssetsResItemT] &mdash; Elements returned by [readDirAssets()].
  - [ReadFileOptionsT] &mdash; The type of extra options argument of
    the [readFile()] function.
  - [StatResultT] &mdash; The type of result resolved by [stat()].
  - [WriteFileOptionsT] &mdash; The type of extra options argument of
    the [writeFile()] function.
- [Legacy] &mdash; Everything else inherited from the original library,
  but not yet correctly verified to work and match the documentation.

## Constants
[Constants]: #constants

### CachesDirectoryPath
[CachesDirectoryPath]: #cachesdirectorypath
```ts
const CachesDirectoryPath: string;
```
**VERIFIED:** Android, iOS, macOS, Windows.

The absolute path to the caches directory.

### DocumentDirectoryPath
[DocumentDirectoryPath]: #documentdirectorypath
```ts
const DocumentDirectoryPath: string;
```
**VERIFIED:** Android, iOS, macOS, Windows.

The absolute path to the document directory.

### DownloadDirectoryPath
[DownloadDirectoryPath]: #downloaddirectorypath
```ts
const DownloadDirectoryPath: string;
```
**VERIFIED:** Android, Windows. **NOT SUPPORTED:** iOS, macOS.

The absolute path to the download directory (on android and Windows only).

### ExternalCachesDirectoryPath
[ExternalCachesDirectoryPath]: #externalcachesdirectorypath
```ts
const ExternalCachesDirectoryPath: string;
```
**VERIFIED:** Android, Windows (empty?). **NOT SUPPORTED:** iOS, macOS.

The absolute path to the external caches directory (android only).

### ExternalDirectoryPath
[ExternalDirectoryPath]: #externaldirectorypath
```ts
const ExternalDirectoryPath: string;
```
**VERIFIED:** Android, iOS (empty?), macOS (empty?), Windows.

The absolute path to the external files, shared directory (android only).

### ExternalStorageDirectoryPath
[ExternalStorageDirectoryPath]: #externalstoragedirectorypath
```ts
const ExternalStorageDirectoryPath: string;
```
**VERIFIED:** Android, iOS (empty?), macOS (empty?), Windows (empty?).

The absolute path to the external storage, shared directory (android only).

### LibraryDirectoryPath
[LibraryDirectoryPath]: #librarydirectorypath
```ts
const LibraryDirectoryPath: string;
```
**VERIFIED:** iOS, macOS, Windows (empty?). **NOT SUPPORTED:** Android.

The absolute path to the NSLibraryDirectory (iOS only).

### MainBundlePath
[MainBundlePath]: #mainbundlepath
```ts
const MainBundlePath: string;
```
**VERIFIED:** iOS, macOS, Windows. **NOT SUPPORTED:** Android.

The absolute path to the main bundle directory (not available on Android).

### PicturesDirectoryPath
[PicturesDirectoryPath]: #picturesdirectorypath
```ts
const PicturesDirectoryPath: string;
```
**VERIFIED:** Android, Windows. **NOT SUPPORTED:** iOS, macOS.

The absolute path to the pictures directory.

### RoamingDirectoryPath
[RoamingDirectoryPath]: #roamingdirectorypath
```ts
const RoamingDirectoryPath: string;
```
**VERIFIED:** Windows. **NOT SUPPORTED:** Android, iOS, macOS.

The absolute path to the roaming directory (Windows only).

### TemporaryDirectoryPath
[TemporaryDirectoryPath]: #temporarydirectorypath
```ts
const TemporaryDirectoryPath: string;
```
**VERIFIED**: Android, iOS, macOS, Windows.

The absolute path to the temporary directory (falls back to Caching-Directory on
Android).

IMPORTANT: when using `ExternalStorageDirectoryPath` it's necessary to request permissions (on Android) to read and write on the external storage, here an example: [React Native Offical Doc](https://facebook.github.io/react-native/docs/permissionsandroid)

## Functions
[Functions]: #functions

### copyFile()
[copyFile()]: #copyfile
```ts
function copyFile(from: string, into: string, options?: FileOptionsT): Promise<void>;
```
**VERIFIED:** Android.

Copies a file to a new destination. Throws if called on a directory.

**Note:** On Android and Windows [copyFile()] will overwrite `destPath` if it
already exists. On iOS an error will be thrown if the file already exists.
&mdash; **beware**, this has not been verified yet.

- `from` &mdash; **string** &mdash; Source path.
- `into` &mdash; **string** &mdash; Destination path.
- `options` &mdash; [FileOptionsT] | **undefined** &mdash; Optional. Additional
  settings. **beware**, it has not been verified they work, yet.
- Resolves once done.

### copyFileAssets()
[copyFileAssets()]: #copyfileassets
```ts
function copyFileAssets(from: string, into: string): Promise<void>
```
**VERIFIED:** Android. **NOT SUPPORTED:** iOS, macOS, Windows.

Copies a file from the given path in the Android app's assets folder to
the specified destination path, overwriting the file at destination, if
it exists.

- `from` &mdash; **string** &mdash; Source asset path (relative to the asset
  folder's root).
- `to` &mdash; **string** &mdash; Destination path.
- Resolves once completed.

### exists()
[exists()]: #exists
```ts
function exists(path: string): Promise<boolean>;
```
**VERIFIED:** Android, iOS, macOS, Windows.

Checks if an item exists at the given `path`.

- `path` &mdash; **string** &mdash; Path.
- Resolves to _true_ if the item exists; to _false_ otherwise.

### existsAssets()
[existsAssets()]: #existsassets
```ts
function existsAssets(path: string): Promise<boolean>;
```
**VERIFIED:** Android. **NOT SUPPORTED:** iOS, macOS, Windows.

Android-only. Checks if an item exists at the given path in the Android assets
folder.

- `path` &mdash; **string** &mdash; Path, relative to the root of the Android
  assets folder.
- Resolves _true_ if the item exists; _false_ otherwise.

### getFSInfo()
[getFSInfo()]: #getfsinfo
```ts
function getFSInfo(): Promise<FSInfoResultT>;
```
**VERIFIED:** Android

Provides information about free and total file system space.

- Resolves to an [FSInfoResultT] object.

### moveFile()
[moveFile()]: #movefile
```ts
function moveFile(from: string, into: string): Promise<void>;
```
**VERIFIED:** Android

Moves an item (a file, or a folder with files) to a new location. This is more
performant than reading and then re-writing the file data because the move
is done natively and the data doesn't have to be copied or cross the bridge.

**Note:** Overwrites existing file in Windows &mdash; To be verified, how does
it behave on other systems, and whether it really overwrites items on Windows?

- `from` &mdash; **string** &mdash; Old path of the item.
- `into` &mdash; **string** &mdash; New path of the item.
- Resolves once the operation is completed.

### mkdir()
[mkdir()]: #mkdir
```ts
function mkdir(path: string, options?: MkdirOptionsT): Promise<void>;
```
**VERIFIED:** Android, iOS, macOS, Windows.

Creates folder(s) at `path`, and does not throw if already exists (similar to
`mkdir -p` in Linux).

- `path` &mdash; **string** &mdash; Path to create.
- `options` &mdash; **[MkdirOptionsT]** | **undefined** &mdash; Optional.
  Additional parameters.
- Resolves once completed.

### readdir()
[readdir()]: #readdir-1
```ts
function readdir(path: string): Promise<string[]>;
```
**VERIFIED:** Android

Lists the content of given folder (names only &mdash; NodeJS-style). Note the
lowercase `d` in the name, unlike in [readDir()].

- `path` &mdash; **string** &mdash; Folder path.
- Resolves to a **string** array &mdash; the names of items in the folder.

### readDir()
[readDir()]: #readdir-2
```ts
function readDir(path: string): Promise<ReadDirItem[]>;
```
**VERIFIED:** Android.

Lists the content of given absolute path.
- `path` &mdash; **string** &mdash; Path.
- Resolves to an array of [ReadDirResItemT] objects.

### readDirAssets()
[readDirAssets()]: #readdirassets
```ts
function readDirAssets(path: string): Promise<ReadDirItem[]>;
```
**VERIFIED:** Android. **NOT SUPPORTED:** iOS, macOS, Windows.

(Android only) Lists the content of a folder at the given `path` inside
the Android assets folder.

- `path` &mdash; **string** &mdash; Folder path, relative to the root of
  the `assets` folder.
- Resolves to an array of [ReadDirAssetsResItemT] objects.

### readFile()
[readFile()]: #readfile
```ts
function readFile(path: string, encodingOrOptions?: EncodingT | ReadFileOptionsT): Promise<string>;
```
**VERIFIED:** Android, iOS, macOS, Windows.

Reads the file at `path` and return its content as a string.

**NOTE:** For `base64` encoding this function will return file content encoded
into Base64 format; for `ascii` it will fill each character of the result string
with the code of corresponding byte in the file; and for `utf8` (default)
it will assume the source file is UTF8-encoded, and it will decode it into
the result string (thus each result character will be corresponding to a group
of 1-to-4 bytes of the source file).

**BEWARE:** You will take quite a performance hit if you are reading big files.

- `path` &mdash; **string** &mdash; File path.
- `encoding` &mdash; [EncodingT] | [ReadFileOptionsT] &mdash; Optional.
  File encoding, or extra options.
- Resolves to **string** &mdash; the content read from the file, and transformed
  according to the given encoding.

### readFileAssets()
[readFileAssets()]: #readfileassets
```ts
function readFileAssets(path:string, encoding?: EncodingT | ReadFileOptionsT): Promise<string>;
```
**VERIFIED:** Android. **NOT SUPPORTED:** iOS, macOS, Windows.

Android-only. Reads the file at `path` in the Android app's assets folder
and return its contents. `encoding` can be one of `utf8` (default), `ascii`,
`base64`. Use `base64` for reading binary files.

- `path` &mdash; **string** &mdash; Asset path.
- `encoding` &mdash; [EncodingT] | [ReadFileOptionsT] | **undefined** &mdash;
  Optional. Encoding, or extra options object, which currently only supports
  specifying the encoding.
- Resolves to **string** &mdash; the asset content.

### stat()
[stat()]: #stat
```ts
function stat(path: string): Promise<StatResultT>;
```
**VERIFIED:** Android

Stats an item at `path`. If the `path` is linked to a virtual file, for example
Android Content URI, the `originalPath` can be used to find the pointed file
path (**beware** &mdash; this has not been verified yet).

- `path` &mdash; **string** &mdash; Item path.
- Resolves to a [StatResultT] object.

### unlink()
[unlink()]: #unlink
```ts
function unlink(path: string): Promise<void>;
```
**VERIFIED:** Android, iOS, macOS, Windows.

Unlinks (removes) the item at `path`. If the item does not exist, an error will
be thrown. Also recursively deletes directories (works like Linux `rm -rf`).

- `path` &mdash; **string** &mdash; Item path.
- Resolves once done.

### writeFile()
[writeFile()]: #writefile
```ts
function writeFile(path: string, content: string, encodingOrOptions?: EncodingT | WriteFileOptionsT): Promise<void>
```
**VERIFIED:** Android, iOS, macOS, Windows.

Write the `content` to the file at `path`, overwritting it if exists already.

**NOTE:** With `base64` encoding value this function will assume that given
`content` is Base64-encoded already, and it will be decoded into the file;
for `ascii` encoding each character of `content` will be written to one byte
in the file, and the function will fail if any character is outside
the U+0000 to U+00FF range (keep in mind, that regular JS strings have
two-byte characters); and for `utf8` encoding (default) it will encode
`content` characters (which can be from U+0000 to U+FFFF in this case)
into the corresponding UTF8 code (_i.e._ each source character will be
turned into a group of 1-to-4 bytes in the written file).

- `path` &mdash; **string** &mdash; File path.
- `content` &mdash; **string** &mdash; Data to write into the file.
- `encodingOrOptions` &mdash; [EncodingT] | [WriteFileOptionsT] &mdash; Data
  encoding, or extra options.
- Resolves once completed.

## Types
[Types]: #types

### EncodingT
[EncodingT]: #encodingt
```ts
type EncodingT = 'ascii' | 'base64' | `utf8`;
```
Union of valid file encoding values.

### FileOptionsT
[FileOptionsT]: #fileoptionst
```ts
type FileOptionsT = {
  // iOS-specific.
  NSFileProtectionKey?: string;
};
```
The type of additional options for [copyFile()].

- `NSFileProtectionKey` &mdash; **string** | **undefined** &mdash; Optional.
  iOS-only. See https://developer.apple.com/documentation/foundation/nsfileprotectionkey

### FSInfoResultT
[FSInfoResultT]: #fsinforesultt
```js
type FSInfoResultT = {
  freeSpace: number;
  freeSpaceEx: number;
  totalSpace: number;
  totalSpaceEx: number;
};
```
The type of result resolved by [getFSInfo()].

- `freeSpace` &mdash; **number** &mdash; Free storage space on the device,
  in bytes.
- `freeSpaceEx` &mdash; **number** &mdash; Free storage space in the external
  storage, in bytes.
- `totalSpace` &mdash; **number** &mdash; The total storage space on the device,
  in bytes.
- `totalSpaceEx` &mdash; **number** &mdash; The total storage space in
  the external storage, in bytes.

### MkdirOptionsT
[MkdirOptionsT]: #mkdiroptionst
```ts
type MkdirOptionsT = {
  NSURLIsExcludedFromBackupKey?: boolean; // iOS only
};
```
Type of extra options argument for [mkdir()].
- `NSURLIsExcludedFromBackupKey` &mdash; **boolean** | **undefined** &mdash;
  (iOS only) The  property can be provided to set this attribute on iOS platforms.
  Apple will *reject* apps for storing offline cache data that does not have this
  attribute.


### ReadDirAssetsResItemT
[ReadDirAssetsResItemT]: #readdirassetsresitemt
```ts
type ReadDirAssetsResItemT = {
  name: string;
  path: string;
  size: string;
  isFile: () => boolean;
  isDirectory: () => boolean;
};
```
Type of result elements returned by the [readDirAssets()] function.

- `name` &mdash; **string** &mdash; Item name.
- `path` &mdash; **string** &mdash; Item path.
- `size` &mdash; **string** &mdash; Size in bytes. Note that the size of files
  compressed during the creation of the APK (such as JSON files) cannot be
  determined. `size` will be set to -1 in this case.
- `isFile` &mdash; **() => boolean** &mdash; Is this item a regular file?
- `isDirectory` &mdash; **() => boolean** &mdash; Is this item a directory?

### ReadDirResItemT
[ReadDirResItemT]: #readdirresitemt
```ts
type ReadDirResItemT = {
  ctime: Date | null;
  mtime: Date;
  name: string;
  path: string;
  size: number;
  isFile: () => boolean;
  isDirectory: () => boolean;
};
```
The type of objects returned by the [readDir()] function.
- `ctime` &mdash; [Date] | **null** &mdash; Item creation date (iOS only;
  **null** on other platforms).
- `isDirectory` &mdash; **() => boolean** &mdash; Evaluates _true_ if item is
  a folder; _false_ otherwise.
- `isFile` &mdash; **() => boolean** &mdash; Evaluates _true_ if item is
  a file; _false_ otherwise.
- `mtime` &mdash; [Date] &mdash; The last modified date of the item.
- `name` &mdash; **string** &mdash; Name of the item.
- `path` &mdash; **string** &mdash; Absolute path of the item.
- `size` &mdash; **number** &mdash; Item size in bytes.

### ReadFileOptionsT
[ReadFileOptionsT]: #readfileoptionst
```ts
type ReadFileOptionsT = {
  encoding?: EncodingT;
};
```
The type of extra options argument of the [readFile()] function.

- `encoding` &mdash; [EncodingT] | **undefined** &mdash; Optional. File encoding.
  Defaults `utf8`.

### StatResultT
[StatResultT]: #statresultt
```ts
type StatResultT = {
  ctime: Date;
  isDirectory: () => boolean;
  isFile: () => boolean;
  mode: undefined;
  mtime: Date;
  originalFilepath: string;
  path: string;
  size: number;
};
```
The type of result resolved by [stat()].

- `ctime` &mdash; [Date] &mdash; Item's creation date.
- `isDirectory` &mdash; **() => boolean** &mdash; Evaluates _true_ if the item
  is a folder; _false_ otherwise.
- `isFile` &mdash; **() => boolean** &mdash; Evaluates _true_ if the item is
  a file; _false_ otherwise.
- `mode` &mdash; **undefined** &mdash; It was documented as _UNIX file mode_,
  with **number** type, but at least on Android the library did not return
  such value from [stat()]. We'll do something about it later.
- `mtime` &mdash; [Date] &mdash; Item's last modification date.
- `originalFilepath` &mdash; **string** &mdash; (Android-only) In case
  of content uri this is the pointed file path, otherwise is the same as `path`.
- `path` &mdash; **string** &mdash; Item path.
- `size` &mdash; **number** &mdash; Item size in bytes.

### WriteFileOptionsT
[WriteFileOptionsT]: #writefileoptionst
```ts
type WriteFileOptionsT = {
  encoding?: EncodingT;
  NSFileProtectionKey?: string;
};
```
The type of extra options argument of the [writeFile()] function.

- `encoding` &mdash; [EncodingT] | **undefined** &mdash; Optional. File encoding
  to use. Defaults `utf8`.
- `NSFileProtectionKey` &mdash; **string** | **undefined** &mdash; Optional.
  iOS-only. See: https://developer.apple.com/documentation/foundation/nsfileprotectionkey

## Legacy
[Legacy]: #legacy
Below is the original documentation for all other methods and types inherited
from the original library. They are present in the codebase, but haven't been
tested to work after refactoring for the new version of the library, and a few
of them were commented out and marked as not yet supported on some platforms.

### `read(filepath: string, length = 0, position = 0, encodingOrOptions?: any): Promise<string>`

Reads `length` bytes from the given `position` of the file at `path` and returns contents. `encoding` can be one of `utf8` (default), `ascii`, `base64`. Use `base64` for reading binary files.

Note: reading big files piece by piece using this method may be useful in terms of performance.

### `readFileRes(filename:string, encoding?: string): Promise<string>`

Reads the file named `filename` in the Android app's `res` folder and return contents. Only the file name (not folder) needs to be specified. The file type will be detected from the extension and automatically located within `res/drawable` (for image files) or `res/raw` (for everything else). `encoding` can be one of `utf8` (default), `ascii`, `base64`. Use `base64` for reading binary files.

Note: Android only.

### `appendFile(filepath: string, contents: string, encoding?: string): Promise<void>`

Append the `contents` to `filepath`. `encoding` can be one of `utf8` (default), `ascii`, `base64`.

### `write(filepath: string, contents: string, position?: number, encoding?: string): Promise<void>`

Write the `contents` to `filepath` at the given random access position. When `position` is `undefined` or `-1` the contents is appended to the end of the file. `encoding` can be one of `utf8` (default), `ascii`, `base64`.

### `copyFolder(srcFolderPath: string, destFolderPath: string): Promise<void>`

Copies the contents located at `srcFolderPath` to `destFolderPath`.

Note: Windows only. This method is recommended when directories need to be copied from one place to another.

### `copyFileRes(filename: string, destPath: string): Promise<void>`

Copies the file named `filename` in the Android app's res folder and copies it to the given `destPath ` path. `res/drawable` is used as the source parent folder for image files, `res/raw` for everything else.

Note: Android only. Will overwrite destPath if it already exists.

### (iOS only) `copyAssetsFileIOS(imageUri: string, destPath: string, width: number, height: number, scale?: number, compression?: number, resizeMode?: string): Promise<string>`

*Not available on Mac Catalyst.*

Reads an image file from Camera Roll and writes to `destPath`. This method [assumes the image file to be JPEG file](https://github.com/itinance/react-native-fs/blob/f2f8f4a058cd9acfbcac3b8cf1e08fa1e9b09786/RNFSManager.m#L752-L753). This method will download the original from iCloud if necessary.

#### Parameters

##### `imageUri` string (required)

URI of a file in Camera Roll. Can be [either of the following formats](https://github.com/itinance/react-native-fs/blob/f2f8f4a058cd9acfbcac3b8cf1e08fa1e9b09786/RNFSManager.m#L781-L785):

- `ph://CC95F08C-88C3-4012-9D6D-64A413D254B3/L0/001`
- `assets-library://asset/asset.JPG?id=CC95F08C-88C3-4012-9D6D-64A413D254B3&ext=JPG`

##### `destPath` string (required)

Destination to which the copied file will be saved, e.g. `RNFS.TemporaryDirectoryPath + 'example.jpg'`.

##### `width` number (required)

Copied file's image width will be resized to `width`. [If 0 is provided, width won't be resized.](https://github.com/itinance/react-native-fs/blob/f2f8f4a058cd9acfbcac3b8cf1e08fa1e9b09786/RNFSManager.m#L808)

##### `height` number (required)

Copied file's image height will be resized to `height`. [If 0 is provided, height won't be resized.](https://github.com/itinance/react-native-fs/blob/f2f8f4a058cd9acfbcac3b8cf1e08fa1e9b09786/RNFSManager.m#L808)

##### `scale` number (optional)

Copied file's image will be scaled proportional to `scale` factor from `width` x `height`. If both `width` and `height` are 0, the image won't scale. Range is [0.0, 1.0] and default is 1.0.

##### `compression` number (optional)

Quality of copied file's image. The value 0.0 represents the maximum compression (or lowest quality) while the value 1.0 represents the least compression (or best quality). Range is [0.0, 1.0] and default is 1.0.

##### `resizeMode` string (optional)

If `resizeMode` is 'contain', copied file's image will be scaled so that its larger dimension fits `width` x `height`. If `resizeMode` is other value than 'contain', the image will be scaled so that it completely fills `width` x `height`. Default is 'contain'. Refer to [PHImageContentMode](https://developer.apple.com/documentation/photokit/phimagecontentmode).

#### Return value

##### `Promise<string>`

Copied file's URI.

#### Video-Support

One can use this method also to create a thumbNail from a video in a specific size.
Currently it is impossible to specify a concrete position, the OS will decide wich
Thumbnail you'll get then.
To copy a video from assets-library and save it as a mp4-file, refer to copyAssetsVideoIOS.

Further information: https://developer.apple.com/reference/photos/phimagemanager/1616964-requestimageforasset
The promise will on success return the final destination of the file, as it was defined in the destPath-parameter.

### (iOS only) `copyAssetsVideoIOS(videoUri: string, destPath: string): Promise<string>`

*Not available on Mac Catalyst.*

Copies a video from assets-library, that is prefixed with 'assets-library://asset/asset.MOV?...' to a specific destination.

### `existsRes(filename: string): Promise<boolean>`

Check in the Android res folder if the item named `filename` exists. `res/drawable` is used as the parent folder for image files, `res/raw` for everything else. If the item does not exist, return false.

Note: Android only.

### `hash(filepath: string, algorithm: string): Promise<string>`

Reads the file at `path` and returns its checksum as determined by `algorithm`, which can be one of `md5`, `sha1`, `sha224`, `sha256`, `sha384`, `sha512`.

### `touch(filepath: string, mtime?: Date, ctime?: Date): Promise<string>`

Sets the modification timestamp `mtime` and creation timestamp `ctime` of the file at `filepath`. Setting `ctime` is supported on iOS and Windows, android always sets both timestamps to `mtime`.

### `downloadFile(options: DownloadFileOptions): { jobId: number, promise: Promise<DownloadResult> }`

```js
type DownloadFileOptions = {
  fromUrl: string;          // URL to download file from
  toFile: string;           // Local filesystem path to save the file to
  headers?: Headers;        // An object of headers to be passed to the server
  background?: boolean;     // Continue the download in the background after the app terminates (iOS only)
  discretionary?: boolean;  // Allow the OS to control the timing and speed of the download to improve perceived performance  (iOS only)
  cacheable?: boolean;      // Whether the download can be stored in the shared NSURLCache (iOS only, defaults to true)
  progressInterval?: number;
  progressDivider?: number;
  begin?: (res: DownloadBeginCallbackResult) => void; // Note: it is required when progress prop provided
  progress?: (res: DownloadProgressCallbackResult) => void;
  resumable?: () => void;    // only supported on iOS yet
  connectionTimeout?: number // only supported on Android yet
  readTimeout?: number       // supported on Android and iOS
  backgroundTimeout?: number // Maximum time (in milliseconds) to download an entire resource (iOS only, useful for timing out background downloads)
};
```
```js
type DownloadResult = {
  jobId: number;          // The download job ID, required if one wishes to cancel the download. See `stopDownload`.
  statusCode: number;     // The HTTP status code
  bytesWritten: number;   // The number of bytes written to the file
};
```

Download file from `options.fromUrl` to `options.toFile`. Will overwrite any previously existing file.

If `options.begin` is provided, it will be invoked once upon download starting when headers have been received and passed a single argument with the following properties:

```js
type DownloadBeginCallbackResult = {
  jobId: number;          // The download job ID, required if one wishes to cancel the download. See `stopDownload`.
  statusCode: number;     // The HTTP status code
  contentLength: number;  // The total size in bytes of the download resource
  headers: Headers;       // The HTTP response headers from the server
};
```

If `options.progress` is provided, it will be invoked continuously and passed a single argument with the following properties:

```js
type DownloadProgressCallbackResult = {
  jobId: number;          // The download job ID, required if one wishes to cancel the download. See `stopDownload`.
  contentLength: number;  // The total size in bytes of the download resource
  bytesWritten: number;   // The number of bytes written to the file so far
};
```

If `options.progressInterval` is provided, it will return progress events in the maximum frequency of `progressDivider`.
For example, if `progressInterval` = 100, you will not receive callbacks more often than every 100th millisecond.

If `options.progressDivider` is provided, it will return progress events that divided by `progressDivider`.

For example, if `progressDivider` = 10, you will receive only ten callbacks for this values of progress: 0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100
Use it for performance issues.
If `progressDivider` = 0, you will receive all `progressCallback` calls, default value is 0.

(IOS only): `options.background` (`Boolean`) - Whether to continue downloads when the app is not focused (default: `false`)
                           This option is currently only available for iOS, see the [Background Downloads Tutorial (iOS)](#background-downloads-tutorial-ios) section.

(IOS only): If `options.resumable` is provided, it will be invoked when the download has stopped and and can be resumed using `resumeDownload()`.

### `stopDownload(jobId: number): void`

Abort the current download job with this ID. The partial file will remain on the filesystem.

### (iOS only) `resumeDownload(jobId: number): void`

Resume the current download job with this ID.

### (iOS only) `isResumable(jobId: number): Promise<bool>`

Check if the the download job with this ID is resumable with `resumeDownload()`.

Example:

```js
if (await RNFS.isResumable(jobId) {
    RNFS.resumeDownload(jobId)
}
```

### (iOS only) `completeHandlerIOS(jobId: number): void`

For use when using background downloads, tell iOS you are done handling a completed download.

Read more about background downloads in the [Background Downloads Tutorial (iOS)](#background-downloads-tutorial-ios) section.

### `uploadFiles(options: UploadFileOptions): { jobId: number, promise: Promise<UploadResult> }`

`options` (`Object`) - An object containing named parameters

```js
type UploadFileOptions = {
  toUrl: string;            // URL to upload file to
  binaryStreamOnly?: boolean// Allow for binary data stream for file to be uploaded without extra headers, Default is 'false'
  files: UploadFileItem[];  // An array of objects with the file information to be uploaded.
  headers?: Headers;        // An object of headers to be passed to the server
  fields?: Fields;          // An object of fields to be passed to the server
  method?: string;          // Default is 'POST', supports 'POST' and 'PUT'
  begin?: (res: UploadBeginCallbackResult) => void;
  progress?: (res: UploadProgressCallbackResult) => void;
};

```
```js
type UploadResult = {
  jobId: number;        // The upload job ID, required if one wishes to cancel the upload. See `stopUpload`.
  statusCode: number;   // The HTTP status code
  headers: Headers;     // The HTTP response headers from the server
  body: string;         // The HTTP response body
};
```

Each file should have the following structure:

```js
type UploadFileItem = {
  name: string;       // Name of the file, if not defined then filename is used
  filename: string;   // Name of file
  filepath: string;   // Path to file
  filetype: string;   // The mimetype of the file to be uploaded, if not defined it will get mimetype from `filepath` extension
};
```

If `options.begin` is provided, it will be invoked once upon upload has begun:

```js
type UploadBeginCallbackResult = {
  jobId: number;        // The upload job ID, required if one wishes to cancel the upload. See `stopUpload`.
};
```

If `options.progress` is provided, it will be invoked continuously and passed a single object with the following properties:

```js
type UploadProgressCallbackResult = {
  jobId: number;                      // The upload job ID, required if one wishes to cancel the upload. See `stopUpload`.
  totalBytesExpectedToSend: number;   // The total number of bytes that will be sent to the server
  totalBytesSent: number;             // The number of bytes sent to the server
};
```

Percentage can be computed easily by dividing `totalBytesSent` by `totalBytesExpectedToSend`.

### (iOS only) `stopUpload(jobId: number): Promise<void>`

Abort the current upload job with this ID.

### (Android only) `scanFile(path: string): Promise<string[]>`

Scan the file using [Media Scanner](https://developer.android.com/reference/android/media/MediaScannerConnection).

### (Android only) `getAllExternalFilesDirs(): Promise<string[]>`

Returns an array with the absolute paths to application-specific directories on all shared/external storage devices where the application can place persistent files it owns.

### (iOS only) `pathForGroup(groupIdentifier: string): Promise<string>`

`groupIdentifier` (`string`) Any value from the *com.apple.security.application-groups* entitlements list.

Returns the absolute path to the directory shared for all applications with the same security group identifier.
This directory can be used to to share files between application of the same developer.

Invalid group identifier will cause a rejection.

For more information read the [Adding an App to an App Group](https://developer.apple.com/library/content/documentation/Miscellaneous/Reference/EntitlementKeyReference/Chapters/EnablingAppSandbox.html#//apple_ref/doc/uid/TP40011195-CH4-SW19) section.

## Background Downloads Tutorial (iOS)

Background downloads in iOS require a bit of a setup.

First, in your `AppDelegate.m` file add the following:

```js
#import <RNFSManager.h>

...

- (void)application:(UIApplication *)application handleEventsForBackgroundURLSession:(NSString *)identifier completionHandler:(void (^)())completionHandler
{
  [RNFSManager setCompletionHandlerForIdentifier:identifier completionHandler:completionHandler];
}

```

The `handleEventsForBackgroundURLSession` method is called when a background download is done and your app is not in the foreground.

We need to pass the `completionHandler` to RNFS along with its `identifier`.

The JavaScript will continue to work as usual when the download is done but now you must call `RNFS.completeHandlerIOS(jobId)` when you're done handling the download (show a notification etc.)

**BE AWARE!** iOS will give about 30 sec. to run your code after `handleEventsForBackgroundURLSession` is called and until `completionHandler`
is triggered so don't do anything that might take a long time (like unzipping), you will be able to do it after the user re-launces the app,
otherwide iOS will terminate your app.
