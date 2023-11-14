import { View, Text, TextInput, Button, Alert } from 'react-native'
import uuid from 'react-native-uuid'
import React, { useState } from 'react'
import EncryptedStorage from 'react-native-encrypted-storage'
import styles from '../styles/styles'
import env from '../env'

export default function Signup({navigation}) {
  const [ state, setState ] = useState({ emailAddress: '', credential: '', errorMessage: null, phoneNumber: '', username: '', organisationUniqueId: 'e0000000-e000-e000-e000-e00000000000' })

  const handleSignUp = async () => {
    const payload = {
      emailAddress: state.emailAddress,
      credential: state.credential,
      phoneNumber: state.phoneNumber,
      username: state.username,
      transactionId: uuid.v4()
    }

    try{
      const response = await fetch(env.SERVERHOST + "/watchdog/user/app_user_register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "accept": "application/json"
        },
        body: JSON.stringify(payload)
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
    <View style={ styles.container } >
      <Text style={{color:'#e93766', fontSize: 40}}>Signup</Text>
      { state.errorMessage && <Text style={{color: 'red'}}>{ state.errorMessage }</Text> }
      <TextInput placeholder='Email' autoCapitalize='none' style={ styles.textInput } onChangeText={ email => setState({ ...state, emailAddress: email }) } value={ state.emailAddress }/>
      <TextInput placeholder='Username' autoCapitalize='none' style={ styles.textInput } onChangeText={ username => setState({ ...state, username }) } value={ state.username }/>
      <TextInput secureTextEntry placeholder='Password' autoCapitalize='none' style={ styles.textInput } onChangeText={ password => setState({ ...state, credential: password })} value={ state.credential }/>
      <TextInput placeholder='Organisation Number' style={ styles.textInput } onChangeText={ organisationUniqueId => setState({...state, organisationUniqueId}) } value={ state.organisationUniqueId }/>
      <Button title='Sign Up' color='#e93766' onPress={handleSignUp}/>
      <View>
        <Text>Already have an account? <Text onPress={() => navigation.navigate('Login')} style={{color: '#e93766', fontSize: 18}}>Login</Text></Text>
      </View>
    </View>
  )
}