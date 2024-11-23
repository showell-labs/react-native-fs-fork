import {
  TemporaryDirectoryPath,
  mkdir,
  stat,
  writeFile,
} from "@dr.pogodin/react-native-fs";
import { isMatch } from "lodash";
import { Platform } from "react-native";
import { type TestMethods, SEPARATOR, tryUnlink } from "../TestBaseMethods";
import { Result } from '../TestStatus';

export const statTests: TestMethods = {
  // ! this test is way too long, it should be split into smaller tests
  "stat()": async () => {
    try {
      const path = `${TemporaryDirectoryPath}${SEPARATOR}ö-stat-test`;
      await tryUnlink(path);
      const now = Date.now();
      await mkdir(`${path}${SEPARATOR}földer`);
      await writeFile(`${path}${SEPARATOR}ö-test-file.txt`, "Dummy content");

      // TODO: There is something wrong with this test on Windows:
      // it tends to randomly pass or fail, it should be double-checked
      // why.
      let res = await stat(`${path}${SEPARATOR}földer`);
      if (
        res.ctime.valueOf() < now - 1000 ||
        res.ctime.valueOf() > now + 1000 ||
        !res.isDirectory() ||
        res.isFile() ||
        // NOTE: mode is documented, but not actually returned, at least on
        // Android. We'll deal with it later.
        res.mode !==
          Platform.select({
            android: undefined,
            windows: undefined,

            // TODO: At least temporary not supported on iOS/macOS
            default: undefined, // 493,
          }) ||
        res.mtime.valueOf() < now - 1000 ||
        res.mtime.valueOf() > now + 1000 ||
        // TODO: Check this works as documented for Android Contentt URIs.
        res.originalFilepath !==
          Platform.select({
            android: `${path}${SEPARATOR}földer`,
            ios: "NOT_SUPPORTED_ON_IOS",
            windows: undefined,
          }) ||
        res.path !== `${path}${SEPARATOR}földer` ||
        // TODO: Again, check why we report 4096 byte size for a folder?
        res.size !==
          Platform.select<number | string>({
            android: 4096,
            ios: 64,
            windows: "0",
          })
      ) {
        return Result.error();
      }

      res = await stat(`${path}${SEPARATOR}ö-test-file.txt`);
      if (
        res.ctime.valueOf() < now - 1000 ||
        res.ctime.valueOf() > now + 1000 ||
        res.isDirectory() ||
        !res.isFile() ||
        // NOTE: mode is documented, but not actually returned, at least on
        // Android. We'll deal with it later.
        res.mode !==
          Platform.select({
            android: undefined,
            default: undefined, // 420,
            windows: undefined,
          }) ||
        res.mtime.valueOf() < now - 1000 ||
        res.mtime.valueOf() > now + 1000 ||
        // TODO: Check this works as documented for Android Contentt URIs.
        res.originalFilepath !==
          Platform.select({
            android: `${path}${SEPARATOR}ö-test-file.txt`,
            ios: "NOT_SUPPORTED_ON_IOS",
            windows: undefined,
          }) ||
        res.path !== `${path}${SEPARATOR}ö-test-file.txt` ||
        res.size !==
          Platform.select<number | string>({
            windows: "13",
            default: 13,
          })
      ) {
        return Result.error(`unexpected result: ${JSON.stringify(res)}`);
      }

      try {
        res = await stat(`${path}${SEPARATOR}non-existing-file.txt`);
        return Result.error(`stat() should throw for non-existing files`);
      } catch (e: any) {
        switch (Platform.OS) {
          case "android":
            if (
              !isMatch(e, {
                code: "ENOENT",
                message:
                  "ENOENT: no such file or directory, open '/data/user/0/drpogodin.reactnativefs.example/cache/ö-stat-test/non-existing-file.txt'",
              })
            )
              return Result.catch(e);
            break;
          case "windows":
            if (
              !isMatch(e, {
                code: "ENOENT",
                message: `ENOENT: no such file or directory, open ${path}${SEPARATOR}non-existing-file.txt`,
              })
            )
              return Result.catch(e);
            break;
          default:
            if (
              !isMatch(e, {
                code: "NSCocoaErrorDomain:260",
                message:
                  "The file “non-existing-file.txt” couldn’t be opened because there is no such file.",
              })
            )
              return Result.catch(e);
        }
      }

      return Result.success();
    } catch (e) {
      return Result.catch(e);
    }
  },
};
