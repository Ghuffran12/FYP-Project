import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useState } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function App() {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [isCameraOpen, setIsCameraOpen] = useState(false);



  if (!permission) {
    // Camera permissions are still loading
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="Grant Permission" />
      </View>
    );
  }

  function toggleCameraFacing() {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  }

  const renderMainScreen = () => (
    <View style={styles.container}>
      <Text style={styles.message}>Welcome</Text>
      <TouchableOpacity style={styles.openButton} onPress={() => setIsCameraOpen(true)}>
        <Text style={styles.buttonText}>Open Camera</Text>
      </TouchableOpacity>
    </View>
  );


  const renderCameraScreen = () => (
    <CameraView style={styles.camera} facing={facing}>
      <View style={styles.cameraControls}>
        <TouchableOpacity style={styles.controlButton} onPress={toggleCameraFacing}>
          <Text style={styles.buttonText}>Flip Camera</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlButton} onPress={() => setIsCameraOpen(false)}>
          <Text style={styles.buttonText}>Close</Text>
        </TouchableOpacity>
      </View>
    </CameraView>
  );

  return isCameraOpen ? renderCameraScreen() : renderMainScreen();
}
const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  message: { fontSize: 18, marginBottom: 20, textAlign: 'center', color: '#304ffe' },
  openButton: { backgroundColor: '#29b6f6', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 8 },
  buttonText: { color: 'white', fontSize: 16 },
  camera: { flex: 1, width: '100%' },
  cameraControls: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    paddingBottom: 30,
    backgroundColor: 'transparent',
  },
  controlButton: { backgroundColor: 'rgba(0,0,0,0.6)', padding: 10, borderRadius: 5 },
});