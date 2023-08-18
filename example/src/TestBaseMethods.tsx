import { isEqual, isMatch } from 'lodash';
import React from 'react';
import { Platform, Text, View } from 'react-native';

import {
  copyFile,
  copyFileAssets,
  exists,
  existsAssets,
  getFSInfo,
  mkdir,
  moveFile,
  read,
  readdir,
  readDir,
  readDirAssets,
  readFile,
  readFileAssets,
  stat,
  TemporaryDirectoryPath,
  unlink,
  writeFile,
} from '@dr.pogodin/react-native-fs';

import TestCase, { type StatusOrEvaluator } from './TestCase';

import styles from './styles';

/*
function logCharCodes(datum: string) {
  for (let i = 0; i < datum.length; ++i) {
    console.log(datum.charCodeAt(i).toString(16));
  }
}
*/

const tests: { [name: string]: StatusOrEvaluator } = {
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
        return Platform.OS === 'android' ? 'fail' : 'pass';
      } catch (e: any) {
        if (
          e.code !== 'EISDIR' ||
          e.message !==
            `EISDIR: illegal operation on a directory, read '${TemporaryDirectoryPath}/copy-file-test/folder'`
        ) {
          return 'fail';
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
      await moveFile(`${path}/folder`, `${path}/moved-folder`);
      if (
        (await exists(`${path}/folder`)) ||
        !(await exists(`${path}/moved-folder/another-test-file.txt`)) ||
        (await readFile(`${path}/moved-folder/another-test-file.txt`)) !==
          'Another dummy content'
      ) {
        return 'fail';
      }

      return 'pass';
    } catch {
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
        (await read(path)) !== (Platform.OS === 'android' ? '' : good) ||
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
      if (!path.endsWith('/')) path += '/';
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
        item.isDirectory() ||
        !item.isFile() ||
        !(item.mtime instanceof Date) ||
        item.mtime.valueOf() < now - 1000 ||
        item.mtime.valueOf() > now + 1000 ||
        item.name !== 'file-a.txt' ||
        item.path !== `${path}/file-a.txt` ||
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
        item.isDirectory() ||
        !item.isFile() ||
        !(item.mtime instanceof Date) ||
        item.mtime.valueOf() < now - 1000 ||
        item.mtime.valueOf() > now + 1000 ||
        item.name !== 'file-b.txt' ||
        item.path !== `${path}/file-b.txt` ||
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
        !item.isDirectory() ||
        item.isFile() ||
        !(item.mtime instanceof Date) ||
        item.mtime.valueOf() < now - 1000 ||
        item.mtime.valueOf() > now + 1000 ||
        item.name !== 'folder' ||
        item.path !== `${path}/folder` ||
        // TODO: This is platform dependent,
        // also... why a folder size is 4096 or whatever bytes?
        // Is it really a value reported by OS, or is it
        // something resulting from how the library works?
        item.size !==
          Platform.select({
            android: 4096,
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
      console.error(e);
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
  'stat()': async () => {
    try {
      const path = `${TemporaryDirectoryPath}/stat-test`;
      try {
        unlink(path);
      } catch {}
      const now = Date.now();
      await mkdir(`${path}/folder`);
      await writeFile(`${path}/test-file.txt`, 'Dummy content');

      let res = await stat(`${path}/folder`);

      if (
        res.ctime.valueOf() < now - 1000 ||
        res.ctime.valueOf() > now + 1000 ||
        !res.isDirectory() ||
        res.isFile() ||
        // NOTE: mode is documented, but not actually returned, at least on
        // Android. We'll deal with it later.
        res.mode !== undefined ||
        res.mtime.valueOf() < now - 1000 ||
        res.mtime.valueOf() > now + 1000 ||
        // TODO: Check this works as documented for Android Contentt URIs.
        res.originalFilepath !== `${path}/folder` ||
        res.path !== `${path}/folder` ||
        // TODO: Again, check why we report 4096 byte size for a folder?
        res.size !== 4096
      ) {
        return 'fail';
      }

      res = await stat(`${path}/test-file.txt`);

      if (
        res.ctime.valueOf() < now - 1000 ||
        res.ctime.valueOf() > now + 1000 ||
        res.isDirectory() ||
        !res.isFile() ||
        // NOTE: mode is documented, but not actually returned, at least on
        // Android. We'll deal with it later.
        res.mode !== undefined ||
        res.mtime.valueOf() < now - 1000 ||
        res.mtime.valueOf() > now + 1000 ||
        // TODO: Check this works as documented for Android Contentt URIs.
        res.originalFilepath !== `${path}/test-file.txt` ||
        res.path !== `${path}/test-file.txt` ||
        // TODO: Again, check why we report 4096 byte size for a folder?
        res.size !== 13
      ) {
        return 'fail';
      }

      try {
        res = await stat(`${path}/non-existing-file.txt`);
        return 'fail';
      } catch (e: any) {
        if (
          !isMatch(e, {
            code: 'EUNSPECIFIED',
            message: 'File does not exist',
          })
        ) {
          return 'fail';
        }
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
