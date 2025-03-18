import { useTheme } from "@react-navigation/native";
import { useContext, useEffect, useState } from "react";
import { Button, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { UserContext } from "../../contexts/UserContext";
import { deleteUserAndUserDocFromDB, getUserNameFromDatabase } from "../../dbcalls";
import { handleCreateToast } from "../../settings-components/Toast";
import Toast from "react-native-toast-message";

export default function DeleteAccountScreen({ navigation }) {
    const { colors, theme } = useTheme();
    const { user } = useContext(UserContext);
    const [userName, setUserName] = useState("");
    const [userInput, setUserInput] = useState("");


    // gets userName of user on load
    useEffect(() => {
        console.log('using effect in DeleteAccountSettings');
        const handleGetUser = async () => {
            if (user) setUserName(await getUserNameFromDatabase(user));
        }
        handleGetUser();
    }, []);

    const handleDeleteAccount = async () => {
        if (userName === userInput) {
            await deleteUserAndUserDocFromDB(user);
            navigation.pop(2);
        } else {
            handleCreateToast('error', 'username is incorrect', 'bottom');
        }
    };

    return (
        <View style = {styles.container}>
            <Text style = {styles.title}>
                You are about do delete your account
            </Text>

            <Text style = {[styles.text, {color: colors.text}]}>
                Enter your username to confirm
            </Text>
            <TextInput 
                placeholder = {userName ? userName : "Please enter your username"}
                placeholderTextColor = 'gray'
                onChangeText = {(text) => setUserInput(text)}
                value = {userInput}
                style = {[styles.textInput, {borderColor: colors.text, color: colors.text}]}

            />
            <TouchableOpacity
                onPress = {() => handleDeleteAccount()}
            >
                <View style = {[styles.button, {borderColor: colors.text}]}>
                    <Text style = {[styles.buttonText, {color: colors.text}]}>
                        Confirm
                    </Text>
                </View>
            </TouchableOpacity>
            <Toast />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'center'
    },
    title: {
        fontSize: 20,
        margin: 4,
        marginTop: 20,
        marginBottom: 16,
        fontWeight: 700,
        color: 'red'
    },
    text: {
        fontSize: 14,
        margin: 4,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: 600
    },
    textInput: {
        borderWidth: 1,
        width: 290,
        height: 44,
        borderRadius: 8,
        margin: 8,
        fontSize: 16,
        padding: 4,
    },
    button: {
        borderWidth: 1,
        padding: 12,
        paddingHorizontal: 20,
        borderRadius: 10
    }
})