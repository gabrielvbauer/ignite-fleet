import { useState } from 'react';
import { Alert } from 'react-native';
import { GoogleSignin } from '@react-native-google-signin/google-signin'
import { Realm, useApp } from '@realm/react';

import { Container, Title, Slogan } from './styles';

import backgroundImg from '../../assets/background.png'
import { Button } from '../../components/Button';

import { IOS_CLIENT_ID, WEB_CLIENT_ID } from '@env';

GoogleSignin.configure({
  scopes: ['email', 'profile'],
  webClientId: WEB_CLIENT_ID,
  iosClientId: IOS_CLIENT_ID
})

export function SignIn() {
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const app = useApp();

  async function handleGoogleSignIn(){
    try {
      setIsAuthenticating(true)
      const { idToken } = await GoogleSignin.signIn()

      console.log(idToken)
      
      if (!idToken) {
        throw new Error('Token not received')
      }

      const credentials = Realm.Credentials.jwt(idToken)
      console.log(credentials)

      await app.logIn(credentials)
    } catch (error) {
      console.error(error)
      Alert.alert('Entrar', "Não foi possível conectar-se a sua conta google.")
      setIsAuthenticating(false)
    }
  }

  return (
    <Container source={backgroundImg}>
      <Title>Ignite Fleet</Title>

      <Slogan>
        Gestão de uso de veículos
      </Slogan>

      <Button 
        title='Entrar com Google' 
        onPress={handleGoogleSignIn} 
        isLoading={isAuthenticating} 
      />
    </Container>
  );
}
