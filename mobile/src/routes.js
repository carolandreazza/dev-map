import { createAppContainer } from 'react-navigation'
import { createStackNavigator } from 'react-navigation-stack'

import Main from './pages/Main'
import Profile from './pages/Profile'

const Routes = createAppContainer(
    createStackNavigator({
        Main: {
            screen: Main,
            navigationOptions: {
                title: "DevRadar"
            },
        },
        Profile: {
            screen: Profile,
            navigationOptions: {
                title: "Perfil no Github"
            },
        },
    }, {
        defaultNavigationOptions: { // config aplicadas em todas as telas
            headerTintColor: '#FFF', // cor do texto do cabeçalho
            headerTitleAlign: 'center',
            headerBackTitleVisible: false, // no ios o botão de voltar p/ tela anterior fica com o nome da tela anterior
            headerStyle: {
                backgroundColor: '#7D40E7'
            }
        }
    })
)

export default Routes