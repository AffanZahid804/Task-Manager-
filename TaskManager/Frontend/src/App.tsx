import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Platform,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import SplashScreen from 'react-native-splash-screen';
import NetInfo from '@react-native-community/netinfo';
import FlashMessage from 'react-native-flash-message';

// Import Firebase configuration
import './Backend/firebaseConfig';

// Import context providers
import { BoardProvider } from './context/BoardContext';

// Import screens
import BoardScreen from './screens/BoardScreen';

// Import styles
import { colors, globalStyles } from './styles/globalStyles';

// Define navigation types
type RootStackParamList = {
  Home: undefined;
  Board: { boardId: string };
  CreateBoard: undefined;
  EditBoard: { board: any };
  CreateTask: { columnId: string; boardId: string };
  EditTask: { task: any };
  Profile: undefined;
  Settings: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

// Loading component
const LoadingScreen: React.FC = () => (
  <View style={[globalStyles.container, globalStyles.loadingContainer]}>
    <Text style={globalStyles.text}>Loading Task Manager...</Text>
  </View>
);

// Error component
const ErrorScreen: React.FC<{ error: string; onRetry: () => void }> = ({ error, onRetry }) => (
  <View style={[globalStyles.container, globalStyles.errorContainer]}>
    <Text style={globalStyles.errorText}>Something went wrong</Text>
    <Text style={globalStyles.textSmall}>{error}</Text>
    <Text style={[globalStyles.text, globalStyles.marginTop]} onPress={onRetry}>
      Tap to retry
    </Text>
  </View>
);

// Main App component
const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(true);

  // Initialize app
  useEffect(() => {
    initializeApp();
    setupNetworkListener();
  }, []);

  // Initialize the application
  const initializeApp = async () => {
    try {
      // Hide splash screen after a minimum delay
      setTimeout(() => {
        SplashScreen.hide();
        setIsLoading(false);
      }, 2000);

      // Add any additional initialization logic here
      // For example: load user preferences, check authentication, etc.
      
    } catch (err) {
      console.error('App initialization error:', err);
      setError('Failed to initialize application');
      setIsLoading(false);
    }
  };

  // Setup network connectivity listener
  const setupNetworkListener = () => {
    NetInfo.addEventListener(state => {
      const wasConnected = isConnected;
      const isNowConnected = state.isConnected && state.isInternetReachable;
      
      if (wasConnected && !isNowConnected) {
        // Lost connection
        Alert.alert(
          'No Internet Connection',
          'Please check your internet connection and try again.',
          [{ text: 'OK' }]
        );
      } else if (!wasConnected && isNowConnected) {
        // Regained connection
        Alert.alert(
          'Connection Restored',
          'Internet connection has been restored.',
          [{ text: 'OK' }]
        );
      }
      
      setIsConnected(isNowConnected || false);
    });
  };

  // Handle retry
  const handleRetry = () => {
    setError(null);
    setIsLoading(true);
    initializeApp();
  };

  // Show loading screen
  if (isLoading) {
    return <LoadingScreen />;
  }

  // Show error screen
  if (error) {
    return <ErrorScreen error={error} onRetry={handleRetry} />;
  }

  return (
    <GestureHandlerRootView style={globalStyles.container}>
      <SafeAreaProvider>
        <StatusBar
          barStyle="dark-content"
          backgroundColor={colors.background}
          translucent={Platform.OS === 'android'}
        />
        
        <NavigationContainer
          theme={{
            dark: false,
            colors: {
              primary: colors.primary,
              background: colors.background,
              card: colors.surface,
              text: colors.textPrimary,
              border: colors.border,
              notification: colors.error,
            },
          }}
        >
          <BoardProvider>
            <Stack.Navigator
              initialRouteName="Home"
              screenOptions={{
                headerStyle: {
                  backgroundColor: colors.surface,
                  elevation: 0,
                  shadowOpacity: 0,
                },
                headerTintColor: colors.textPrimary,
                headerTitleStyle: {
                  fontFamily: 'System',
                  fontWeight: '600',
                },
                headerBackTitleVisible: false,
                cardStyle: { backgroundColor: colors.background },
              }}
            >
              <Stack.Screen
                name="Home"
                component={BoardScreen}
                options={{
                  title: 'Task Manager',
                  headerShown: false,
                }}
              />
              <Stack.Screen
                name="Board"
                component={BoardScreen}
                options={({ route }) => ({
                  title: 'Board',
                  headerShown: false,
                })}
              />
              {/* Add more screens here as needed */}
            </Stack.Navigator>
          </BoardProvider>
        </NavigationContainer>
        
        {/* Flash message for notifications */}
        <FlashMessage position="top" />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default App; 