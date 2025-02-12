import { useTheme } from "@react-navigation/native";
import { useContext } from "react";
import { Keyboard, TextInput } from "react-native";
import { KeyboardAvoidingView, ScrollView, StyleSheet, Text, TouchableWithoutFeedback, View } from "react-native";
import { SubmitPageStackScreenContext } from "../../contexts/SubmitPageStackScreenContext";
import WeekdayHours from "../../settings-components/WeekdayHours";

export default function SubmitHoursScreen() {
    const { colors } = useTheme();
    const { setBusinessData } = useContext(SubmitPageStackScreenContext);

    return (
        <TouchableWithoutFeedback onPress = {() => Keyboard.dismiss()}>
            <ScrollView contentContainerStyle = {styles.container}>
                <Text style = {[styles.header, {color: colors.text}]}>Hours (Optional)</Text>
                
                <View style = {styles.daysContainer}>
                    <WeekdayHours 
                        day = 'Monday'
                        dateIndex = {0}
                    />
                    <WeekdayHours 
                        day = 'Tuesday'
                        dateIndex = {1}
                    />
                    <WeekdayHours 
                        day = 'Wednesday'
                        dateIndex = {2}
                    />
                    <WeekdayHours 
                        day = 'Thursday'
                        dateIndex = {3}
                    />
                    <WeekdayHours 
                        day = 'Friday'
                        dateIndex = {4}
                    />
                    <WeekdayHours 
                        day = 'Saturday'
                        dateIndex = {5}
                    />
                    <WeekdayHours 
                        day = 'Sunday'
                        dateIndex = {6}
                    />
                </View>
                <Text style = {[styles.descriptionText, {color: colors.text}]}>Anything else we should know?</Text>
                <TextInput 
                    style = {[styles.textInput, {color: colors.text, borderColor: colors.text}]}
                    placeholder = "Optional (120 characters)"
                    onChangeText = {(text) => setBusinessData((prevState) => ({
                        ...prevState,
                        hoursDescription: text
                    }))}
                    multiline
                    numberOfLines = {4}
                    maxLength = {120}
                    placeholderTextColor = 'gray'
                />
            </ScrollView>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    header: {
        fontSize: 20,
        margin: 8,
        fontWeight: '500'
    },
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',

    },
    daysContainer: {
        width: '100%',
        flexDirection: 'column',
        marginRight: 1,
        margin: 4
    },
    descriptionText: {
        margin: 6,
        fontWeight: 450,
        fontSize: 16
    },
    textInput: {
        borderWidth: 1,
        borderRadius: 6,
        width: '80%',
        height: 160,
        padding: 4
    }
})