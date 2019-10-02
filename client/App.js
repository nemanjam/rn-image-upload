import React, {useState} from 'react';
import {StyleSheet, ScrollView, Image, Platform, Clipboard} from 'react-native';
import RNFS from 'react-native-fs';

import {
  Container,
  Header,
  Title,
  Content,
  Footer,
  FooterTab,
  Left,
  Right,
  Button,
  Text,
  Body,
  Icon,
  Toast,
  Root,
  Spinner,
} from 'native-base';

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
      // 'http://10.0.2.2:5000/api/upload',
      'https://sr7.herokuapp.com/api/upload',
      {method: 'POST', body: createFormData(photo, {userId: '123'})},
      event => {
        const _progress = Math.floor(event.loaded / event.total) * 100;
        setProgress(_progress);
      },
    )
      .then(_response => {
        const response = JSON.parse(_response);
        const _url = response.url;
        setUrl(_url);
        Clipboard.setString(_url);
        /*
        RNFS.unlink(photo.path)
          .then(() => {
            console.log('FILE DELETED');
          })
          .catch(err => {
            console.log(err.message);
          });
*/
        setPhoto(null);
        setProgress(0);
        // alert('Url is in the clipboard.');
        Toast.show({
          text: `Url is in the clipboard. Url: ${_url}`,
          textStyle: {fontSize: 13},
          buttonText: 'Ok',
          type: 'success',
          duration: 3000,
        });
      })
      .catch(error => {
        setProgress(0);
        console.log(error);
        //alert(error);
        Toast.show({
          text: `Error! ${error}`,
          textStyle: {fontSize: 13},
          buttonText: 'Okay',
          type: 'danger',
          duration: 5000,
        });
      });
  }
  // adb shell input keyevent 82
  function handleChoosePhoto() {
    setUrl(null);
    const options = {
      noData: true,
      maxWidth: 2000,
      mediaType: 'photo',
      storageOptions: {waitUntilSaved: true},
    };
    ImagePicker.showImagePicker(options, response => {
      console.log(response);
      if (response.customButton) {
        console.log('User tapped custom button: ', response.customButton);
      }
      if (response.uri) {
        setPhoto(response);
      }
    });
  }

  return (
    <>
      <Root>
        <ScrollView>
          <Container>
            <Header>
              <Body>
                <Title>Upload Image</Title>
              </Body>
              <Right />
            </Header>
            <Content contentContainerStyle={styles.container}>
              {progress !== 0 && (
                <Spinner style={styles.spinner} color="blue" />
              )}
              {photo && (
                <>
                  <Image source={{uri: photo.uri}} style={styles.image} />
                  <Text>Progress: {progress}%</Text>
                  <Button
                    primary
                    onPress={handleUplaodPhoto}
                    disabled={progress !== 0}>
                    <Icon name="cloud-upload" />
                    <Text>Upload photo</Text>
                  </Button>
                </>
              )}
              <Button
                primary
                onPress={handleChoosePhoto}
                disabled={progress !== 0}>
                <Icon name="camera" />
                <Text>{!photo ? 'Choose Photo' : 'Choose Another Photo'}</Text>
              </Button>
            </Content>
          </Container>
        </ScrollView>
      </Root>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },
  spinner: {
    position: 'absolute',
    zIndex: 1000,
    top: '25%',
    left: '45%',
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
