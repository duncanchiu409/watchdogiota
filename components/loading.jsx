import { View, Text, StyleSheet, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'

import auth from "@react-native-firebase/auth"

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    }
})

export default function Loading({navigation}) {
  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(user => {
      if(!user){
        navigation.navigate('Login')
      }
      else{
        navigation.navigate('Home')
      }
    });
    return subscriber; // unsubscribe on unmount
  }, []);

  return (
    <View style={styles.container}>
        <Text style={{color:'#e93766', fontSize: 40}}>Loading</Text>
        <ActivityIndicator color='#e93766' size="large" />
    </View>
  )
}