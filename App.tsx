import React, { useEffect, useState, useRef } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View, Dimensions } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { bundleResourceIO, cameraWithTensors } from '@tensorflow/tfjs-react-native';
import * as tf from '@tensorflow/tfjs';
import DetectionOverlay from './components/DetectionOverlay';


const TensorCamera = cameraWithTensors(CameraView);
const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT } = Dimensions.get('window');

export default function App() {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const [model, setModel] = useState<any>(null);
  const [detections, setDetections] = useState<any[]>([]);
  const rafId = useRef<number | null>(null);

  useEffect(() => {
    (async () => {
      await tf.ready();
      const loadedModel = await tf.loadGraphModel(bundleResourceIO(
        require('./assets/model/yolov8_tfjs_model/model.json'),
        [
          require('./assets/model/yolov8_tfjs_model/group1-shard1of4.bin'),
          require('./assets/model/yolov8_tfjs_model/group1-shard2of4.bin'),
          require('./assets/model/yolov8_tfjs_model/group1-shard3of4.bin'),
          require('./assets/model/yolov8_tfjs_model/group1-shard4of4.bin')
        ]
      ));
      setModel(loadedModel);
      console.log('YOLO model loaded');

    })();
  }, []);

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

  // Convert YOLO output to detection boxes
  const parsePredictions = (predictions: any) => {
    const boxes: any[] = [];

    // Example assumes output shape: [num, 6] => [x, y, w, h, conf, class]
    const data = predictions.arraySync();
    data.forEach((row: number[]) => {
      const [x, y, w, h, conf, cls] = row;
      if (conf > 0.5) {
        boxes.push({
          x: x - w / 2,
          y: y - h / 2,
          width: w,
          height: h,
          label: `Class ${cls}`,
          confidence: conf
        });
      }
    });
    return boxes;
  };

  const handleCameraStream = (images: any) => {
    let frameCount = 0;

    const loop = async () => {
      const nextImageTensor = images.next().value;
      if (model && nextImageTensor && frameCount % 2 === 0) { // process every 2nd frame
        try {
          const resized = tf.image.resizeBilinear(nextImageTensor, [320, 320]);
          const normalized = resized.div(255.0).expandDims(0); // [1, 320, 320, 3]

          const predictionTensor = await model.executeAsync(normalized);
          const parsed = parsePredictions(predictionTensor);

          setDetections(parsed);

          tf.dispose([nextImageTensor, resized, normalized, predictionTensor]);
        } catch (err) {
          console.error("YOLO inference error:", err);
        }
      }

      frameCount++;
      rafId.current = requestAnimationFrame(loop);
    };

    loop();
  };

  const renderMainScreen = () => (
    <View style={styles.container}>
      <Text style={styles.message}>Welcome</Text>
      <TouchableOpacity style={styles.openButton} onPress={() => setIsCameraOpen(true)}>
        <Text style={styles.buttonText}>Open Camera</Text>
      </TouchableOpacity>
    </View>
  );


  const renderCameraScreen = () => (
    <View style={{ flex: 1 }}>
      <TensorCamera
        style={styles.camera}
        facing={facing}
        onReady={handleCameraStream}
        autorender={true}
        resizeWidth={320} // Match YOLO export img size
        resizeHeight={320}
        resizeDepth={3}
        cameraTextureWidth={DEVICE_WIDTH}
        cameraTextureHeight={DEVICE_HEIGHT}
        useCustomShadersToResize={true} />

      <DetectionOverlay detections={detections} width={DEVICE_WIDTH} height={DEVICE_HEIGHT} />
      <View style={styles.cameraControls}>
        <TouchableOpacity style={styles.controlButton} onPress={toggleCameraFacing}>
          <Text style={styles.buttonText}>Flip Camera</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlButton} onPress={() => setIsCameraOpen(false)}>
          <Text style={styles.buttonText}>Close</Text>
        </TouchableOpacity>
      </View>
    </View>
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
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingBottom: 30,
    backgroundColor: 'transparent',
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
  controlButton: { backgroundColor: 'rgba(0,0,0,0.6)', padding: 10, borderRadius: 5 },
});