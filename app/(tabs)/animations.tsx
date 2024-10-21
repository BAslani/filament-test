import * as React from 'react'
import { Alert, Dimensions, StyleSheet, View } from 'react-native'
import {
  FilamentScene,
  FilamentView,
  Camera,
  Model,
  Animator,
  AnimationItem,
  DefaultLight,
  useCameraManipulator,
} from 'react-native-filament'
import { useSharedValue } from 'react-native-worklets-core'
import Axe from '@/assets/Axe.glb'
import { SafeAreaView } from 'react-native-safe-area-context'
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler'

const animationInterpolationTime = 5

function Renderer() {
  const currentAnimationIndex = useSharedValue(0)
  const [animations, setAnimations] = React.useState<AnimationItem[]>([])

  const viewHeight = Dimensions.get('window').height

  const cameraManipulator = useCameraManipulator({
    orbitHomePosition: [3, 0, 5], // camera starting position
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
        <FilamentView style={styles.filamentView}>
          <Camera cameraManipulator={cameraManipulator} />
          <DefaultLight />
          <Model source={Axe} transformToUnitCube>
            <Animator
              animationIndex={currentAnimationIndex}
              transitionDuration={animationInterpolationTime}
              onAnimationsLoaded={setAnimations}
            />
          </Model>
        </FilamentView>
      </GestureDetector>
    </View>
  )
}

export default function AnimationTransitions() {
  return (
    <SafeAreaView style={styles.container}>
      <GestureHandlerRootView>
        <FilamentScene>
          <Renderer />
        </FilamentScene>
      </GestureHandlerRootView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filamentView: {
    flex: 1,
  },
})
