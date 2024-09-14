import { useNavigation, useRoute } from "@react-navigation/native";
import { Container, Content, Description, Footer, Label, LicensePlate } from "./styles";
import { Header } from "../../components/Header";
import { Button } from "../../components/Button";
import { ButtonIcon } from "../../components/ButtonIcon";
import { X } from "phosphor-react-native";
import { useObject, useRealm } from "../../libs/realm";
import { Historic } from "../../libs/realm/schemas/Historic";
import { BSON } from "realm";
import { Alert } from "react-native";

export interface ArrivalParams {
  id: string
}

export function Arrival() {
  const route = useRoute();
  const { id } = route.params as ArrivalParams
  const navigation = useNavigation()

  const historic = useObject(Historic, new BSON.UUID(id))
  const realm = useRealm()

  function handleRemoveVehicleUsage() {
    Alert.prompt(
      'Cancelar',
      'Cancelar a utilização do veículo?',
      [
        { text: 'Não', style: 'cancel' },
        { text: 'Sim', onPress: () => removeVehicleUsage()}
      ]
    )
  }

  function removeVehicleUsage() {
    realm.write(() => {
      realm.delete(historic)
    })

    navigation.goBack()
  }

  return (
    <Container>
      <Header title="Chegada" />

      <Content>
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

        <Footer>
          <ButtonIcon
            icon={X}
            onPress={handleRemoveVehicleUsage}
          />
          <Button
            title="Registrar Chegada"
          />
        </Footer>
      </Content>
    </Container>
  )
}