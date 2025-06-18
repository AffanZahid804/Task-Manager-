/**
 * @format
 */

import { AppRegistry, LogBox } from 'react-native';
import App from './src/App';
import { name as appName } from './app.json';

// Ignore specific warnings that are not critical
LogBox.ignoreLogs([
  'Require cycle:',
  'ViewPropTypes will be removed',
  'AsyncStorage has been extracted',
  'EventEmitter.removeListener',
  'Non-serializable values were found in the navigation state',
]);

// Ignore all warnings in production
if (__DEV__ === false) {
  LogBox.ignoreAllLogs();
}

// Register the main component
AppRegistry.registerComponent(appName, () => App); 