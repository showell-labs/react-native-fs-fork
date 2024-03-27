import { isEqual, isMatch } from 'lodash';
import React from 'react';
import { AppState, Platform, Text, View } from 'react-native';

import {
  appendFile,
  completeHandlerIOS,
  // copyAssetsFileIOS,
  // copyAssetsVideoIOS,
  // completeHandlerIOS,
  copyFile,
  copyFileAssets,
  copyFileRes,
  copyFolder,
  downloadFile,
  exists,
  existsAssets,
  existsRes,
  getAllExternalFilesDirs,
  getFSInfo,
  hash,
  // isResumable,
  mkdir,
  moveFile,
  pathForGroup,
  read,
  readdir,
  readDir,
  readDirAssets,
  readFile,
  readFileAssets,
  readFileRes,
  // resumeDownload,
  scanFile,
  stat,
  stopDownload,
  stopUpload,
  TemporaryDirectoryPath,
  touch,
  unlink,
  uploadFiles,
  write,
  writeFile,
} from '@dr.pogodin/react-native-fs';

import TestCase, { type StatusOrEvaluator } from './TestCase';
import { FILE_DIR, waitServer } from './testServer';

import styles from './styles';

/*
function logCharCodes(datum: string) {
  for (let i = 0; i < datum.length; ++i) {
    console.log(datum.charCodeAt(i).toString(16));
  }
}
*/

const SEP = Platform.OS === 'windows' ? '\\' : '/';

const UPLOAD_FILES_CONTROL_ANDROID = `--*****
Content-Disposition: form-data; name="upload-files-source-file"; filename="upload-files-source-file.txt"
Content-Type: text/plain
Content-length: 8

GÖÖÐ


--*****--
`;

const UPLOAD_FILES_CONTROL_IOS = `Content-Disposition: form-data; name="upload-files-source-file"; filename="upload-files-source-file.txt"
Content-Type: text/plain
Content-Length: 8

GÖÖÐ

`;

const UPLOAD_FILES_CONTROL_WINDOWS = `-------
Content-Length: 8
Content-Disposition: form-data; name="upload-files-source-file"; filename="upload-files-source-file.txt"; filename*=UTF-8''upload-files-source-file.txt

GÖÖÐ

`;

// TODO: Why these messages are different I am not sure. Perhaps WebDAV module
// of the static server outputs dumps incoming messages in different formats on
// different platforms. Should be double-checked at some point.
const UPLOAD_FILES_CONTROL = Platform.select({
  android: UPLOAD_FILES_CONTROL_ANDROID,
  ios: UPLOAD_FILES_CONTROL_IOS,
  macos: UPLOAD_FILES_CONTROL_IOS,
  windows: UPLOAD_FILES_CONTROL_WINDOWS,
  default: '',
});

const tests: { [name: string]: StatusOrEvaluator } = {
  'appendFile()': async () => {
    // TODO: I guess, this test should be improved and elaborated...
    // The current version is just copied & modified from the "readFile() and
    // writeFile()" test, without much thinking about it.
    const good = 'GÖÖÐ\n';
    const utf8 = '\x47\xC3\x96\xC3\x96\xC3\x90\x0A';
    const path = `${TemporaryDirectoryPath}/append-file-test`;
    try {
      await writeFile(path, utf8, 'ascii');
      await appendFile(path, utf8, 'ascii');
      let res = await readFile(path);
      if (res !== `${good}${good}`) return 'fail';
      await writeFile(path, good);
      await appendFile(path, good);
      res = await readFile(path);
      if (res !== `${good}${good}`) return 'fail';
      return 'pass';
    } catch (e) {
      return 'fail';
    }
  },
  /*
    This test actually crashes the app... though... I guess it is correctly
    called, not sure what goes wrong inside it.
  'copyAssetsFileIOS()': async () => {
    try {
      // TODO: I even won't bother myself thinking how to automate this
      // test; fine to have it as a manual test for a real device - introduce
      // a valid asset name below, and it will try to copy and check it,
      // otherwise it will just report the test as hanging.
      const asset = 'IMG_6437';
      const path = `${TemporaryDirectoryPath}/copy-assets-file-ios`;
      try {
        await unlink(path);
      } catch {}
      await copyAssetsFileIOS(
        `ph://assets-library://asset/asset.JPG?id=${asset}`,
        path,
        640,
        640,
      );
      return 'pass';
    } catch (e) {
      console.error(e);
      return 'fail';
    }
  },
  'copyAssetsVideoIOS()': async () => {
    try {
      // TODO: I even won't bother myself thinking how to automate this
      // test; fine to have it as a manual test for a real device - introduce
      // a valid asset name below, and it will try to copy and check it,
      // otherwise it will just report the test as hanging.
      const asset = 'IMG_6437';
      const path = `${TemporaryDirectoryPath}/copy-assets-video-ios`;
      try {
        await unlink(path);
      } catch {}
      await copyAssetsVideoIOS(asset, path);
      return 'pass';
    } catch (e) {
      console.error(e);
      return 'fail';
    }
  },
  */
  'copyFile()': async () => {
    // TODO: It should be also tested and documented:
    // -  How does it behave if the target item exists? Does it throw or
    //    overwrites it? Is it different for folders and files?
    // -  What does it throw when attempting to move a non-existing item?
    try {
      const path = `${TemporaryDirectoryPath}/copy-file-test`;
      try {
        await unlink(path);
      } catch {}
      await mkdir(`${path}/folder`);
      await writeFile(`${path}/test-file.txt`, 'Dummy content');
      await writeFile(
        `${path}/folder/another-test-file.txt`,
        'Another dummy content',
      );

      // Can it move a file?
      await copyFile(`${path}/test-file.txt`, `${path}/moved-file.txt`);
      if (
        (await readFile(`${path}/test-file.txt`)) !== 'Dummy content' ||
        (await readFile(`${path}/moved-file.txt`)) !== 'Dummy content'
      ) {
        return 'fail';
      }

      // Can it copy a folder with its content?
      try {
        await copyFile(`${path}/folder`, `${path}/moved-folder`);
        // TODO: For platforms that allow to copy folders, we should do more
        // checks here, similar to moveFile() checks.
        return ['android', 'windows'].includes(Platform.OS) ? 'fail' : 'pass';
      } catch (e: any) {
        if (Platform.OS === 'windows') {
          if (
            e.code !== 'EUNSPECIFIED' ||
            e.message !== 'The parameter is incorrect.'
          ) {
            return 'fail';
          }
        } else {
          if (
            e.code !== 'EISDIR' ||
            e.message !==
              `EISDIR: illegal operation on a directory, read '${TemporaryDirectoryPath}/copy-file-test/folder'`
          ) {
            return 'fail';
          }
        }
      }

      return 'pass';
    } catch {
      return 'fail';
    }
  },
  'copyFolder()': async () => {
    // TODO: It should be also tested and documented:
    // -  How does it behave if the target item exists? Does it throw or
    //    overwrites it? Is it different for folders and files?
    // -  What does it throw when attempting to move a non-existing item?
    try {
      const path = `${TemporaryDirectoryPath}/copy-folder-test`;
      try {
        await unlink(path);
      } catch {}
      await mkdir(`${path}/folder`);
      await mkdir(`${path}/dest`);
      await writeFile(
        `${path}/folder/another-test-file.txt`,
        'Another dummy content',
      );

      // Can it copy a folder with its content?
      try {
        await copyFolder(`${path}/folder`, `${path}/dest`);
        // TODO: For platforms that allow to copy folders, we should do more
        // checks here, similar to moveFile() checks.
        return ['android'].includes(Platform.OS) ? 'fail' : 'pass';
      } catch (e: any) {
        if (Platform.OS === 'windows') {
          if (
            e.code !== 'EUNSPECIFIED' ||
            e.message !== 'The parameter is incorrect.'
          ) {
            return 'fail';
          }
        } else {
          if (
            e.code !== 'EISDIR' ||
            e.message !==
              `EISDIR: illegal operation on a directory, read '${TemporaryDirectoryPath}/copy-file-test/folder'`
          ) {
            return 'fail';
          }
        }
      }

      return 'pass';
    } catch {
      return 'fail';
    }
  },
  'copyFileAssets()': async () => {
    const path = `${TemporaryDirectoryPath}/good-utf8.txt`;
    try {
      await unlink(path);
    } catch {}
    try {
      if (await exists(path)) return 'fail';
      await copyFileAssets('test/good-utf8.txt', path);
      const res = await readFile(path);
      if (res !== 'GÖÖÐ\n') return 'fail';
      return 'pass';
    } catch {
      return 'fail';
    }
  },
  'copyFileAssets() - invalid path': async () => {
    const path = `${TemporaryDirectoryPath}/good-utf8.txt`;
    try {
      await unlink(path);
    } catch {}
    try {
      if (await exists(path)) return 'fail';
      await copyFileAssets('invalid-path', path);
      return 'fail';
    } catch {
      return 'pass';
    }
  },
  // NOTE: This is a new test, for the updated function behavior.
  'copyFileAssets() - new': async () => {
    const dest = `${TemporaryDirectoryPath}/copy-file-assets-2`;
    try {
      await unlink(dest);
    } catch {}
    // await mkdir(dest);
    try {
      await copyFileAssets('test', dest);
      const res = await readFile(`${dest}/good-utf8.txt`);
      if (res !== 'GÖÖÐ\n') return 'fail';
      return 'pass';
    } catch {
      return 'fail';
    }
  },
  'copyFileRes()': async () => {
    const path = `${TemporaryDirectoryPath}/res_good_utf8.txt`;
    try {
      await unlink(path);
    } catch {}
    try {
      if (await exists(path)) return 'fail';
      await copyFileRes('good_utf8.txt', path);
      const res = await readFile(path);
      if (res !== 'GÖÖÐ\n') return 'fail';
      return 'pass';
    } catch {
      return 'fail';
    }
  },
  // TODO: This should live in a dedicated module, with a bunch of tests needed
  // to cover all download-related functions & scenarious; however, to get this
  // function checked faster, placing it here for now.
  'downloadFile()': async () => {
    const url =
      'https://raw.githubusercontent.com/birdofpreyru/react-native-fs/master/example/assets/test/good-utf8.txt';
    const path = `${TemporaryDirectoryPath}/download-file-01`;
    const good = 'GÖÖÐ\n';
    try {
      await unlink(path);
    } catch {}
    try {
      const { jobId, promise } = downloadFile({
        fromUrl: url,
        toFile: path,
      });
      const res = await promise;
      if (
        typeof jobId !== 'number' ||
        res.bytesWritten !== 8 ||
        res.statusCode !== 200
      ) {
        return 'fail';
      }
      const file = await readFile(path);
      if (file !== good) return 'fail';
      return 'pass';
    } catch {
      return 'fail';
    }
  },
  'downloadFile() - progress callback': async () => {
    try {
      const url = 'https://www.youtube.com/';
      const path = `${TemporaryDirectoryPath}/download-file-01b`;

      return new Promise((resolve) => {
        const timeoutId = setTimeout(() => resolve('fail'), 3000);

        const { jobId } = downloadFile({
          fromUrl: url,
          toFile: path,
          progress: () => {
            clearTimeout(timeoutId);
            stopDownload(jobId);
            resolve('pass');
          },
        });
      });
    } catch {
      return 'fail';
    }
  },
  // FOR THIS TEST TO RUN THE EXAMPLE APP SHOULD BE SENT TO THE BACKGROUND!
  '[iOS] Background downloadFile()': async () => {
    if (Platform.OS !== 'ios') return 'fail';

    const url =
      'https://raw.githubusercontent.com/birdofpreyru/react-native-fs/master/example/assets/test/good-utf8.txt';
    const path = `${TemporaryDirectoryPath}/background-download-file-01`;
    const good = 'GÖÖÐ\n';
    try {
      await unlink(path);
    } catch {}
    try {
      console.info(
        'Send the app to background to run the iOS background download test',
      );
      const promise = new Promise<'fail' | 'pass'>((resolve) => {
        const sub = AppState.addEventListener('change', async (state) => {
          if (state === 'background') {
            const { jobId, promise: downloadPromise } = downloadFile({
              fromUrl: url,
              toFile: path,
            });
            sub.remove();
            const res = await downloadPromise;
            completeHandlerIOS(jobId);
            if (
              typeof jobId !== 'number' ||
              res.bytesWritten !== 8 ||
              res.statusCode !== 200
            ) {
              console.info('Background download test failed');
              resolve('fail');
              return;
            }
            const file = await readFile(path);
            if (file !== good) {
              console.info('Background download test failed');
              resolve('fail');
              return;
            }
            console.info('Background download test passed');
            resolve('pass');
          }
        });
      });
      return promise;
    } catch {
      return 'fail';
    }
  },
  'exists()': async () => {
    const path = `${TemporaryDirectoryPath}/test-exists-file`;
    try {
      await unlink(path);
    } catch {}
    try {
      if (await exists(path)) return 'fail';
      await writeFile(path, 'xxx');
      if (!(await exists(path))) return 'fail';
      return 'pass';
    } catch {
      return 'fail';
    }
  },
  'existsAssets()': async () => {
    try {
      if (!(await existsAssets('test/good-utf8.txt'))) return 'fail';
      if (await existsAssets('test/non-existing.txt')) return 'fail';
      return 'pass';
    } catch {
      return 'fail';
    }
  },
  'existsRes()': async () => {
    try {
      if (!(await existsRes('good_utf8.txt'))) return 'fail';
      if (await existsRes('non_existing.txt')) return 'fail';
      return 'pass';
    } catch (e) {
      return 'fail';
    }
  },
  // TODO: This is not a very strict test.
  'getAllExternalFilesDirs()': async () => {
    try {
      const res = await getAllExternalFilesDirs();
      if (!Array.isArray(res) || res.some((x) => typeof x !== 'string')) {
        return 'fail';
      }
      return 'pass';
    } catch {
      return 'fail';
    }
  },
  'getFSInfo()': async () => {
    try {
      const res = await getFSInfo();

      if (
        typeof res.freeSpace !== 'number' ||
        typeof res.totalSpace !== 'number'
      ) {
        return 'fail';
      }

      if (
        Platform.OS === 'android' &&
        (typeof res.freeSpaceEx !== 'number' ||
          typeof res.totalSpaceEx !== 'number')
      ) {
        return 'fail';
      }

      return 'pass';
    } catch {
      return 'fail';
    }
  },
  'hash()': async () => {
    const path = `${TemporaryDirectoryPath}/hash`;
    try {
      await unlink(path);
    } catch {}
    try {
      if (await exists(path)) return 'fail';
      await writeFile(path, 'xxx');
      if ((await hash(path, 'md5')) !== 'f561aaf6ef0bf14d4208bb46a4ccb3ad')
        return 'fail';
      if (
        (await hash(path, 'sha1')) !==
        'b60d121b438a380c343d5ec3c2037564b82ffef3'
      ) {
        return 'fail';
      }
      if (
        Platform.OS !== 'windows' &&
        (await hash(path, 'sha224')) !==
          '1e75647b457de7b041b0bd786ac94c3ab53cf3b85243fbe8e97506db'
      ) {
        return 'fail';
      }
      if (
        (await hash(path, 'sha256')) !==
        'cd2eb0837c9b4c962c22d2ff8b5441b7b45805887f051d39bf133b583baf6860'
      ) {
        return 'fail';
      }
      if (
        (await hash(path, 'sha384')) !==
        '1249e15f035ed34786a328d9fdb2689ab24f7c7b253d1b7f66ed92a679d663dd502d7beda59973e8c91a728b929fc8cd'
      ) {
        return 'fail';
      }
      if (
        (await hash(path, 'sha512')) !==
        '9057ff1aa9509b2a0af624d687461d2bbeb07e2f37d953b1ce4a9dc921a7f19c45dc35d7c5363b373792add57d0d7dc41596e1c585d6ef7844cdf8ae87af443f'
      ) {
        return 'fail';
      }
      return 'pass';
    } catch {
      return 'fail';
    }
  },
  'mkdir()': async () => {
    const pathA = `${TemporaryDirectoryPath}/test-mkdir-path`;
    const pathB = `${pathA}/inner/path`;
    try {
      await unlink(pathA);
    } catch {}
    try {
      if (await exists(pathA)) return 'fail';
      await mkdir(pathB);
      if (!(await exists(pathB))) return 'fail';
      return 'pass';
    } catch {
      return 'fail';
    }
  },
  'moveFile()': async () => {
    // TODO: It should be also tested and documented:
    // -  How does it behave if the target item exists? Does it throw or
    //    overwrites it? Is it different for folders and files?
    // -  What does it throw when attempting to move a non-existing item?
    try {
      const path = `${TemporaryDirectoryPath}/move-file-test`;
      try {
        await unlink(path);
      } catch {}
      await mkdir(`${path}/folder`);
      await writeFile(`${path}/test-file.txt`, 'Dummy content');
      await writeFile(
        `${path}/folder/another-test-file.txt`,
        'Another dummy content',
      );

      // Can it move a file?
      await moveFile(`${path}/test-file.txt`, `${path}/moved-file.txt`);
      if (
        (await exists(`${path}/test-file.txt`)) ||
        (await readFile(`${path}/moved-file.txt`)) !== 'Dummy content'
      ) {
        return 'fail';
      }

      // Can it move a folder with its content?
      try {
        await moveFile(`${path}/folder`, `${path}/moved-folder`);
        if (
          (await exists(`${path}/folder`)) ||
          !(await exists(`${path}/moved-folder/another-test-file.txt`)) ||
          (await readFile(`${path}/moved-folder/another-test-file.txt`)) !==
            'Another dummy content'
        ) {
          return 'fail';
        }
      } catch (e: any) {
        if (
          Platform.OS !== 'windows' ||
          e.code !== 'EUNSPECIFIED' ||
          e.message !== 'The parameter is incorrect.'
        ) {
          return 'fail';
        }
      }

      return 'pass';
    } catch {
      return 'fail';
    }
  },
  // TODO: This is yet another dummy test, that should be enhanced (but not
  // a priority).
  'pathForGroup()': async () => {
    try {
      await pathForGroup('dummy-group');
      return 'fail';
    } catch (e: any) {
      if (e.message === "ENOENT: no directory for group 'dummy-group' found") {
        return 'pass';
      }
      return 'fail';
    }
  },
  'read()': async () => {
    try {
      const good = 'GÖÖÐ\n';
      const utf8 = '\x47\xC3\x96\xC3\x96\xC3\x90\x0A';
      const path = `${TemporaryDirectoryPath}/read-test`;
      await writeFile(path, utf8, 'ascii');

      if (
        (await read(path)) !==
          (['android', 'windows'].includes(Platform.OS) ? '' : good) ||
        (await read(path, 8)) !== good ||
        // NOTE: No matter the encoding, the length is in bytes, rather than
        // in read symbols.
        (await read(path, 5)) !== 'GÖÖ' ||
        (await read(path, 4, 1)) !== 'ÖÖ' ||
        (await read(path, 2, 1, 'ascii')) !== '\xC3\x96' ||
        (await read(path, 2, 1, 'base64')) !== 'w5Y='
      ) {
        return 'fail';
      }
      return 'pass';
    } catch {
      return 'fail';
    }
  },
  'readdir()': async () => {
    try {
      const path = `${TemporaryDirectoryPath}/read-dir-test`;
      try {
        await unlink(path);
      } catch {}
      await mkdir(`${path}/folder`);
      await writeFile(`${path}/file-a.txt`, 'A test file');
      await writeFile(`${path}/file-b.txt`, 'A second test file');
      const dir = await readdir(path);

      // TODO: As of now, readdir() does not guarantee any specific order
      // of names in the returned listing.
      dir.sort();

      if (!isEqual(dir, ['file-a.txt', 'file-b.txt', 'folder'])) return 'fail';

      return 'pass';
    } catch {
      return 'fail';
    }
  },
  'readDir()': async () => {
    try {
      let path = TemporaryDirectoryPath;
      if (!path.endsWith(SEP)) path += SEP;
      path += 'read-dir-test';
      try {
        await unlink(path);
      } catch {}
      const now = Date.now();
      await mkdir(`${path}/folder`);
      await writeFile(`${path}/file-a.txt`, 'A test file');
      await writeFile(`${path}/file-b.txt`, 'A second test file');
      const dir = await readDir(path);

      // TODO: Currently there is no guarantee on the sort order of the result.
      dir.sort((a, b) => a.name.localeCompare(b.name));

      // Second object is the smaller "file-a.txt"
      let item = dir[0];
      if (
        !item ||
        (Platform.OS === 'android'
          ? item.ctime !== null
          : item.ctime!.valueOf() < now - 1000 ||
            item.ctime!.valueOf() > now + 1000) ||
        (Platform.OS !== 'windows' && item.isDirectory()) ||
        (Platform.OS !== 'windows' && !item.isFile()) ||
        !(item.mtime instanceof Date) ||
        item.mtime.valueOf() < now - 1000 ||
        item.mtime.valueOf() > now + 1000 ||
        item.name !== 'file-a.txt' ||
        item.path !== `${path}${SEP}file-a.txt` ||
        // TODO: This can be platform dependent.
        item.size !== 11
      ) {
        return 'fail';
      }

      // Second object is the larger "file-b.txt"
      item = dir[1];
      if (
        !item ||
        (Platform.OS === 'android'
          ? item.ctime !== null
          : item.ctime!.valueOf() < now - 1000 ||
            item.ctime!.valueOf() > now + 1000) ||
        (Platform.OS !== 'windows' && item.isDirectory()) ||
        (Platform.OS !== 'windows' && !item.isFile()) ||
        !(item.mtime instanceof Date) ||
        item.mtime.valueOf() < now - 1000 ||
        item.mtime.valueOf() > now + 1000 ||
        item.name !== 'file-b.txt' ||
        item.path !== `${path}${SEP}file-b.txt` ||
        // TODO: This can be platform dependent.
        item.size !== 18
      ) {
        return 'fail';
      }

      // First object is a folder created by mkdir.
      item = dir[2];
      if (
        !item ||
        (Platform.OS === 'android'
          ? item.ctime !== null
          : item.ctime!.valueOf() < now - 1000 ||
            item.ctime!.valueOf() > now + 1000) ||
        (Platform.OS !== 'windows' && !item.isDirectory()) ||
        (Platform.OS !== 'windows' && item.isFile()) ||
        !(item.mtime instanceof Date) ||
        item.mtime.valueOf() < now - 1000 ||
        item.mtime.valueOf() > now + 1000 ||
        item.name !== 'folder' ||
        item.path !== `${path}${SEP}folder` ||
        // TODO: This is platform dependent,
        // also... why a folder size is 4096 or whatever bytes?
        // Is it really a value reported by OS, or is it
        // something resulting from how the library works?
        item.size !==
          Platform.select({
            android: 4096,
            windows: 0,
            default: 64,
          })
      ) {
        return 'fail';
      }

      return 'pass';
    } catch {
      return 'fail';
    }
  },
  'readDirAssets()': async () => {
    try {
      let assets = await readDirAssets('test');

      for (let i = 0; i < assets.length; ++i) {
        const a = assets[i];
        if (a?.isDirectory() || !a?.isFile()) return 'fail';
      }

      const assets2 = assets.map((asset) => ({
        name: asset.name,
        path: asset.path,
        size: asset.size,
      }));

      if (
        !isEqual(assets2, [
          {
            name: 'good-latin1.txt',
            path: 'test/good-latin1.txt',
            size: -1,
          },
          {
            name: 'good-utf8.txt',
            path: 'test/good-utf8.txt',
            size: -1,
          },
        ])
      ) {
        return 'fail';
      }

      assets = await readDirAssets('');
      const asset = assets.find((a) => a.name === 'test');
      if (!asset?.isDirectory() || asset?.isFile()) return 'fail';

      return 'pass';
    } catch {
      return 'fail';
    }

    /*  TODO: This would be the ideal test, but because isDirectory and isFile
        are functions, making this isEqual check falsy. We'll hovewer probably
        drop these functions in future, and thus use this test then. Also,
        note that currently it does not return ctime, mtime, size values
        for assets. Should we fix something here?
    if (
      !isEqual(await readDirAssets('test'), [
        {
          ctime: null,
          isDirectory: '[Function isDirectory]',
          isFile: '[Function isFile]',
          mtime: null,
          name: 'good-latin1.txt',
          path: 'test/good-latin1.txt',
          size: 0,
        },
        {
          ctime: null,
          isDirectory: '[Function isDirectory]',
          isFile: '[Function isFile]',
          mtime: null,
          name: 'good-utf8.txt',
          path: 'test/good-utf8.txt',
          size: 0,
        },
      ])
    ) {
      return 'fail';
    }
    */
  },
  'readFile() and writeFile()': async () => {
    const good = 'GÖÖÐ\n';
    const utf8 = '\x47\xC3\x96\xC3\x96\xC3\x90\x0A';
    const path = `${TemporaryDirectoryPath}/test-file`;
    try {
      await writeFile(path, utf8, 'ascii');
      let res = await readFile(path);
      if (res !== good) return 'fail';
      res = await readFile(path, 'ascii');
      if (res !== utf8) return 'fail';
      await writeFile(path, good);
      res = await readFile(path);
      if (res !== good) return 'fail';
      return 'pass';
    } catch (e) {
      return 'fail';
    }
  },
  'readFileAssets()': async () => {
    try {
      let res = await readFileAssets('test/good-latin1.txt', 'ascii');
      if (res !== 'GÖÖÐ\n') return 'fail';

      res = await readFileAssets('test/good-utf8.txt', 'ascii');
      if (res !== '\x47\xC3\x96\xC3\x96\xC3\x90\x0A') return 'fail';

      res = await readFileAssets('test/good-utf8.txt', 'utf8');
      if (res !== 'GÖÖÐ\n') return 'fail';

      res = await readFileAssets('test/good-utf8.txt');
      if (res !== 'GÖÖÐ\n') return 'fail';

      res = await readFileAssets('test/good-latin1.txt', 'base64');
      if (res !== 'R9bW0Ao=') return 'fail';

      res = await readFileAssets('test/good-utf8.txt', 'base64');
      if (res !== 'R8OWw5bDkAo=') return 'fail';

      return 'pass';
    } catch {
      return 'fail';
    }
  },
  'readFileRes()': async () => {
    try {
      let res = await readFileRes('good_latin1.txt', 'ascii');
      if (res !== 'GÖÖÐ\n') return 'fail';

      res = await readFileRes('good_utf8.txt', 'ascii');
      if (res !== '\x47\xC3\x96\xC3\x96\xC3\x90\x0A') return 'fail';

      res = await readFileRes('good_utf8.txt', 'utf8');
      if (res !== 'GÖÖÐ\n') return 'fail';

      res = await readFileRes('good_utf8.txt');
      if (res !== 'GÖÖÐ\n') return 'fail';

      res = await readFileRes('good_latin1.txt', 'base64');
      if (res !== 'R9bW0Ao=') return 'fail';

      res = await readFileRes('good_utf8.txt', 'base64');
      if (res !== 'R8OWw5bDkAo=') return 'fail';

      return 'pass';
    } catch {
      return 'fail';
    }
  },
  'scanFile()': async () => {
    try {
      const path = `${TemporaryDirectoryPath}/scan-file-test`;
      await writeFile(path, 'xxx');
      await scanFile(path);
      // TODO: Currently scanFile() returns "null" here, indicating the scan has
      // failed... not sure why, perhaps it can't access the temporary directory
      // of the app? Anyway, not a priority to dig further into it right now.
      return 'pass';
    } catch {
      return 'fail';
    }
  },
  'stat()': async () => {
    try {
      const path = `${TemporaryDirectoryPath}${SEP}stat-test`;
      try {
        unlink(path);
      } catch {}
      const now = Date.now();
      await mkdir(`${path}${SEP}folder`);
      await writeFile(`${path}${SEP}test-file.txt`, 'Dummy content');

      // TODO: There is something wrong with this test on Windows:
      // it tends to randomly pass or fail, it should be double-checked
      // why.
      let res = await stat(`${path}${SEP}folder`);
      if (
        res.ctime.valueOf() < now - 1000 ||
        res.ctime.valueOf() > now + 1000 ||
        (Platform.OS !== 'windows' && !res.isDirectory()) ||
        res.isFile() ||
        // NOTE: mode is documented, but not actually returned, at least on
        // Android. We'll deal with it later.
        res.mode !==
          Platform.select({
            android: undefined,
            windows: undefined,
            default: 493,
          }) ||
        res.mtime.valueOf() < now - 1000 ||
        res.mtime.valueOf() > now + 1000 ||
        // TODO: Check this works as documented for Android Contentt URIs.
        res.originalFilepath !==
          Platform.select({
            android: `${path}${SEP}folder`,
            ios: 'NOT_SUPPORTED_ON_IOS',
            windows: undefined,
          }) ||
        res.path !== `${path}${SEP}folder` ||
        // TODO: Again, check why we report 4096 byte size for a folder?
        res.size !==
          Platform.select<number | string>({
            android: 4096,
            ios: 64,
            windows: '0',
          })
      ) {
        return 'fail';
      }

      res = await stat(`${path}${SEP}test-file.txt`);
      if (
        res.ctime.valueOf() < now - 1000 ||
        res.ctime.valueOf() > now + 1000 ||
        res.isDirectory() ||
        (Platform.OS !== 'windows' && !res.isFile()) ||
        // NOTE: mode is documented, but not actually returned, at least on
        // Android. We'll deal with it later.
        res.mode !==
          Platform.select({
            android: undefined,
            default: 420,
            windows: undefined,
          }) ||
        res.mtime.valueOf() < now - 1000 ||
        res.mtime.valueOf() > now + 1000 ||
        // TODO: Check this works as documented for Android Contentt URIs.
        res.originalFilepath !==
          Platform.select({
            android: `${path}${SEP}test-file.txt`,
            ios: 'NOT_SUPPORTED_ON_IOS',
            windows: undefined,
          }) ||
        res.path !== `${path}${SEP}test-file.txt` ||
        res.size !==
          Platform.select<number | string>({
            windows: '13',
            default: 13,
          })
      ) {
        return 'fail';
      }

      try {
        res = await stat(`${path}${SEP}non-existing-file.txt`);
        return 'fail';
      } catch (e: any) {
        if (Platform.OS === 'android') {
          if (
            !isMatch(e, {
              code: 'EUNSPECIFIED',
              message: 'File does not exist',
            })
          ) {
            return 'fail';
          }
        } else if (Platform.OS === 'windows') {
          if (
            !isMatch(e, {
              code: 'ENOENT',
              message: `ENOENT: no such file or directory, open ${path}${SEP}non-existing-file.txt`,
            })
          ) {
            return 'fail';
          }
        } else {
          if (
            !isMatch(e, {
              code: 'NSCocoaErrorDomain:260',
              message:
                'The file “non-existing-file.txt” couldn’t be opened because there is no such file.',
            })
          ) {
            return 'fail';
          }
        }
      }

      return 'pass';
    } catch {
      return 'fail';
    }
  },
  // TODO: This is quite a sloppy test.
  'stopDownload()': async () => {
    const url =
      'https://raw.githubusercontent.com/birdofpreyru/react-native-fs/master/example/assets/test/good-utf8.txt';
    const path = `${TemporaryDirectoryPath}/stop-download-test`;
    try {
      await unlink(path);
    } catch {}
    try {
      const { jobId, promise } = downloadFile({
        fromUrl: url,
        toFile: path,
      });
      stopDownload(jobId);
      try {
        await promise;
      } catch (e: any) {
        if (e.message === 'Download has been aborted') return 'pass';
      }
      return 'fail';
    } catch {
      return 'fail';
    }
  },
  'stopUpload()': async () => {
    try {
      const server = await waitServer();

      const good = 'GÖÖÐ\n';
      const path = `${TemporaryDirectoryPath}/stop-upload.txt`;
      await writeFile(path, good);

      const targetDevicePath = `${FILE_DIR}/dav/stop-upload.txt`;

      try {
        unlink(targetDevicePath);
      } catch {}

      const res = uploadFiles({
        toUrl: `${server?.origin!}/dav/stop-upload.txt`,
        method: 'PUT',
        files: [
          {
            name: 'upload-files-source-file',
            filename: 'upload-files-source-file.txt',
            filepath: path,
          },
        ],
      });
      stopUpload(res.jobId);
      await res.promise;

      await readFile(targetDevicePath);
      return 'fail';
    } catch (e: any) {
      if (
        e.message.startsWith('ENOENT: no such file or directory, open') &&
        e.message.endsWith("/tmp/test-server/dav/stop-upload.txt'")
      ) {
        return 'pass';
      }
      return 'fail';
    }
  },
  'touch()': async () => {
    // TODO: This test fails on Windows, but I guess because stat()
    // does not work there the same as on other platforms.
    try {
      const filePath = `${TemporaryDirectoryPath}/touch-test`;
      try {
        await unlink(filePath);
      } catch {}
      await writeFile(filePath, 'xxx');
      const a = await stat(filePath);
      const b = await stat(filePath);
      if (
        a.ctime.valueOf() !== b.ctime.valueOf() ||
        a.mtime.valueOf() !== b.mtime.valueOf()
      ) {
        return 'fail';
      }
      const M_TIME = 1705969300000;
      await touch(filePath, new Date(M_TIME), new Date(M_TIME));
      const c = await stat(filePath);
      if (c.ctime.valueOf() !== M_TIME || c.mtime.valueOf() !== M_TIME) {
        return 'fail';
      }
      return 'pass';
    } catch {
      return 'fail';
    }
  },
  'unlink()': async () => {
    try {
      const dirPath = `${TemporaryDirectoryPath}/test-unlink-dir`;
      const filePath = `${dirPath}/test-unlink-file`;
      await mkdir(dirPath);
      await writeFile(filePath, 'xxx');
      if (!(await exists(filePath))) return 'fail';
      await unlink(filePath);
      if (await exists(filePath)) return 'fail';
      await writeFile(filePath, 'xxx');
      if (!(await exists(filePath))) return 'fail';
      await unlink(dirPath);
      if (await exists(filePath)) return 'fail';
      try {
        await unlink(dirPath);
        return 'fail';
      } catch {}
      return 'pass';
    } catch {
      return 'fail';
    }
  },
  'uploadFiles()': async () => {
    try {
      const server = await waitServer();

      const good = 'GÖÖÐ\n';
      const path = `${TemporaryDirectoryPath}/upload-files.txt`;
      await writeFile(path, good);

      const targetDevicePath = `${FILE_DIR}/dav/upload-files.txt`;

      try {
        unlink(targetDevicePath);
      } catch {}

      const res = uploadFiles({
        toUrl: `${server?.origin!}/dav/upload-files.txt`,
        method: 'PUT',
        files: [
          {
            name: 'upload-files-source-file',
            filename: 'upload-files-source-file.txt',
            filepath: path,
          },
        ],
      });
      await res.promise;

      let uploadedFile = await readFile(targetDevicePath);
      uploadedFile = uploadedFile.replace(/\r\n/g, '\n');

      if (uploadedFile !== UPLOAD_FILES_CONTROL) {
        console.log('MISMATCH', uploadedFile, UPLOAD_FILES_CONTROL);
      }

      return uploadedFile.includes(UPLOAD_FILES_CONTROL) ? 'pass' : 'fail';
    } catch (e) {
      return 'fail';
    }
  },
  'write()': async () => {
    // TODO: This test is copied from "readFile() and writeFile()", and it is
    // just slightly modified, without much thinking - it does not test all
    // promised behavior of write(). Also, we probably should combine write()
    // and writeFile() functions into one.
    const good = 'GÖÖÐ\n';
    const utf8 = '\x47\xC3\x96\xC3\x96\xC3\x90\x0A';
    const path = `${TemporaryDirectoryPath}/write-test`;
    try {
      try {
        await unlink(path);
      } catch {}
      await write(path, utf8, -1, 'ascii');
      let res = await readFile(path);
      if (res !== good) return 'fail';
      await write(path, good);
      res = await readFile(path);
      if (res !== `${good}${good}`) return 'fail';
      return 'pass';
    } catch {
      return 'fail';
    }
  },
};

export default function TestBaseMethods() {
  return (
    <View>
      <Text style={styles.title}>Base Methods</Text>
      {Object.entries(tests).map(([name, test]) => (
        <TestCase key={name} name={name} status={test} />
      ))}
    </View>
  );
}
