import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Image, Text, TextInput, TouchableOpacity } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps'
import { requestPermissionsAsync, getCurrentPositionAsync } from 'expo-location'
import { MaterialIcons } from '@expo/vector-icons'

import api from '../services/api'
import { connect, disconnect, subscribeToNewDevs } from '../services/socket'


function Main({ navigation }) {
    //navigation vem por padrão em todas as telas 
    const [devs, setDevs] = useState([])
    const [currentRegion, setCurrentRegion] = useState(null)
    const [techs, setTechs] = useState('')

    useEffect(() => {
        async function loadInitialPosition() {
            const { granted } = await requestPermissionsAsync();

            if(granted) { // se o usuário permitiu usar o gps
                const { coords } = await getCurrentPositionAsync({
                    enableHighAccuracy: true // se o celular estiver sem o gps, passar false aqui pra pegar só a localização do wifi e etc
                })

                const { latitude, longitude } = coords;

                setCurrentRegion({
                    latitude,
                    longitude,
                    latitudeDelta: 0.04, // cálculos navais p/ zoom no mapa
                    longitudeDelta: 0.04,// cálculos navais p/ zoom no mapa
                })
            }
        }
        loadInitialPosition();
    }, [])

    useEffect(() => {
        subscribeToNewDevs(dev => setDevs([...devs, dev]))
    }, [devs])

    function setupWebSocket() {
        disconnect(); //p/ não ter conexões sobrando e etc

        const { latitude, longitude} = currentRegion

        connect(
            latitude,
            longitude,
            techs,
        ) 
    }

    async function loadDevs() {
        const { latitude, longitude } = currentRegion;

        const response = await api.get('/search', {
            params: {
                latitude,
                longitude,
                techs
            }
        })

        setDevs(response.data.devs) // pq retorna um obj e dentro tem o array de devs
        setupWebSocket() 
    }

    function handleRegionChanged(region){
       // console.log(region) // vai no chrome, clica no aparelho q tu tá testando, e movimenta o mapa. quando parar vai dar a latitude e etc
        setCurrentRegion(region)
    }

    if(!currentRegion) {
        return null
    }

    return (
        <>
            <MapView onRegionChangeComplete={handleRegionChanged} initialRegion={currentRegion} style={styles.map}>
                {devs.map(dev => (
                    <Marker key={dev._id} coordinate={{ longitude: dev.location.coordinates[0], latitude: dev.location.coordinates[1]}}>
                    <Image style={styles.avatar} source={{ uri: dev.avatar_url}}/>
                    <Callout onPress={() => {
                        navigation.navigate('Profile', { github_username: dev.github_username })
                    }}>
                        <View style={styles.callout}>
                            <Text style={styles.devName}>{dev.name}</Text>
                            <Text style={styles.devBio}>{dev.bio}</Text>
                            <Text style={styles.devTechs}>{dev.techs.join(', ')}</Text>
                        </View>
                    </Callout>
                </Marker>
                ))}
            </MapView>
            <View style={styles.searchForm}>
                <TextInput 
                    style={styles.seachInput}
                    placeholder="Buscar devs por techs..."
                    autoCapitalize="words"
                    autoCorrect={false}
                    value={techs}
                    onChangeText={setTechs}
                />
                <TouchableOpacity onPress={loadDevs} style={styles.loadButton}>
                    <MaterialIcons name="my-location" size={20} color="#FFF"/>
                </TouchableOpacity>
            </View>
        </>
    )
}

const styles = StyleSheet.create({
    map: {
        flex: 1
    },
    avatar: {
        width: 54,
        height: 54,
        borderRadius: 4,
        borderWidth: 4,
        borderColor: '#FFF'
    },
    callout: {
        width: 260,
    },
    devName: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    devBio: {
        color: '#666',
        fontSize: 10,
    },
    devTechs: {
        marginTop: 5, 
    },
    searchForm: {
        position: 'absolute', // p/ ficar em cima do mapa
        top: 20,
        left: 20,
        right: 20,
        zIndex: 5, // p/ forçar ficar em cima do mapa
        flexDirection: 'row',
    },
    seachInput: {
        flex: 1,
        height: 50,
        backgroundColor: '#FFF',
        color: '#333',
        borderRadius: 25,
        paddingHorizontal: 20,
        fontSize: 16,
        shadowColor: '#000', // ios
        shadowOpacity: 0.2, // ios
        shadowOffset: { // ios
            width: 4,
            height: 4,
        },
        elevation: 2, // android
    },
    loadButton: {
        width: 50,
        height: 50,
        backgroundColor: '#8E4Dff',
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 15,
    },
})

export default Main;