import React, {useState} from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  Button,
  Platform,
  Clipboard,
} from 'react-native';
import ImagePicker from 'react-native-image-picker';

const App = () => {
  const [photo, setPhoto] = useState(null);
  const [progress, setProgress] = useState(0);
  const [url, setUrl] = useState(null);

  function uploadFileWithProgress(url, opts = {}, onProgress) {
    return new Promise((res, rej) => {
      const xhr = new XMLHttpRequest();
      xhr.open(opts.method || 'get', url);

      Object.keys(opts.headers || {}).forEach(value => {
        xhr.setRequestHeader(value, opts.headers[value]);
      });

      if (xhr.upload && onProgress) {
        xhr.upload.onprogress = onProgress;
      }

      xhr.timeout = 10 * 1000;
      xhr.ontimeout = rej;

      xhr.onload = e => {
        res(e.target.response);
      };
      xhr.onerror = rej;
      xhr.send(opts.body);
    });
  }

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
    uploadFileWithProgress(
      'http://10.0.2.2:5000/api/upload',
      {method: 'POST', body: createFormData(photo, {userId: '123'})},
      event => {
        const _progress = Math.floor(event.loaded / event.total) * 100;
        setProgress(_progress);
      },
    )
      .then(_response => {
        const response = JSON.parse(_response);
        setUrl(response.url);
        Clipboard.setString(response.url);
        setPhoto(null);
        setProgress(0);
        alert('Url is in the clipboard.');
      })
      .catch(error => {
        alert(JSON.stringify(error, null, 2));
      });
  }

  function handleChoosePhoto() {
    setUrl(null);
    const options = {noData: true, maxWidth: 2000};
    ImagePicker.showImagePicker(options, response => {
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
            <Text>Progress: {progress}%</Text>
            <Button title="Upload photo" onPress={handleUplaodPhoto}></Button>
          </>
        )}
        {url && (
          <>
            <Text>Url: {url}</Text>
          </>
        )}
        <Button
          title={!url ? 'Choose Photo' : 'Choose Another Photo'}
          onPress={handleChoosePhoto}></Button>
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

/*
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
      */
