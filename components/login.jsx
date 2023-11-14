import { View, Text, TextInput, Button, Alert } from 'react-native'
import React, { useState } from 'react'
import EncryptedStorage from 'react-native-encrypted-storage';
import messaging from '@react-native-firebase/messaging'
import styles from '../styles/styles'
import env from '../env'

export default function Login({ navigation }) {
  const [state, setState] = useState({ email: 'admin@watchdog.iota.org', password: 'admin', errorMessage: '' })

  const handleLogin = async () => {
    try{
      const response = await fetch( env.SERVERHOST + "/watchdog/auth/user_login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "accept": "application/json"
        },
        body: JSON.stringify({account: state.email, credential: state.password})
      })

      const responseJSON = await response.json()
      if(responseJSON.status.statusCode === "OK"){
        EncryptedStorage.setItem('userToken', JSON.stringify(responseJSON)).then( token => {
          navigation.navigate('Home')
        })
      }
      else{
        Alert.alert(responseJSON.status.statusCode)
      }
    }
    catch(error){
      console.error(error)
    }
  }

  return (
    <View style={ styles.container }>
      <Text style={{ color: '#e93766', fontSize: 40 }}>Login</Text>
      { state.errorMessage && <Text style={{ color: 'red' }}>{ state.errorMessage }</Text> }
      <TextInput style={ styles.textInput } autoCapitalize='none' placeholder='Email' onChangeText={ email => setState({ ...state, email }) } value={ state.email }/>
      <TextInput secureTextEntry style={ styles.textInput } autoCapitalize='none' placeholder='Password' onChangeText={ password => setState({ ...state, password }) } value={ state.password }/>
      <Button title='Login' color='#e93766' onPress={handleLogin}/>
      <View>
        <Text> Don't have an account? <Text onPress={() => navigation.navigate('Signup')} style={{ color: '#e93766', fontSize: 18 }}>Sign Up</Text></Text>
      </View>
    </View>
  )
}