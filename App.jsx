/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import messaging from '@react-native-firebase/messaging'

import Login from './components/login'
import Signup from './components/signup'
import Dashboard from './components/dashboard';
import Loading from './components/loading'
import Home from './components/home'
import { Alert } from 'react-native';
import { Title } from 'react-native-paper';

messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Message handled in the background!', remoteMessage);
});

const Stack = createNativeStackNavigator()
function MyStack(){
  return(
    <Stack.Navigator initialRouteName='Loading' screenOptions={{headerShown: false}}>
      <Stack.Screen name='Login' component={Login} options={{headerLeft:null}}></Stack.Screen>
      <Stack.Screen name='Signup' component={Signup}></Stack.Screen>
      <Stack.Screen name='Dashboard' component={Dashboard}></Stack.Screen>
      <Stack.Screen name='Loading' component={Loading}></Stack.Screen>
      <Stack.Screen name='Home' component={Home}></Stack.Screen>
    </Stack.Navigator>
  )
}

function App(){
  const getFCMToken = async () => {
    try {
      const token = await messaging().getToken();
      console.log(token);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    messaging().onMessage(async remoteMessage => {
      console.log(JSON.stringify(remoteMessage))
      
      if(remoteMessage.notification != undefined){
        Alert.alert(remoteMessage.notification.title, remoteMessage.notification.body)
      }
      else{
        Alert.alert(remoteMessage.data.title, remoteMessage.data.body)
      }
    });
  }, [])

  useEffect(() => {
    getFCMToken()
  }, [messaging])

  return(
    <NavigationContainer>
      <MyStack></MyStack>
    </NavigationContainer>
  )
}

export default App;