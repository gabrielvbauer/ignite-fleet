import { Container, Content, Label, Title } from './styles';

import { HomeHeader } from '../../components/HomeHeader';
import { CarStatus } from '../../components/CarStatus';
import { useNavigation } from '@react-navigation/native';
import { useQuery, useRealm } from '../../libs/realm';
import { Historic } from '../../libs/realm/schemas/Historic';
import { useEffect, useState } from 'react';
import { Alert, FlatList } from 'react-native';
import { HistoricCard, HistoricCardProps } from '../../components/HistoricCard';
import dayjs from 'dayjs';

export function Home() {
  const [vehicleInUse, setVehicleInUse] = useState<Historic | null>(null)
  const [vehicleHistoric, setVehicleHistoric] = useState<HistoricCardProps[]>([])
  const navigation = useNavigation();

  const realm = useRealm()
  const historic = useQuery(Historic);

  function handleRegisterMovement() {
    if (vehicleInUse?._id) {
      navigation.navigate('arrival', {
        id: vehicleInUse._id.toString()
      })
    } else {
      navigation.navigate('departure')
    }
  }

  function handleFetchVehicleInUse() {
    try {
      const vehicle = historic.filtered("status = 'departure'")[0]
      setVehicleInUse(vehicle)
    } catch (error) {
      Alert.alert('Veículo em uso', 'Não foi possível carregar o veículo em uso.')
      console.error(error)
    }
  }

  function handleFetchHistoric() {
    try {
      
    } catch (error) {
      console.log(error)
      Alert.alert('Histórico', 'Não foi possível carregar o histórico.')
    }
    const response = historic.filtered("status = 'arrival' SORT(created_at DESC)")
    const formattedHistoric = response.map(item => {
      return ({
        id: item._id.toString(),
        licensePlate: item.license_plate,
        isSync: false,
        created: dayjs(item.created_at).format('[Saída em] DD/MM/YYYY [às] HH:mm')
      })
    })

    setVehicleHistoric(formattedHistoric)
  }

  function handleHistoricDetails(id: string) {
    navigation.navigate('arrival', { id })
  }

  useEffect(() => {
    handleFetchVehicleInUse()
  }, [])

  useEffect(() => {
    realm.addListener('change', () => handleFetchVehicleInUse())

    return () => {
      if (realm && !realm.isClosed) {
        realm.removeListener('change', handleFetchVehicleInUse)
      }
    }
  }, [])

  useEffect(() => {
    handleFetchHistoric()
  }, [historic])

  return (
    <Container>
      <HomeHeader />
      <Content>
        <CarStatus
          licensePlate={vehicleInUse?.license_plate}
          onPress={handleRegisterMovement}
        />

        <Title>
          Histórico
        </Title>

        <FlatList
          data={vehicleHistoric}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
              <HistoricCard 
                data={item}
                onPress={() => handleHistoricDetails(item.id)}
              />
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
          ListEmptyComponent={(
            <Label>
              Nenhum veículo utilizado.
            </Label>
          )}
        />
      </Content>
    </Container>
  );
}