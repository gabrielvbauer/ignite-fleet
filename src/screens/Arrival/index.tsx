import { useNavigation, useRoute } from "@react-navigation/native";
import { AsyncMessage, Container, Content, Description, Footer, Label, LicensePlate } from "./styles";
import { Header } from "../../components/Header";
import { Button } from "../../components/Button";
import { ButtonIcon } from "../../components/ButtonIcon";
import { X } from "phosphor-react-native";
import { useObject, useRealm } from "../../libs/realm";
import { Historic } from "../../libs/realm/schemas/Historic";
import { BSON } from "realm";
import { Alert } from "react-native";
import { useEffect, useState } from "react";
import { getLastAsyncTimestamp } from "../../libs/async-storage/async-storage";
import { stopLocationTask } from "../../tasks/backgroundLocationTask";
import { getStorageLocation } from "../../libs/async-storage/location-storage";
import { LatLng } from "react-native-maps";
import { Map } from "../../components/Map";
import { Locations } from "../../components/Locations";
import { getAddressLocation } from "../../utils/getAddressLocation";
import { LocationInfoProps } from "../../components/LocationInfo";
import dayjs from "dayjs";
import { Loading } from "../../components/Loading";

export interface ArrivalParams {
  id: string
}

export function Arrival() {
  const [dataNotSynced, setDataNotSynced] = useState(false)
  const [coordinates, setCoordinates] = useState<LatLng[]>([])
  const [departure, setDeparture] = useState<LocationInfoProps>({} as LocationInfoProps)
  const [arrival, setArrival] = useState<LocationInfoProps | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const route = useRoute();
  const { id } = route.params as ArrivalParams
  const navigation = useNavigation()

  const historic = useObject(Historic, new BSON.UUID(id))
  const realm = useRealm()

  const title = historic?.status === 'departure' ? 'Chegada' : 'Detalhes'

  function handleRemoveVehicleUsage() {
    Alert.alert(
      'Cancelar',
      'Cancelar a utilização do veículo?',
      [
        { text: 'Não', style: 'cancel' },
        { text: 'Sim', onPress: () => removeVehicleUsage()}
      ]
    )
  }

  async function removeVehicleUsage() {
    realm.write(() => {
      realm.delete(historic)
    })

    await stopLocationTask()

    navigation.goBack()
  }

  async function handleArrivalRegister() {
    try {
      if (!historic) {
        Alert.alert('Error', 'Não foi possível obter os dados para registrar a chegada do veículo.')
        return
      }

      const locations = await getStorageLocation();
      
      realm.write(() => {
        historic.status = 'arrival';
        historic.updated_at = new Date();
        historic.coords.push(...locations)
      })

      await stopLocationTask()

      Alert.alert('Chegada', 'Chegada registrada com sucesso.')
      navigation.goBack()
    } catch (error) {
      console.error(error)
      Alert.alert('Error', 'Não foi possível registrar a chegada do veículo.')
    }
  }

  async function getLocationsInfo() {
    if (!historic) {
      return
    }

    const lastSync = await getLastAsyncTimestamp()
    const updatedAt = historic.updated_at.getTime()
    setDataNotSynced(updatedAt > lastSync)

    if (historic?.status === 'departure') {
      const locationsStorage = await getStorageLocation()
      setCoordinates(locationsStorage)
    } else {
      setCoordinates(historic?.coords ?? [])
    }

    if (historic?.coords[0]) {
      const departureStreetName = await getAddressLocation(historic.coords[0])
      setDeparture({
        label: `Saíndo em ${departureStreetName ?? ''}`,
        description: dayjs(historic.coords[0].timestamp).format('DD/MM/YYYY [às] HH:mm')
      })
    }

    if (historic?.status === 'arrival') {
      const lastLocation = historic.coords[historic.coords.length - 1];
      const arrivalStreetName = await getAddressLocation(lastLocation)
      setArrival({
        label: `Chegando em ${arrivalStreetName ?? ''}`,
        description: dayjs(lastLocation.timestamp).format('DD/MM/YYYY [às] HH:mm')
      })
    }

    setIsLoading(false)
  }

  useEffect(() => {
    getLocationsInfo()
  }, [historic])

  if (isLoading) {
    return <Loading />
  }

  return (
    <Container>
      <Header title={title} />

      {
        coordinates && (
          <Map 
            coordinates={coordinates}
          />
        )
      }

      <Content>
        <Locations 
          departure={departure}
          arrival={arrival}
        />
        
        <Label>
          Placa do veículo
        </Label>

        <LicensePlate>
          {historic?.license_plate}
        </LicensePlate>

        <Label>
          Finalidade
        </Label>

        <Description>
          {historic?.description}
        </Description>
      </Content>

      {
        historic?.status === 'departure' && (
          <Footer>
            <ButtonIcon
              icon={X}
              onPress={handleRemoveVehicleUsage}
            />
            <Button
              title="Registrar Chegada"
              onPress={handleArrivalRegister}
            />
          </Footer>
        )
      }

      {
        dataNotSynced && (
          <AsyncMessage>
            Sincronização da { historic?.status === 'departure' ? "partida" : "chegada" } pendente
          </AsyncMessage>
        )
      }
    </Container>
  )
}