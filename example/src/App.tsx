import React, { useEffect } from 'react';

import { SafeAreaView, ScrollView } from 'react-native';

import TestBaseMethods from './TestBaseMethods';
import TestConstants from './TestConstants';
import { start, stop } from './testServer';

export default function App() {
  useEffect(() => {
    start();
    return () => {
      stop();
    };
  }, []);
  return (
    <SafeAreaView>
      <ScrollView>
        <TestConstants />
        <TestBaseMethods />
      </ScrollView>
    </SafeAreaView>
  );
}
