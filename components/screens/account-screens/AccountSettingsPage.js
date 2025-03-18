import { useTheme } from "@react-navigation/native";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function AccountSettingsPage({ navigation }) {
    const { colors } = useTheme();

    return (
        <ScrollView 
            contentContainerStyle = {styles.container}
        >
             <View style = {[{borderColor: colors.text, borderTopWidth: 1}, styles.button]}>
                <TouchableOpacity onPress = {() => navigation.push("AccountSettingsStackScreen", 
                                                                        {screen: "DeleteAccount"})}>
                    <Text style = {[{color: colors.text}, styles.text]}>Delete Account</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column'
    },
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

})