import React, { Component } from 'react';
import { Dimensions, View, ScrollView, Text, Image, TextInput, TouchableOpacity, ToastAndroid } from 'react-native'

class AJs extends Component {
    render() {
        return (
              () => {
              {
                allAddress?.length ? allAddress.map(addres => <View key={addres._id} style={{
                  alignSelf: 'center',
                  alignItems: 'center',
                  borderWidth: 1,
                  width: '30%'
                }}>
                  <Text>پلاک:{addres.floor}</Text>
                  <Text>طبقه:{addres.plaque}</Text>
                  <Text>{addres.formattedAddress?.split(",")[0] + addres.formattedAddress?.split(",")[1]}</Text>
                </View>) : <></>;
    }
  }
        );
    }
}

export default AJs;