# React Native File System Example

This example React Native application showcases & tests use cases for
[@dr.pogodin/react-native-fs] library.

**BEWARE**: _To facilitate development of the library, this example is set up
differently from a real RN project &mdash; instead of consuming the library from
a package in `node_modules`, installed from NPM registry; this example consumes
it directly from the source code in the parent folder. Because of this, be sure
to install NPM dependencies in the parent folder as well._

-  Since its **v2.22.0-alpha.0** the library codebase and its example app rely
   on [Yarn] as the package manager, and their development setup won't work with
   [NPM].

-  Install NPM dependencies executing in the library codebase root
   ```shell
   yarn install
   ```

-  Start RN development server executing in the library codebase root
   ```shell
   yarn example start
   ```

-  For **Android** target: Deploy example by executing in the codebase root
   folder the command
   ```shell
   yarn example android
   ```

-  For **iOS** target:
   -  Install Pods, executing inside `example/ios` folder the command
      ```sh
      RCT_NEW_ARCH_ENABLED=1 RN_STATIC_SERVER_WEBDAV=1 pod install
      ```
      **Note**: Omit `RCT_NEW_ARCH_ENABED` variable to build for old RN architecture.

   -  Open, build, and run example workspace in Xcode.

-  For **macOS (Catalyst)** target:
   -  Install Pods, executing inside `example/ios` folder the command
      ```sh
      MAC_CATALYST=1 RCT_NEW_ARCH_ENABLED=1 RN_STATIC_SERVER_WEBDAV=1 pod install
      ```
      **Note**: Omit `RCT_NEW_ARCH_ENABED` variable to build for old RN architecture.

   -  Open, build, and run example workspace in Xcode.

-  For **Windows** target:
   -  Open, build, and run example project in MS Visual Studio.

[@dr.pogodin/react-native-fs]: https://www.npmjs.com/package/@dr.pogodin/react-native-fs
[NPM]: https://www.npmjs.com
[Yarn]: https://yarnpkg.com
