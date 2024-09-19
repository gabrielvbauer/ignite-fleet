import { Container, Content, Message, MessageContent } from "./styles";

import { Header } from "../../components/Header";
import { LicensePlateInput } from "../../components/LicensePlateInput";
import { TextAreaInput } from "../../components/TextAreaInput";
import { Button } from "../../components/Button";
import { useEffect, useRef, useState } from "react";
import { TextInput, ScrollView, Alert } from "react-native";
import { licensePlateValidate } from "../../utils/licensePlateValidate";
import { useRealm } from "../../libs/realm";
import { Historic } from "../../libs/realm/schemas/Historic";
import { useUser } from "@realm/react";
import { useNavigation } from "@react-navigation/native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import { useForegroundPermissions, watchPositionAsync, LocationAccuracy, LocationSubscription, LocationObjectCoords, useBackgroundPermissions, requestBackgroundPermissionsAsync } from 'expo-location'
import { getAddressLocation } from "../../utils/getAddressLocation";
import { Loading } from "../../components/Loading";
import { LocationInfo } from "../../components/LocationInfo";
import { Car } from "phosphor-react-native";
import { Map } from "../../components/Map";
import { startLocationTask } from "../../tasks/backgroundLocationTask";
import { openSettings } from "../../utils/openSettings";

export function Departure() {
  const [description, setDescription] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingLocation, setIsLoadingLocation] = useState(true)
  const [currentAddress, setCurrentAddress] = useState<string | null>(null)
  const [currentCord, setCurrentCord] = useState<LocationObjectCoords | null>(null)
  
  const [locationForegroundPermission, requestLocationForegroundPermission] = useForegroundPermissions()

  const navigation = useNavigation()
  const realm = useRealm()
  const user = useUser()

  const licensePlateRef = useRef<TextInput>(null)
  const descriptionRef = useRef<TextInput>(null)

  async function handleDepartureRegister() {
    setIsLoading(true)

    try {
      if (!licensePlateValidate(licensePlate)) {
        licensePlateRef.current?.focus()
        return Alert.alert('Placa inválida', 'A placa é inválida. Por favor informa a placa correta do veículo.')
      }
      
      if (description.trim().length === 0) {
        descriptionRef.current?.focus()
        return Alert.alert('Finalidade', 'Por favor, informe a finalidade da utilização do veículo.')
      }

      if (!currentCord?.latitude || !currentCord?.longitude) {
        return Alert.alert("Localização", 'Não foi possível obter a localização atual. Tente novamente.')
      }

      const backgroundPermissions = await requestBackgroundPermissionsAsync();

      if (!backgroundPermissions.granted) {
        return Alert.alert(
          "Localização",
          "É necessário permitir que o app tenha acesso a localização em segundo plano",
          [{ text: 'Abrir configurações', onPress: openSettings }]
        )
      }

      await startLocationTask();

      realm.write(() => {
        realm.create('Historic', Historic.generate({
          user_id: user!.id,
          description,
          license_plate: licensePlate.toUpperCase(),
          coords: [{
            latitude: currentCord.latitude,
            longitude: currentCord.longitude,
            timestamp: new Date().getTime()
          }]
        }))
      })

      Alert.alert('Saída', 'Saída do veículo cadastrada com sucesso.')
      navigation.goBack()

    } catch (error) {
      console.error(error)
      Alert.alert('Erro', 'Não foi possível registrar a saída do veículo.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    requestLocationForegroundPermission()
  }, [])

  useEffect(() => {
    if (!locationForegroundPermission?.granted) {
      return
    }

    let subscription: LocationSubscription
    
    watchPositionAsync({
      accuracy: LocationAccuracy.High,
      timeInterval: 1000 // 1s
    }, (location) => {
      setCurrentCord(location.coords)

      getAddressLocation(location.coords).then((address) => {
        if (address) {
          setCurrentAddress(address)
        }
      })
      .finally(() => setIsLoadingLocation(false))
    }).then((response)=> subscription = response)

    return () => {
      if (subscription) {
        subscription.remove()
      }
    }
  }, [locationForegroundPermission?.granted])

  if (!locationForegroundPermission?.granted) {
    return (
      <Container>
        <Header title="Saída" />
        <MessageContent>
          <Message>
            Você precisa permitir que o aplicativo tenha acesso a localização para utilizar essa funcionalidade.
            Por favor, acesse as configurações do seu dispositivo para conceder essa permissão ao aplicativo.
          </Message>

          <Button title="Abrir configurações" onPress={openSettings} />
        </MessageContent>
      </Container>
    )
  }

  if (isLoadingLocation) {
    return <Loading />
  }

  return (
    <Container>
      <Header title="Saída" />

      <KeyboardAwareScrollView extraHeight={100}>
        <ScrollView>
          {
            currentCord && (
              <Map coordinates={[currentCord]} />
            )
          }

          <Content>
            {
              currentAddress && (
                <LocationInfo
                  icon={Car}
                  label="Localização atual"
                  description={currentAddress}
                />
              )
            }

            <LicensePlateInput
              ref={licensePlateRef}
              label="Placa do veículo"
              placeholder="BRA1234"
              onSubmitEditing={() => descriptionRef.current?.focus()}
              returnKeyType="next"
              onChangeText={setLicensePlate}
            />
            <TextAreaInput
              ref={descriptionRef}
              label="Finalidade"
              placeholder="Vou utilizar o veículo para..."
              onSubmitEditing={handleDepartureRegister}
              returnKeyType="send"
              blurOnSubmit
              onChangeText={setDescription}
            />

            <Button
              title="Registrar saída"
              onPress={handleDepartureRegister}
              isLoading={isLoading}
            />
          </Content>
        </ScrollView>
      </KeyboardAwareScrollView>
    </Container>
  )
}