import React, { Component } from 'react'
import { View, Text,SafeAreaView,TextInput,TouchableOpacity,FlatList,Dimensions} from 'react-native'
import styles from '../constants/styles';
import User from '../components/User'
import firebase from 'firebase'

export default class ChatScreen extends Component {
    static navigationOptions=({navigation})=>{
        return{
            title:navigation.getParam('name',null)
        }
    }
    constructor(props){
        super(props)
        this.state={
            person:{
                name:props.navigation.getParam('name'),
                phone:props.navigation.getParam('phone')
             },
             textMessage:'',
             messageList:[]
        }
    }
  
    handleChange=key=>val=>{
        this.setState({[key]:val})
    }
    sendMessage=async()=>{
        var database = firebase.database();
        if(this.state.textMessage.length>0){
            let msgId=database.ref('messages').child(User.phone).child(this.state.person.phone).push().key
            // let startedAt=database.ref('messages').push({
            //     startedAt: firebase.database.ServerValue.TIMESTAMP
            //   })
            let updates={}
            let message={
                message:this.state.textMessage,
                time:firebase.database.ServerValue.TIMESTAMP,
                from:User.phone

            }
            updates['messages/'+User.phone+'/'+this.state.person.phone+'/'+msgId]=message
            updates['messages/'+this.state.person.phone+'/'+User.phone+'/'+msgId]=message
            database.ref().update(updates)
            this.setState({textMessage:''})
        }
    }
    //sendMessage=()=>{}
    renderRow=({item})=>{
        
        return(
            <View style={{
                flexDirection:'row',
                width:'60%',
                alignSelf:item.from===User.phone?'flex-end':'flex-start',
                backgroundColor:item.from===User.phone?'#00897b':'#7cb342',
                borderRadius:5,
                marginBotottom:10
            }}>
              <Text style={{color:'#fff',padding:7,fontSize:16}}>{item.message}</Text>
              <Text style={{color:'#eee',padding:3,fontSize:12}}>{this.convertTime(item.time)}</Text>
            </View>
        )
    }
    componentWillMount(){
        var database = firebase.database();
        database.ref('messages').child(User.phone).child(this.state.person.phone).on('child_added',value=>{
            this.setState(prevState=>{
                return{
                    messageList:[...prevState.messageList,value.val()]
                }
            })
        })
    }
    convertTime=time=>{
        let d=new Date(time)
        let c=new Date()
        let result=(d.getHours()<10?'0':'')+d.getHours()+':'
        result+=(d.getMinutes()<10?'0':'')+d.getMinutes()
        if(c.getDay()!==d.getDay()){
            result=d.getDay()+' '+d.getMonth()+' '+result
        }
        return result
    }
    render() {
        let {height,width}=Dimensions.get('window')
        return (
            <SafeAreaView>
                <FlatList 
                //style={{padding:10,height:height+0.8}}
                style={{padding:10,height:300}}
                data={this.state.messageList}
                renderItem={this.renderRow}
                keyExtractor={(item,index)=>index.toString()}
                />
                <View style={{flexDirection:'row',alignItems:'center'}}>
                <TextInput 
                style={styles.input}
                   placeholder='please enter your message'
                   onChangeText={this.handleChange('textMessage')}
                   value={this.state.textMessage}
                />
                <TouchableOpacity
                    style={{ borderBottomColor: '#ccc', padding: 10 }}
                    onPress={this.sendMessage}>
                    <Text style={{ fontSize: 20 }}>
                        send
                </Text>
                </TouchableOpacity>
                </View>
            </SafeAreaView>
        )
    }
}
