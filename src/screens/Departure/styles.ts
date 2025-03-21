import styled from "styled-components/native";

export const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.COLORS.GRAY_800};
`

export const Content = styled.View`
  flex: 1;
  gap: 16px;
  padding: 32px;
  margin-top: 16px;
`

export const Message = styled.Text`
  color: ${({ theme }) => theme.COLORS.GRAY_800}; 
  font-size: ${({ theme }) => theme.FONT_SIZE.LG}px; 
  font-family: ${({ theme }) => theme.FONT_FAMILY.REGULAR}; 
  text-align: center;
  margin-bottom: 44px;
`

export const MessageContent = styled.View`
  flex: 1;
  justify-content: center;
  padding: 24px;
`