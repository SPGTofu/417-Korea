import { createStackNavigator } from '@react-navigation/stack';
import React from 'react'
import { StyleSheet } from 'react-native'
import DeleteAccountScreen from '../screens/account-screens/DeleteAccountScreen';
import AccountSettingsPage from '../screens/account-screens/AccountSettingsPage';

const AccountSettingsStack = createStackNavigator();

export default function AccountSettings() {
    return (
        <AccountSettingsStack.Navigator
            screenOptions = {{
                headerShown: false
            }}
        >
            <AccountSettingsStack.Screen 
                name = "AccountSettings"
                component = {AccountSettingsPage}
                options = {{
                    title: 'Account'
                }}
            />
            <AccountSettingsStack.Screen 
                name = "DeleteAccount"
                component = {DeleteAccountScreen}
                options = {{
                    title: 'Delete Account'
                }}
            />
        </AccountSettingsStack.Navigator>
    )
}

const styles = StyleSheet.create({
    comingSoonText: {
        fontSize: 20,
        margin: 20,
        fontWeight: 500
    },
    container: {
        justifyContent: 'center',
        alignItems: 'center'
    }
})