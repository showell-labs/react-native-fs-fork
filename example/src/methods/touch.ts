import {
  stat,
  TemporaryDirectoryPath,
  touch,
  unlink,
  writeFile,
} from "@dr.pogodin/react-native-fs";
import type { TestMethods } from "../TestBaseMethods";
import { Result } from '../TestStatus';

export const touchTests: TestMethods = {
  "touch()": async () => {
    // TODO: This test fails on Windows, but I guess because stat()
    // does not work there the same as on other platforms.
    try {
      const filePath = `${TemporaryDirectoryPath}/töuch-test`;
      try {
        await unlink(filePath);
      } catch {}
      await writeFile(filePath, "xxx");
      const a = await stat(filePath);
      const b = await stat(filePath);

      if (a.ctime.valueOf() !== b.ctime.valueOf()) {
        return Result.error(
          `a.ctime: ${a.ctime.valueOf()} !== b.ctime: ${b.ctime.valueOf()}`
        );
      }
      if (a.mtime.valueOf() !== b.mtime.valueOf()) {
        return Result.error(
          `a.mtime: ${a.mtime.valueOf()} !== b.mtime: ${b.mtime.valueOf()}`
        );
      }

      const M_TIME = 1705969300000;
      await touch(filePath, new Date(M_TIME), new Date(M_TIME));
      const c = await stat(filePath);
      if (c.ctime.valueOf() !== M_TIME) {
        return Result.error(
          `c.ctime ${c.ctime.valueOf()} !== M_TIME ${M_TIME}`
        );
      }
      if (c.mtime.valueOf() !== M_TIME) {
        return Result.error(
          `c.mtime ${c.mtime.valueOf()} !== M_TIME ${M_TIME}`
        );
      }
      return Result.success();
    } catch (e) {
      return Result.catch(e);
    }
  },
};
