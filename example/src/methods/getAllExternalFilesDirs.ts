import { getAllExternalFilesDirs } from "@dr.pogodin/react-native-fs";
import type { TestMethods } from "../TestBaseMethods";
import { Result } from '../TestStatus';

export const getAllExternalFilesDirsTests: TestMethods = {
  // TODO: This is not a very strict test.
  "getAllExternalFilesDirs()": async () => {
    try {
      const res = await getAllExternalFilesDirs();
      if (!Array.isArray(res) || res.some((x) => typeof x !== "string")) {
        return Result.error(`result is not a string[]: ${JSON.stringify(res)}`);
      }
      return Result.success();
    } catch (e) {
      return Result.catch(e);
    }
  },
};
