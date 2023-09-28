import { mkdir } from '@dr.pogodin/react-native-fs';

import Server, {
  resolveAssetsPath,
} from '@dr.pogodin/react-native-static-server';

export const FILE_DIR = resolveAssetsPath('test-server');

let serverPromise: Promise<Server> | undefined;

export async function start() {
  if (!serverPromise) {
    serverPromise = new Promise(async (resolve) => {
      await mkdir(`${FILE_DIR}/dav`);
      const server = new Server({
        fileDir: FILE_DIR,
        port: 3000,

        // These settings enable all available debug options for Lighttpd core,
        // to facilitate library development & testing with the example app.
        errorLog: {
          conditionHandling: true,
          fileNotFound: true,
          requestHandling: true,
          requestHeader: true,
          requestHeaderOnError: true,
          responseHeader: true,
          timeouts: true,
        },

        webdav: ['dav'],
      });
      await server.start();
      resolve(server);
    });
  }

  return serverPromise;
}

export async function stop() {
  if (serverPromise) {
    const server = await serverPromise;
    await server.stop();
    serverPromise = undefined;
  }
}

export async function waitServer() {
  return serverPromise || start();
}
