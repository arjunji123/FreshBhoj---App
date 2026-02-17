import { Text } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
// components
import AppGradient from '@components/AppGradient'

const Home = () => {
  return (
    <AppGradient
    locations={[0.09, 1.0, 1.0]}
    style={{ flex:1 }}>
      <SafeAreaView>
        <Text>Home</Text>
      </SafeAreaView>
    </AppGradient>
  )
}

export default Home