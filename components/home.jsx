import { View, Text, Linking, ScrollView} from 'react-native'
import React, {useEffect, useState} from 'react'
import { BottomNavigation, Card, Avatar, IconButton, Button } from 'react-native-paper'
import env from '../env'

import AccountSearch from './accountSearch';
import MyProfile from './myProfile';
import EncryptedStorage from 'react-native-encrypted-storage';

function NotificationsRoute() {
  const [userToken, setUserToken] = useState({})
  const [userInfo, setUserInfo] = useState({})
  const [userSubscribedPatients, setUserSubscribedPatients] = useState([])
  const [notifications, setNotifications] = useState([])

  function reset(){
    fetch(env.SERVERHOST + "/watchdog/subscription/app_user/" + userToken.userUniqueId, {
      headers: {
        "Authorization": "Bearer " + userToken.token
      }
    })
    .then(response => response.json())
    .then(responseJSON => {
      console.log("notification: ",responseJSON)
      setUserSubscribedPatients(responseJSON.subscribedPatientPreview)
    })
    .catch(err => {
      console.log(err)
    })
  }

  useEffect(() => {
    EncryptedStorage.getItem('userToken').then(token => {
      setUserToken(JSON.parse(token))
      return EncryptedStorage.getItem("userInfo")
    })
    .then(token => {
      setUserInfo(JSON.parse(token))
    })
    .catch(err => {
      console.error(err)
    })
  }
  , [])

  useEffect(() => {
    fetch(env.SERVERHOST + "/watchdog/subscription/app_user/" + userToken.userUniqueId, {
      headers: {
        "Authorization": "Bearer " + userToken.token
      }
    })
    .then(response => response.json())
    .then(responseJSON => {
      setUserSubscribedPatients(responseJSON.subscribedPatientPreview)
      console.log(userSubscribedPatients)
    })
    .catch(err => {
      console.log(err)
    })
  }, [userToken])

  useEffect(() => {
    const fn = async () => {
      let i = 0
      let j = []
  
      while(i < userSubscribedPatients.length){
        await fetch(env.SERVERHOST + "/watchdog/patient/" + userSubscribedPatients[i].patientUniqueId + "/incident_history", {
          headers: {
            "Authorization": "Bearer " + userToken.token
          }
        })
        .then(response => response.json())
        .then(responseJSON => {
          if(responseJSON.patientIncidentHistoryList === undefined){
            return
          }

          responseJSON.patientIncidentHistoryList.forEach(element => {
            j.push(element)
          });
        })
        .catch(err => {
          console.log(err)
        })
        i++
      }

      j = j.sort((a, b) => b.creationTime - a.creationTime).slice(0, 10)
      setNotifications(j)
      console.log(j)
    }
    fn()
  }, [userSubscribedPatients])

  return (
    <>
      <ScrollView>
      {
        notifications.map( notification => 
          <Card style={{ marginTop: 10 }}>
            <Card.Title
              title={ (userSubscribedPatients.find( patient => patient.patientUniqueId == notification.patientUniqueId )).patientName }
              subtitle={ new Date(notification.creationTime * 1000).toLocaleTimeString() }
              left={(props) => <Avatar.Image {...props} source={{ uri: env.SERVERHOST + "/watchdog/avatar/person_icon_default.png" }} style={{ backgroundColor: 'white' }}/>}
              right={(props) => {
                if( notification.detectionEvent === "EXIT_BED" ){
                  return <IconButton {...props} icon="bed" iconColor="red" onPress={() => {}} />
                }
                else if( notification.detectionEvent === "ENTER_DOOR" ){
                  return <IconButton {...props} icon="door" iconColor="green" onPress={() => {}} />
                }
                else if( notification.detectionEvent === "EXIT_DOOR" ){
                  return <IconButton {...props} icon="door" iconColor="red" onPress={() => {}} />
                }
                else{
                  return <IconButton {...props} icon="bed" iconColor="green" onPress={() => {}} />
                }
              }}
            />
          </Card>)
      }
        <Button title='Reload' mode='contained' style={{ marginTop: 15, marginHorizontal: 5 }} onPress={reset}>Reload</Button>
      </ScrollView>
    </>
  )
}

export default function Home({navigation}) {
  const [index, setIndex] = useState(0)

  const logout = () => navigation.navigate('Login')

  const [routes] = useState([
    { key: 'search', title: 'Search', focusedIcon: 'account-search' },
    { key: 'profile', title: 'Profile', focusedIcon: 'clipboard-list'},
    { key: 'notifications', title: 'Notifications', focusedIcon: 'bell'},
  ])

  const renderScene = BottomNavigation.SceneMap({
    search: AccountSearch,
    profile: MyProfile,
    notifications: NotificationsRoute,
  });

  return (
    <BottomNavigation navigationState={{index, routes}} onIndexChange={setIndex} renderScene={renderScene}></BottomNavigation>
  )
}