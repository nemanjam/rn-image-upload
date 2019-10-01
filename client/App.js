import React, {useState} from 'react';
import {StyleSheet, View, Text, Image, Button, Platform} from 'react-native';
import ImagePicker from 'react-native-image-picker';

const App = () => {
  const [photo, setPhoto] = useState(null);

  function createFormData(photo, body) {
    const data = new FormData();

    data.append('photo', {
      name: photo.fileName,
      type: photo.type,
      uri:
        Platform.OS === 'android'
          ? photo.uri
          : photo.uri.replace('file://', ''),
    });

    Object.keys(body).forEach(key => {
      data.append(key, body[key]);
    });

    return data;
  }

  function handleUplaodPhoto() {
    fetch('http://10.0.2.2:5000/api/upload', {
      method: 'POST',
      body: createFormData(photo, {userId: '123'}),
    })
      .then(response => response.json())
      .then(response => {
        console.log('upload success', response);
        alert('Upload success');
        setPhoto(null);
      })
      .catch(error => {
        console.log('upload error', error);
        alert('Upload failed');
      });
  }

  function handleChoosePhoto() {
    const options = {noData: true};
    ImagePicker.launchImageLibrary(options, response => {
      console.log(response);
      if (response.uri) {
        setPhoto(response);
      }
    });
  }

  return (
    <>
      <View style={styles.view}>
        {photo && (
          <>
            <Image source={{uri: photo.uri}} style={styles.image} />
            <Button title="Upload photo" onPress={handleUplaodPhoto}></Button>
          </>
        )}
        <Button title="Choose Photo" onPress={handleChoosePhoto}></Button>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  view: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: 300,
    height: 300,
  },
});

export default App;
