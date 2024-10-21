import React from 'react'
import {
  FilamentScene,
  FilamentView,
  DefaultLight,
  Model,
  Camera,
  useCameraManipulator,
} from 'react-native-filament'
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler'
import { Dimensions, StyleSheet, View } from 'react-native'
import { useSharedValue } from 'react-native-worklets-core'
import Geralt from '@/assets/Geralt.glb'

export default function Home() {
  return (
    <GestureHandlerRootView>
      <FilamentScene>
        <Render />
      </FilamentScene>
    </GestureHandlerRootView>
  )
}

function Render() {
  const viewHeight = Dimensions.get('window').height

  const cameraManipulator = useCameraManipulator({
    orbitHomePosition: [0, 0, 8], // camera starting position
    targetPosition: [0, 0, 0], // Where the camera looks
    orbitSpeed: [0.003, 0.003], // Speed of orbiting movement
  })

  const panGesture = Gesture.Pan()
    .onBegin((event) => {
      const yCorrected = viewHeight - event.translationY
      cameraManipulator?.grabBegin(event.translationX, yCorrected, false) // false means rotation
    })
    .onUpdate((event) => {
      const yCorrected = viewHeight - event.translationY
      cameraManipulator?.grabUpdate(event.translationX, yCorrected)
    })
    .maxPointers(1)
    .onEnd(() => {
      cameraManipulator?.grabEnd()
    })

  const previousScale = useSharedValue(1)
  const scaleMultiplier = 100
  const pinchGesture = Gesture.Pinch()
    .onBegin(({ scale }) => {
      previousScale.value = scale
    })
    .onUpdate(({ scale, focalX, focalY }) => {
      const delta = scale - previousScale.value
      cameraManipulator?.scroll(focalX, focalY, -delta * scaleMultiplier)
      previousScale.value = scale
    })

  // Combine pinch and pan gestures
  const combinedGesture = Gesture.Race(pinchGesture, panGesture)

  return (
    <View style={styles.container}>
      <GestureDetector gesture={combinedGesture}>
        <FilamentView style={styles.container}>
          <Camera cameraManipulator={cameraManipulator} />
          <DefaultLight />
          <Model source={Geralt} transformToUnitCube />
        </FilamentView>
      </GestureDetector>
    </View>
  )
}

// Styling for the container
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})
