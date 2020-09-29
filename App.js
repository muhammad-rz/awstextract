import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Image,
  TouchableHighlight,
  ActivityIndicator,
  Alert,
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
        name: 'awstextract', //your api name
        endpoint:
          'https://tpnbxe7j5i.execute-api.ap-southeast-1.amazonaws.com/dev', //Your Endpoint URL
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
      detectedText: '',
      isLoading: false,
    };
  }

  async componentDidMount() {
    this.getCameraRollPermissionAsync();
    this.getCameraPermissionAsync();
  }

  // Request permistion to device for ios
  getCameraRollPermissionAsync = async () => {
    if (Constants.platform.ios) {
      const { status } = await Permission.askAsync(Permission.CAMERA_ROLL);
      if (status !== 'granted') {
        alert('Sorry, the app need camera roll permissions');
      }
    }
  };

  // Request permision to use camera
  getCameraPermissionAsync = async () => {
    const { status } = await Permission.askAsync(Permission.CAMERA);
    if (status !== 'granted') {
      alert('Sorry, the app need camera permissions');
    }
  };

  // Handling load image from galery button
  captureImageButtonHandler = async () => {
    this.setState({
      detectedText: '',
    });
    try {
      //let response = await ImagePicker.launchImageLibraryAsync({
      let response = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
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
      //console.log(this.state.base64String);
      //console.log(this.state.capturedImage);
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
      this.setState({
        isLoading: true,
      });
      const apiName = 'awstextract';
      const path = '/';
      const init = {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/x-amz-json-1.1',
        },
        body: JSON.stringify({
          Image: this.state.base64String,
          name: 'textractImage.jpg',
        }),
      };

      API.post(apiName, path, init).then((response) => {
        if (response) {
          let data = JSON.stringify(response);
          //let data = JSON.parse(response);
          //let data = JSON.parse(dataRes);
          let extractedText = data;
          // dataRes.forEach((obj) => {
          //   Object.entries(obj).forEach(([key, value]) => {
          //     if (key == 'BlockType' && value == 'LINE') {
          //       extractedText += obj.Text + '\n';
          //       console.log(obj.Text);
          //     }
          //   });
          // });
          // if (JSON.stringify(response) !== '') {
          //   var json = JSON.parse(JSON.stringify(response));
          //   let extractedText = '';
          //   let blockTypeArray = json.Blocks;
          //   console.log();
          //   // for (let item = 0; item < blockTypeArray.lenght; item++) {
          //   //   if (item['BlockType'] == 'LINE') {
          //   //     console.log(item);
          //   //   }
          //   // }
          //   // for (let item of json['Blocks']) {
          //   //   if (item['BlockType'] === 'LINE') {
          //   //     extractedText += item['Text'] + '\n';
          //   //   }
          //   // }
          // Using Map()
          // data.map((dataItem) => {
          //   if (dataItem.BlockType == 'LINE') {
          //     extractedText += dataItem.Text + '\n';
          //   }
          // });
          console.log(extractedText);

          this.setState({
            isLoading: false,
            detectedText: extractedText,
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
      <View style={styles.container}>
        <Text
          style={{
            fontSize: 20,
            color: '#000',
            textAlign: 'center',
            marginBottom: 15,
            marginTop: 10,
          }}
        >
          Text Extract
        </Text>
        {this.state.capturedImage !== '' && (
          <View style={styles.imageholder}>
            <Image
              source={{ uri: this.state.capturedImage }}
              style={styles.previewImage}
            />
          </View>
        )}
        <ActivityIndicator animating={this.state.isLoading} size='small' />
        {this.state.detectedText
          ? Alert.alert(
              'Detected Text',
              this.state.detectedText,
              [
                {
                  text: 'Ok',
                  onPress: () =>
                    this.setState({
                      capturedImage: '',
                      detectedText: '',
                    }),
                },
              ],
              { cancelable: false }
            )
          : // <TextInput
            //   underlineColorAndroid='transparent'
            //   style={styles.TextInputStyleClass}
            //   value={this.state.detectedText}
            // />
            null}
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
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  TextInputStyleClass: {
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 7,
    height: 40,
    borderWidth: 1,
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
    width: '50%',
    borderRadius: 30,
    marginTop: 20,
    marginLeft: 5,
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
  captureButton: {
    elevation: 8,
    backgroundColor: '#337ab7',
    width: 250,
  },
  submitButton: {
    elevation: 8,
    backgroundColor: 'green',
    width: 250,
    marginTop: 5,
  },
  imageholder: {
    borderWidth: 1,
    borderColor: 'grey',
    backgroundColor: '#eee',
    width: '50%',
    height: 150,
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
});

export default App;
