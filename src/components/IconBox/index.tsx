import { Container, SizeProps } from "./styles";
import { IconBoxProps } from "../ButtonIcon";
import { useTheme } from "styled-components/native";

type Props = {
  size?: SizeProps,
  icon: IconBoxProps
}

export function IconBox({ size = 'NORMAL', icon: Icon }: Props) {
  const theme = useTheme()
  const iconSize = size === 'NORMAL' ? 24 : 16

  return (
    <Container size={size}>
      <Icon 
        size={iconSize}
        color={theme.COLORS.BRAND_LIGHT}
      />
    </Container>
  )
}