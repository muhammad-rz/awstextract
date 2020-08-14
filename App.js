import { StatusBar } from 'expo-status-bar';
import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Image,
  ScrollView,
  TouchableHighlight,
} from 'react-native';
import Amplify, { API } from 'aws-amplify';
import * as ImagePicker from 'expo-image-picker';
import * as Permission from 'expo-permissions';
import Constants from 'expo-constants';

// Amplify configuration for API-Gateway
Amplify.configure({
  API: {
    endpoints: [
      {
        name: 'awsrekog', //your api name
        endpoint:
          'https://mv024sjja3.execute-api.ap-southeast-1.amazonaws.com/dev', //Your Endpoint URL
      },
    ],
  },
});

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      image: '',
      capturedImage: '',
      objectName: '',
    };
  }

  componentDidMount() {
    this.getPermissionAsync();
  }

  // Request permistion to device for ios
  getPermissionAsync = async () => {
    if (Constants.platform.ios) {
      const { status } = await Permission.askAsync(Permission.CAMERA_ROLL);
      if (status !== 'granted') {
        alert('Sorry, the app need camera roll permissions');
      }
    }
  };

  // Handling load image from galery button
  captureImageButtonHandler = async () => {
    this.setState({
      objectName: '',
    });
    try {
      let response = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
        base64: true,
      });
      if (!response.cancelled) {
        // const source = {
        //   uri: 'data:image/jpeg;base64,' + response.data,
        // };
        this.setState({
          capturedImage: response.uri,
          base64String: response.base64,
        });
      }
      //console.log(response);
      console.log(this.state.base64String);
      console.log(this.state.capturedImage);
    } catch (err) {
      console.log(err);
    }
  };

  // this method triggers when you click submit. If the image is valid then It will send the image to API Gateway.
  submitButtonHandler = () => {
    if (
      this.state.capturedImage == '' ||
      this.state.capturedImage == undefined ||
      this.state.capturedImage == null
    ) {
      alert('Please Capture the Image');
    } else {
      const apiName = 'awsrekog';
      const path = '/';
      const init = {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/x-amz-json-1.1',
        },
        body: JSON.stringify({
          Image: this.state.base64String,
          name: 'storeImage.jpg',
        }),
      };

      API.post(apiName, path, init).then((response) => {
        if (JSON.stringify(response.Labels.length) > 0) {
          this.setState({
            objectName: response.Labels[0].Name,
          });
        } else {
          alert('Please Try Again.');
        }
      });
    }
  };

  render() {
    if (this.state.image !== '') {
    }
    return (
      <View style={styles.MainContainer}>
        <ScrollView>
          <Text
            style={{
              fontSize: 20,
              color: '#000',
              textAlign: 'center',
              marginBottom: 15,
              marginTop: 10,
            }}
          >
            Capture Image
          </Text>
          {this.state.capturedImage !== '' && (
            <View style={styles.imageholder}>
              <Image
                source={{ uri: this.state.capturedImage }}
                style={styles.previewImage}
              />
            </View>
          )}
          {this.state.objectName ? (
            <TextInput
              underlineColorAndroid='transparent'
              style={styles.TextInputStyleClass}
              value={this.state.objectName}
            />
          ) : null}
          <TouchableHighlight
            style={[styles.buttonContainer, styles.captureButton]}
            onPress={this.captureImageButtonHandler}
          >
            <Text style={styles.buttonText}>Capture Image</Text>
          </TouchableHighlight>

          <TouchableHighlight
            style={[styles.buttonContainer, styles.submitButton]}
            onPress={this.submitButtonHandler}
          >
            <Text style={styles.buttonText}>Submit</Text>
          </TouchableHighlight>
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  TextInputStyleClass: {
    textAlign: 'center',
    marginBottom: 7,
    height: 40,
    borderWidth: 1,
    marginLeft: 90,
    width: '50%',
    justifyContent: 'center',
    borderColor: '#D0D0D0',
    borderRadius: 5,
  },
  inputContainer: {
    borderBottomColor: '#F5FCFF',
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    borderBottomWidth: 1,
    width: 300,
    height: 45,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonContainer: {
    height: 45,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    width: '80%',
    borderRadius: 30,
    marginTop: 20,
    marginLeft: 5,
  },
  captureButton: {
    backgroundColor: '#337ab7',
    width: 350,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  horizontal: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
  },
  submitButton: {
    backgroundColor: '#C0C0C0',
    width: 350,
    marginTop: 5,
  },
  imageholder: {
    borderWidth: 1,
    borderColor: 'grey',
    backgroundColor: '#eee',
    width: '50%',
    height: 150,
    marginTop: 10,
    marginLeft: 90,
    flexDirection: 'row',
    alignItems: 'center',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
});

export default App;
