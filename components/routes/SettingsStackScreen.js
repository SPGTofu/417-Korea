import { createStackNavigator } from "@react-navigation/stack";
import SettingsScreen from "../screens/SettingsScreen";
import LoginScreen from "../screens/LoginScreen";
import { useState } from "react";
import {SignPageContext} from "../contexts/SignPageContext";
import AccountSettingsStackScreen from "../routes/AccountSettingsStackScreen";
import Saved from "../screens/Saved";
import SubmitPageStackScreen from "./SubmitPageStackScreen";
import Toast from "react-native-toast-message";
import { handleCreateToast } from "../settings-components/Toast";
import { SettingStackContext } from "../contexts/SettingStackContext"
import ReviewBusinessStackScreen from "./ReviewBusinessStackScreen";
import SubmitBusinessEdit from "../screens/SubmitBusinessEdit";
import ReviewBusinessEditStack from "./ReviewBusinessEditStack";
import { KeyboardAvoidingView, Platform } from "react-native";
import { useTheme } from "@react-navigation/native";

const SettingsStack = createStackNavigator();

export default function SettingStackScreen() {
    const { dark, colors } = useTheme();
    const [signPage, setSignPage] = useState('Login');
    
    const createToastOnSettingStack = (type, message, location) => {
        handleCreateToast(type, message, location);
    }
    
    // provides a context for the following variables
    const signPageData = { signPage, setSignPage };
    const settingContextData = { createToastOnSettingStack };
    
    return (
        <KeyboardAvoidingView
            behavior = {Platform.OS === 'ios' ? 'height' : 'height'}
            style = {{flex: 1}}
        >
            <SettingStackContext.Provider value = {settingContextData}>
                <SignPageContext.Provider value = {signPageData}>
                    <SettingsStack.Navigator    
                        screenOptions = {{
                            headerStyle: { 
                                backgroundColor: dark ? '#121212' : 'white',
                                height: 105,
                            },
                            headerTintColor: dark ? 'white' : 'black',
                        }}
                    >
                        <SettingsStack.Screen 
                            name = "SettingsScreen" 
                            component = {SettingsScreen} 
                            options={{title: 'Settings'}}
                        />
                        <SettingsStack.Screen 
                            name = "SignPage" 
                            component = {LoginScreen} 
                            options={{title: signPage}}
                        />
                        <SettingsStack.Screen 
                            name = "AccountSettingsStackScreen" 
                            component = {AccountSettingsStackScreen} 
                            options={{title: 'Account'}}
                        />
                        <SettingsStack.Screen 
                            name = "SavedBusinesses" 
                            component = {Saved} 
                            options={{title: 'Saved'}}
                        />
                        <SettingsStack.Screen 
                            name = "SubmitPageStack" 
                            component = {SubmitPageStackScreen} 
                            options={{title: 'Submit a Page', headerShown: false}}
                        />
                        <SettingsStack.Screen 
                            name = "SubmitBusinessEdit"
                            component = {SubmitBusinessEdit}
                            options = {{title: 'Suggest an Edit', headerBackTitleVisible: true}}
                        />
                        <SettingsStack.Screen 
                            name = "ReviewBusinessStack"
                            component = {ReviewBusinessStackScreen}
                            options = {{title: 'Review New Businesses', headerShown: false}}
                        />
                        <SettingsStack.Screen 
                            name = "ReviewBusinessEditStack"
                            component = {ReviewBusinessEditStack}
                            options = {{title: 'Review Business Issues', headerShown: false}}
                        />
                    </SettingsStack.Navigator>
                    <Toast />
                </SignPageContext.Provider>
        </SettingStackContext.Provider>
        </KeyboardAvoidingView>
    )
}