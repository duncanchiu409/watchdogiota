import React, { useEffect, useState } from 'react'
import { Text, View, Image, ScrollView, Alert, BackHandler } from 'react-native'
import styles from '../styles/styles'
import env from '../env'

import { Card, Avatar, IconButton, Icon, Button, Portal, Dialog, PaperProvider } from 'react-native-paper'
import EncryptedStorage from 'react-native-encrypted-storage'
import { useNavigation } from '@react-navigation/native'
import messaging from '@react-native-firebase/messaging'

// const patient_profile = {
//   "01HAAA2QCVZ7K560XPDRT8QBS5": require('../assets/01HAAA2QCVZ7K560XPDRT8QBS5.jpeg'),
//   "01HAAA2QCWB6AYVE2V82VMBHQX": require('../assets/01HAAA2QCWB6AYVE2V82VMBHQX.jpeg'),
//   "01HAAA2QCWAAYD23QAMA18RWXC": require('../assets/01HAAA2QCWAAYD23QAMA18RWXC.jpeg'),
//   "01HAAA2QCW0R3CCSTDWCDC148Z": require('../assets/01HAAA2QCW0R3CCSTDWCDC148Z.jpeg'),
//   "01HAAA2QCWMM9W6V41G58ZW48G": require('../assets/01HAAA2QCWMM9W6V41G58ZW48G.jpeg'),
//   "01HAAA2QCXGYCY8VWV79XTQ6TD": require('../assets/01HAAA2QCXGYCY8VWV79XTQ6TD.jpeg'),
//   "01HAAA2QCXTT7JVTNTZHPBV8CM": require('../assets/01HAAA2QCXTT7JVTNTZHPBV8CM.jpeg'),
//   "01HAAA2QCXH0Q27NGCX639N6KB": require('../assets/01HAAA2QCXH0Q27NGCX639N6KB.jpeg'),
//   "01HAAA2QCYKFKG8RZ77RV6ZT4F": require('../assets/01HAAA2QCYKFKG8RZ77RV6ZT4F.jpeg'),
//   "01HAAA2QCY0KV73D2A9V2NYC5B": require('../assets/01HAAA2QCY0KV73D2A9V2NYC5B.jpeg')
// }

export default function MyProfile(navigation) {
  const [userToken, setUserToken] = useState(null)
  const [userInfo, setUserInfo] = useState(null)

  const [userPatients, setUserPatients] = useState([])
  const [userPatientStatus, setUserPatientStatus] = useState([])

  const [visibleUserProfile, setVisibleUserProfile] = useState(false)
  const showUserDialog = () => setVisibleUserProfile(true);
  const hideUserDialog = () => setVisibleUserProfile(false);

  const [visiblePatientProfile, setVisiblePatientProfile] = useState(false)
  const [displayPatient, setDisplayPatient] = useState(null);
  const showPatientDialog = (patient) => {
    fetch(env.SERVERHOST + "/watchdog/patient/" + patient.patientUniqueId, {
      headers: {
        "Authorization": "Bearer " + userToken.token
      }
    })
    .then(response => response.json())
    .then(responseJSON => {
      console.log(responseJSON)
      setDisplayPatient(responseJSON)
    })
  };
  const hidePatientDialog = () => setVisiblePatientProfile(false);

  const getUserPatients = () => {
    if(userToken === null){
      return
    }
    fetch(env.SERVERHOST + "/watchdog/subscription/app_user/" + userToken.userUniqueId , {
          headers: {
            "Authorization": "Bearer " + userToken.token
          }
      })
    .then(async response => {
      const responseJSON = await response.json()
      setUserPatients(responseJSON.subscribedPatientPreview)
    }).catch(err => console.log(err))
  }

  const getUserPatientStatus = () => {
    if(userToken === null){
      return
    }
    if(!userPatients){
      return
    }

    var arr = []
    var i = 0;
    while(i < userPatients.length){
      fetch(env.SERVERHOST + "/watchdog/patient/" + userPatients[i].patientUniqueId, {
        headers: {
          "Authorization": "Bearer " + userToken.token
        }
      })
      .then((response) => {
        return response.json()
      })
      .then(responseJSON => {
        if(responseJSON.patientStatus.status === "OK"){
          arr.push(responseJSON.patientStatus.patientUniqueId)
        }
      })
      .catch(err => console.log(err))
      i++;
    }
    setUserPatientStatus(arr)
  }

  const changeUserProfile = () => {
    console.log(userInfo)
    hideUserDialog()
  }

  useEffect(() => {
    EncryptedStorage.getItem('userToken').then( token => {
      setUserToken(JSON.parse(token))
    })
    .catch(err => console.log(err))
    EncryptedStorage.getItem('userInfo').then( token => {
      setUserInfo(JSON.parse(token))
    })
    .catch(err => console.log(err))
  }, [])

  useEffect(() => {
    getUserPatients()
  }, [userToken])

  useEffect(() => {
    getUserPatientStatus()
  }, [userPatients])

  useEffect(() => {
    if(displayPatient !== null){
      setVisiblePatientProfile(true)
    }
  }, [displayPatient])

  return (
    <PaperProvider>
    <ScrollView style={{ flex:2 }}>
        <View style={{ alignItems: 'center', paddingVertical: 30, backgroundColor: "purple", borderRadius: 30, margin: 20 }}>
          <Image source={{ uri: env.SERVERHOST + userInfo?.avatarUrl }} style={styles.profileImage}></Image>
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: "white" }}>{userInfo?.username}</Text>
          <Text style={{color: "white"}}>@{userToken?.userUniqueId}</Text>
          <View style={{ flexDirection: "row", marginTop: 20, gap: 10 }}>
            <Button mode='contained' onPress={showUserDialog}>Edit Profile</Button>
            <Button mode='contained' onPress={() => { 
              setTimeout(() => BackHandler.exitApp(), 1000)
            }}>Logout</Button>
          </View>
          <Portal>
            <Dialog visible={visibleUserProfile} onDismiss={hideUserDialog}>
              <Dialog.Title>Profile</Dialog.Title>
              <Dialog.Content style={{ flexDirection: 'column', gap: 5 }}>
                <View>
                  <Text style={styles.profileLabel}>Access Role</Text>
                  <Text variant="bodyMedium">{userInfo?.accessRole}</Text>
                </View>
                <View>
                  <Text style={styles.profileLabel}>Email Address</Text>
                  <Text variant="bodyMedium">{userInfo?.emailAddress}</Text>
                </View>
                <View>
                  <Text style={styles.profileLabel}>phoneNumber</Text>
                  <Text variant="bodyMedium">{userInfo?.phoneNumber}</Text>
                </View>
              </Dialog.Content>
              <Dialog.Actions>
                <Button onPress={hideUserDialog}>Cancel</Button>
                <Button onPress={changeUserProfile}>Done</Button>
              </Dialog.Actions>
            </Dialog>
          </Portal>
        </View>
        <Text style={{ fontSize: 30, marginLeft: 10, fontWeight: 'bold'}} >Your Patient</Text>
        <View style={{ marginBottom: 10 }}>
          { userPatients.map( patient => {
            return (
              <Card style={{ marginTop: 10 }} key={ patient.patientUniqueId } onPress={() => showPatientDialog(patient)}>
                <Card.Title
                  title={ patient.patientName }
                  subtitle={ patient.patientUniqueId }
                  left={(props) => <Avatar.Image {...props} style={{ backgroundColor: "white" }} source={{ uri: env.SERVERHOST + patient.avatarUrl }} />}
                  right={(props) => {
                    if(patient.patientUniqueId in userPatientStatus){
                      return <IconButton {...props} icon="alert" iconColor='red' onPress={() => {
                        Alert.alert("Warning", message="Toggling the status back to normal. However, please make sure the condition is under control.")
                        setUserPatientStatus([...userPatientStatus, patient.patientUniqueId])
                      }} />
                    }
                    else{
                      return <IconButton {...props} icon="adjust" iconColor='green' onPress={() => {
                          // Alert.alert("Warning", message="Toggling the status back to normal. However, please make sure the condition is under control.")
                      }} />
                    }
                  }}
                />
              </Card>
            )
          }) }
          <Button mode='contained' style={{ marginTop: 15, marginHorizontal: 5 }} onPress={() => { getUserPatients() }}>Reload</Button>
          <Portal>
            <Dialog visible={visiblePatientProfile} onDismiss={hidePatientDialog}>
              <Dialog.Title>Profile</Dialog.Title>
              <Dialog.Content style={{ flexDirection: 'column', gap: 5 }}>
                <View>
                  <Text style={styles.profileLabel}>Patient Name</Text>
                  <Text variant="bodyMedium">{displayPatient?.patient.patientName}</Text>
                </View>
                <View>
                  <Text style={styles.profileLabel}>Email Address</Text>
                  <Text variant="bodyMedium">{displayPatient?.patient.emailAddress}</Text>
                </View>
                <View>
                  <Text style={styles.profileLabel}>Phone Number</Text>
                  <Text variant="bodyMedium">{displayPatient?.patient.phoneNumber}</Text>
                </View>
                <View>
                  <Text style={styles.profileLabel}>Status</Text>
                  <Text variant="bodyMedium">{displayPatient?.patientStatus.status}</Text>
                </View>
                <View>
                  <Text style={styles.profileLabel}>Room People Count</Text>
                  <Text variant="bodyMedium">{displayPatient?.patientStatus.roomPersonCount}</Text>
                </View>
                <View>
                  <Text style={styles.profileLabel}>Bed People Count</Text>
                  <Text variant="bodyMedium">{displayPatient?.patientStatus.bedPersonCount}</Text>
                </View>
                <View>
                  <Text style={styles.profileLabel}>Update Time</Text>
                  <Text variant="bodyMedium">{displayPatient?.patientStatus.updateTime}</Text>
                </View>
              </Dialog.Content>
              <Dialog.Actions>
                <Button onPress={hidePatientDialog}>Cancel</Button>
                <Button onPress={hidePatientDialog}>Done</Button>
              </Dialog.Actions>
            </Dialog>
          </Portal>
        </View>
    </ScrollView>
    </PaperProvider>
  )
}
