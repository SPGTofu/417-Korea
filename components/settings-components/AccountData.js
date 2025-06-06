import { View, Text, TouchableOpacity, StyleSheet, Touchable } from 'react-native';
import React, { useContext, useEffect, useState } from 'react';
import { UserContext } from '../contexts/UserContext';
import { useTheme } from '@react-navigation/native';
import { checkIfUserIsAdmin } from '../dbcalls';
import { getAuth } from 'firebase/auth';

export default function AccountData({ navigation }) {
    const { user } = useContext(UserContext);
    const { colors } = useTheme();
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(()=> {
        const fetchAdminStatus = async () => {
            const adminStatus = await checkIfUserIsAdmin(user);
            setIsAdmin(adminStatus);
        };
        if (user) fetchAdminStatus();
        console.log('useEffect in AccountData Active');
    }, [user])

    return (
        <View style = {styles.container}>
            <View style = {[{borderColor: colors.text, borderTopWidth: 1}, styles.button]}>
                <TouchableOpacity onPress = {() => navigation.navigate('AccountSettingsStackScreen')}>
                    <Text style = {[{color: colors.text}, styles.text]}>Account</Text>
                </TouchableOpacity>
            </View>
            <View style = {[{borderBottomWidth: 1, borderBottomColor: colors.text}, styles.button]}>
                <TouchableOpacity onPress = {() => navigation.navigate('SavedBusinesses')}>
                    <Text style = {[{color: colors.text}, styles.text]}>Saved</Text>
                </TouchableOpacity>
            </View>
            <View style = {[{borderBottomWidth: 1, borderBottomColor: colors.text}, styles.button]}>
                <TouchableOpacity onPress = {() => navigation.navigate('SubmitPageStack')}>
                    <Text style = {[{color: colors.text}, styles.text]}>Submit a New Business</Text>
                </TouchableOpacity>
            </View>
            
            {isAdmin == true ? (<>
                            <View style = {[{borderBottomWidth: 1, borderBottomColor: colors.text}, styles.button]}>
                                <TouchableOpacity onPress = {() => navigation.navigate('ReviewBusinessStack')}>
                                    <Text style = {[{color: colors.text}, styles.text]}>Pending Businesses</Text>
                                </TouchableOpacity>
                            </View>
                            <View style = {[{borderBottomWidth: 1, borderBottomColor: colors.text}, styles.button]}>
                                <TouchableOpacity onPress = {() => navigation.navigate('ReviewBusinessEditStack')}>
                                    <Text style = {[{color: colors.text}, styles.text]}>Pending Business Edits</Text>
                                </TouchableOpacity>
                            </View>
                        </>) :
                        (null)
            }
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'left'
    },
    text: {
        fontSize: 20,
        padding: 10,
    },
    button: {
        borderBottomWidth: 1,
        width: '100%'
    }
});