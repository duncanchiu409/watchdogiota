import { View, Text, ScrollView } from 'react-native'
import React, { useEffect, useState } from 'react'

import { Searchbar, Card, Avatar, IconButton, Button } from 'react-native-paper';
import EncryptedStorage from 'react-native-encrypted-storage';
import messaging from '@react-native-firebase/messaging'
import env from '../env'

export default function AccountSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [userToken, setUserToken] = useState(null)
  const [userInfo, setUserInfo] = useState(null)
  const [displayOrganizations, setDisplayOrganizations] = useState([]);
  const [organizations, setOrganization] = useState([]);
  const [userOrganizations, setUserOrganizations] = useState([])

  const onChangeSearch = query => {
    if(query === ""){
      setDisplayOrganizations(organizations)
      setSearchQuery("")
    }
    else{
      const searchResult = organizations.filter(organization => {
        if(String(organization.patientName).toLowerCase().includes(query.toLowerCase())){
          return true
        }
        else{
          return false
        }
      })

      setDisplayOrganizations(searchResult)
      setSearchQuery(query)
    }
  };

  const getOrganizationPatients = () => {
    if(!userToken){
      return
    }
    if(!userInfo){
      return
    }
     
    fetch(env.SERVERHOST + "/watchdog/organization/" + userInfo.organizationUniqueId + "/patient" , {
          headers: {
            "Authorization": "Bearer " + userToken.token,
            "Access-Control-Allow-Origin": "*"
          }
      })
    .then(response => {
      console.log(response)
      return response.json()
    })
    .then(responseJSON => {
      setOrganization(responseJSON.patientList)
    })
    .catch(err => console.log(err))
  }

  const getUserPatients = () => {
    if(!userToken){
      return
    }

    fetch(env.SERVERHOST + "/watchdog/subscription/app_user/" + userToken.userUniqueId , {
          headers: {
            "Authorization": "Bearer " + userToken.token,
            "Access-Control-Allow-Origin": "*"
          }
      })
    .then(async response => {
      const responseJSON = await response.json()
      setUserOrganizations(responseJSON.subscribedPatientPreview)
      let i = 0
      while(i<responseJSON.subscribedPatientPreview.length){
        const patient = responseJSON.subscribedPatientPreview[i]

        console.log(patient)
        messaging().subscribeToTopic('patient_status_' + patient.patientUniqueId).then(() => {
          console.log("Subscribed to Topic ", patient.patientUniqueId)
        })

        i++
      }
    }).catch(err => console.log(err))
  }

  const addPatient = async (organization) => {
    const token = await messaging().getToken()
    fetch(env.SERVERHOST + "/watchdog/subscription/app_user/" + userToken.userUniqueId + "/patient", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + userToken.token,
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({
        targetPatientUniqueId: organization.uniqueId,
        notificationType: "PUSH_ONLY",
        enabled: true,
        registrationToken: token
      })
    })
    .then(response => response.json())
    .then(responseJSON => {
      getUserPatients()
    })
    .catch(err => console.log(err))
  }

  const removePatient = async (organization) => {
    const token = await messaging().getToken()
    fetch(env.SERVERHOST + "/watchdog/subscription/app_user/" + userToken.userUniqueId + "/patient", {
      method: "DELETE",
      headers: {
        "Authorization": "Bearer " + userToken.token,
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({
        targetPatientUniqueId: organization.uniqueId,
        registrationToken: token
      })
    })
    .then(response => response.json())
    .then(responseJSON => {
      getUserPatients()
      messaging().unsubscribeFromTopic('patient_status_' + organization.uniqueId).then(() => {
        console.log("Unsubscribed to Topic", organization.uniqueId)
      })
    })
    .catch(err => console.log(err))
  }

  useEffect(() => {
    EncryptedStorage.getItem('userToken').then(user => {
      setUserToken(JSON.parse(user))
    })
  }, [])

  useEffect(() => {
    if(userToken === null){
      return
    }

    fetch(env.SERVERHOST + "/watchdog/user/app_user/" + userToken.userUniqueId, {
        headers: {
          "Authorization": "Bearer " + userToken.token,
        }
      })
    .then(response => {
      return response.json()
    })
    .then(responseJSON => {
      EncryptedStorage.setItem('userInfo', JSON.stringify(responseJSON.appUser))
      setUserInfo(responseJSON.appUser)
    })

    getUserPatients()
  }, [userToken])

  useEffect(() => {
    getOrganizationPatients()
  }, [userToken, userInfo])

  useEffect(() => {
    setDisplayOrganizations(organizations)
  }, [organizations])

  return (
    <>
      <View style={{ flex:2 }}>
        <Searchbar
          style={{ marginTop: 10 }}
          placeholder="Search"
          onChangeText={onChangeSearch}
          value={searchQuery}
        />
        <ScrollView style={{ marginBottom: 0 }}>
          { displayOrganizations.map( organization => (
            <Card style={{ marginTop: 10 }} key={ organization.uniqueId }>
              <Card.Title
                  title={ organization.patientName }
                  subtitle={ organization.uniqueId }
                  left={(props) => <Avatar.Image style={{ backgroundColor: "white" }} {...props} source={{ uri: env.SERVERHOST + organization.avatarUrl}} />}
                  right={(props) => {
                    if(userOrganizations.find(userPatient => userPatient.patientUniqueId === organization.uniqueId ) === undefined){
                      return <IconButton {...props} icon="account-plus" onPress={() => {addPatient(organization)}} />
                    }
                    else{
                      return <IconButton {...props} icon="account-cancel" onPress={() => {removePatient(organization)} } />
                    }
                  }}
              />
            </Card>
          )) }
          <Button mode='contained' style={{ marginTop: 15, marginHorizontal: 5 }} onPress={() => {
            getOrganizationPatients()
          }}>Reload</Button>
        </ScrollView>
      </View>
    </>
  )
}