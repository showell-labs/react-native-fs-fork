import { TemporaryDirectoryPath } from "@dr.pogodin/react-native-fs";
import { Platform } from "react-native";

export const SEPARATOR = Platform.OS === "windows" ? "\\" : "/";
export const ÄÖÜ = 'öäü-';
export const PATH = (...path: string[]) =>
  TemporaryDirectoryPath + SEPARATOR + ÄÖÜ + path.join(SEPARATOR + ÄÖÜ);
export const CONTENT = "GÖÖÐ\n";
export const CONTENT_UTF8 = "\x47\xC3\x96\xC3\x96\xC3\x90\x0A";
export const DUMMY_CONTENT = "Dummy content";

export const TEST_ASSET_UFT8 = `gööd-utf8.txt`; // content === CONTENT
export const TEST_ASSET_LATIN1 = `gööd-latin1.txt`;
export const TEST_ASSET_UFT8_PATH = `test/${TEST_ASSET_UFT8}`;
export const TEST_ASSET_LATIN1_PATH = `test/${TEST_ASSET_LATIN1}`;
