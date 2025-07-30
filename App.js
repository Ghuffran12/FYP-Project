import React, { useState } from 'react';
import { StyleSheet, Text, View, ToastAndroid, TouchableOpacity, Button } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons, FontAwesome, Entypo, Feather } from '@expo/vector-icons';

export default function App() {
  const [activeTab, setActiveTab] = useState(null);
  const [message, setMessage] = useState('');

  const showToast = (msg) => {
    ToastAndroid.show(msg, ToastAndroid.SHORT);
  };

  // Simulate HTTPS request
  const fakeHttpRequest = () => {
    showToast("Fetching camera instruction...");
    setTimeout(() => {
      setMessage(" Please turn on your camera");
      showToast("Camera message loaded");
    }, 1500);
  };

  const handleTabPress = (tabName) => {
    if (activeTab === tabName) {
      setActiveTab(null);
    } else {
      setActiveTab(tabName);
      showToast(`${tabName} opened`);

      if (tabName === 'mic') {
        fakeHttpRequest();
      } else {
        setMessage('');
      }
    }
  };

  const renderMainScreen = () => (
    <>
      <Text style={styles.text}>Hello to the App</Text>
      <StatusBar style="auto" />
      <TouchableOpacity style={styles.button} onPress={() => showToast("Front Camera View")}>
        <Text style={{ color: "#fff" }}>Click On Button</Text>
      </TouchableOpacity>
      <View style={{ marginTop: 20 }}>
        <Button title="Camera" onPress={() => showToast("Please turn on flashlight")} />
      </View>
    </>
  );

  const renderTabScreen = () => {
    let label = '';
    if (activeTab === 'profile') label = '👤 Profile Screen';
    else if (activeTab === 'chat') label = '💬 Chat Screen';
    else if (activeTab === 'mic') label = message || '🎤 Mic Screen';
    else if (activeTab === 'location') label = '📍 Location Screen';

    return <Text style={styles.text}>{label}</Text>;
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {activeTab ? renderTabScreen() : renderMainScreen()}
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={[styles.iconButton, activeTab === 'profile' && styles.activeIcon]}
          onPress={() => handleTabPress('profile')}
        >
          <FontAwesome name="user" size={24} color="white" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.iconButton, activeTab === 'chat' && styles.activeIcon]}
          onPress={() => handleTabPress('chat')}
        >
          <Entypo name="chat" size={24} color="white" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.iconButton, activeTab === 'mic' && styles.activeIcon]}
          onPress={() => handleTabPress('mic')}
        >
          <Feather name="mic" size={24} color="white" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.iconButton, activeTab === 'location' && styles.activeIcon]}
          onPress={() => handleTabPress('location')}
        >
          <MaterialIcons name="location-on" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 80,
  },
  text: {
    color: "#304ffe",
    fontSize: 20,
    padding: 20,
    textAlign: 'center',
  },
  button: {
    borderRadius: 10,
    backgroundColor: "#29b6f6",
    width: 150,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  bottomNav: {
    height: 70,
    backgroundColor: '#29b6f6',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  iconButton: {
    padding: 10,
    borderRadius: 30,
  },
  activeIcon: {
    backgroundColor: 'red',
  },
});
