import { Car, Key } from "phosphor-react-native"
import { TouchableOpacityProps } from 'react-native'

import { Container, IconBox, Message, TextHighlight } from "./style"
import { useTheme } from "styled-components"

type Props = TouchableOpacityProps & {
  licensePlate?: string
}

export function CarStatus({ licensePlate, ...rest }: Props) {
  const theme = useTheme()

  const Icon = licensePlate ? Car : Key;
  const message = licensePlate
    ? `Veículo ${licensePlate} em uso.`
    : `Nenhum veículo em uso.`;
  const status = licensePlate
    ? 'chegada'
    : 'saída'

  return (
    <Container {...rest}>
      <IconBox>
        <Icon size={32} color={theme.COLORS.BRAND_LIGHT} />
      </IconBox>

      <Message>
        {message}

        <TextHighlight>
          Clique aqui para registar a {status}
        </TextHighlight>
      </Message>
    </Container>
  )
}