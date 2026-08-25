import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  Image,
  TextInput,
  Modal,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';

export default function App() {
  const [posts, setPosts] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [description, setDescription] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      await Location.requestForegroundPermissionsAsync();
      await ImagePicker.requestCameraPermissionsAsync();
    })();
  }, []);

  const handleTakePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handlePublish = async () => {
    if (!imageUri) {
      Alert.alert('Atenção', 'Tire uma foto do item encontrado.');
      return;
    }
    if (!description.trim()) {
      Alert.alert('Atenção', 'Descreva brevemente o item achado.');
      return;
    }

    setLoading(true);
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const newPost = {
        id: Date.now().toString(),
        image: imageUri,
        text: description,
        latitude: location.coords.latitude.toFixed(5),
        longitude: location.coords.longitude.toFixed(5),
        date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setPosts([newPost, ...posts]);
      setImageUri(null);
      setDescription('');
      setModalVisible(false);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível capturar a localização.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Achados na Rua 📦</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.addButtonText}>+ Postar</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Nenhum achado registrado ainda. Seja o primeiro!</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image source={{ uri: item.image }} style={styles.cardImage} />
            <View style={styles.cardBody}>
              <Text style={styles.cardText}>{item.text}</Text>
              <Text style={styles.cardLocation}>
                📍 Lat: {item.latitude}, Long: {item.longitude} • {item.date}
              </Text>
            </View>
          </View>
        )}
      />

      <Modal visible={modalVisible} animationType="slide" transparent={false}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Novo Achado</Text>

          <TouchableOpacity style={styles.cameraBox} onPress={handleTakePhoto}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.previewImage} />
            ) : (
              <Text style={styles.cameraBoxText}>📸 Toque para tirar foto</Text>
            )}
          </TouchableOpacity>

          <TextInput
            placeholder="Ex: Sofá retrô em bom estado na calçada..."
            style={styles.input}
            value={description}
            onChangeText={setDescription}
            multiline
          />

          {loading ? (
            <ActivityIndicator size="large" color="#007AFF" />
          ) : (
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.btn, styles.btnCancel]}
                onPress={() => {
                  setImageUri(null);
                  setDescription('');
                  setModalVisible(false);
                }}
              >
                <Text style={styles.btnText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.btn, styles.btnPublish]}
                onPress={handlePublish}
              >
                <Text style={[styles.btnText, styles.btnTextWhite]}>Publicar</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f4f4', paddingTop: 50 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#222' },
  addButton: { backgroundColor: '#10B981', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 8 },
  addButtonText: { color: '#fff', fontWeight: 'bold' },
  listContainer: { padding: 15 },
  emptyText: { textAlign: 'center', marginTop: 40, color: '#888' },
  card: { backgroundColor: '#fff', borderRadius: 12, marginBottom: 15, overflow: 'hidden', elevation: 3 },
  cardImage: { width: '100%', height: 220, resizeMode: 'cover' },
  cardBody: { padding: 15 },
  cardText: { fontSize: 16, color: '#333', fontWeight: '500', marginBottom: 6 },
  cardLocation: { fontSize: 12, color: '#777' },
  modalContainer: { flex: 1, padding: 20, paddingTop: 60, backgroundColor: '#fff' },
  modalTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  cameraBox: {
    width: '100%',
    height: 250,
    backgroundColor: '#eee',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    overflow: 'hidden',
  },
  cameraBoxText: { color: '#666', fontSize: 16, fontWeight: 'bold' },
  previewImage: { width: '100%', height: '100%' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    height: 80,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  modalActions: { flexDirection: 'row', justifyContent: 'space-between' },
  btn: { flex: 1, paddingVertical: 14, borderRadius: 8, alignItems: 'center' },
  btnCancel: { backgroundColor: '#e5e7eb', marginRight: 10 },
  btnPublish: { backgroundColor: '#10B981', marginLeft: 10 },
  btnText: { fontWeight: 'bold', fontSize: 16, color: '#333' },
  btnTextWhite: { color: '#fff' },
});
