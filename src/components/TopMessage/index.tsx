import { useTheme } from "styled-components/native";
import { IconBox } from "../ButtonIcon";
import { Container, Title } from "./styles";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = {
  icon?: IconBox
  title: string
}

export function TopMessage({ title, icon: Icon }: Props) {
  const theme = useTheme()
  const insets = useSafeAreaInsets();

  const paddingTop = insets.top + 5;

  return (
    <Container style={{ paddingTop }}>
      {
        Icon && 
        <Icon size={18} color={theme.COLORS.GRAY_100} />
      }

      <Title>
        {title}
      </Title>
    </Container>
  )
}