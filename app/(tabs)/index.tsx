import React, {useEffect, useState} from 'react';
import {FlatList, KeyboardAvoidingView, Platform, StyleSheet} from 'react-native';
import {
    ActivityIndicator,
    Button,
    Card,
    Dialog,
    FAB,
    Portal,
    Provider as PaperProvider,
    Text,
    TextInput
} from 'react-native-paper';
import {useRouter} from 'expo-router';
import {ThemedView} from '@/components/ThemedView';
import {ThemedText} from '@/components/ThemedText';
import {useTodos} from '@/context/TodoContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import API_URL from '@/config/config';
import Constants from "expo-constants/src/Constants";

const TodosScreen = () => {
    const {todos, fetchTodos} = useTodos();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [loading, setLoading] = useState(true);
    const [dialogVisible, setDialogVisible] = useState(false);
    const [dialogMessage, setDialogMessage] = useState('');
    const router = useRouter();

    useEffect(() => {
        const loadTodos = async () => {
            setLoading(true);
            await fetchTodos();
            setLoading(false);
        };
        loadTodos();
    }, []);

    const handleAddTodo = async () => {
        if (!title || !description) {
            setDialogMessage('Both title and description are required.');
            setDialogVisible(true);
            return;
        }
        try {
            const token = await AsyncStorage.getItem('token');
            await axios.post(`${API_URL}/api/todos`, {
                title,
                description
            }, {headers: {Authorization: `Bearer ${token}`}});
            fetchTodos();
            setTitle('');
            setDescription('');
            setIsAdding(false);
        } catch (error) {
            setDialogMessage('Failed to add todo');
            setDialogVisible(true);
        }
    };

    const handleDeleteTodo = async (id: string) => {
        try {
            const token = await AsyncStorage.getItem('token');
            await axios.delete(`${API_URL}/api/todos/${id}`, {headers: {Authorization: `Bearer ${token}`}});
            fetchTodos();
        } catch (error) {
            setDialogMessage('Failed to delete todo');
            setDialogVisible(true);
        }
    };

    return (
        <PaperProvider>
            <ThemedView style={styles.container}>
                <ThemedText style={styles.title} type="title">ToDo List</ThemedText>
                {loading ? (
                    <ActivityIndicator style={styles.loading} animating={true}/>
                ) : (
                    <FlatList
                        data={todos}
                        keyExtractor={(item) => item._id}
                        renderItem={({item}) => (
                            <Card style={styles.card} elevation={3} onPress={() => router.push(`../todo/${item._id}`)}>
                                <Card.Content>
                                    <Text variant="titleMedium">{item.title}</Text>
                                    <Text variant="bodyMedium" style={styles.description}>{item.description}</Text>
                                </Card.Content>
                                <Card.Actions>
                                    <Button onPress={() => handleDeleteTodo(item._id)}>Delete</Button>
                                </Card.Actions>
                            </Card>
                        )}
                        contentContainerStyle={styles.listContainer}
                    />
                )}
                {isAdding && (
                    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                                          style={styles.inputContainer}>
                        <TextInput label="Title" value={title} onChangeText={setTitle} style={styles.input}
                                   mode="outlined"/>
                        <TextInput label="Description" value={description} onChangeText={setDescription}
                                   style={styles.input} mode="outlined" multiline/>
                        <Button mode="contained" onPress={handleAddTodo} style={styles.addButton}>Add Todo</Button>
                        <Button onPress={() => setIsAdding(false)} style={styles.cancelButton}>Cancel</Button>
                    </KeyboardAvoidingView>
                )}
                {!isAdding && (
                    <FAB style={styles.fab} icon="plus" onPress={() => setIsAdding(true)} label="Add Todo"/>
                )}
                <Portal>
                    <Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)}>
                        <Dialog.Title>Alert</Dialog.Title>
                        <Dialog.Content>
                            <Text>{dialogMessage}</Text>
                        </Dialog.Content>
                        <Dialog.Actions>
                            <Button onPress={() => setDialogVisible(false)}>OK</Button>
                        </Dialog.Actions>
                    </Dialog>
                </Portal>
            </ThemedView>
        </PaperProvider>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: Constants.statusBarHeight,
        backgroundColor: "#f3f4f6", // Light gray background for contrast
    },
    title: {
        marginTop: 16,
        marginHorizontal: 16,
        fontSize: 28, // Larger font size for better visibility
        fontWeight: "bold",
        color: "#1a202c", // Darker color for contrast
        fontFamily: "sans-serif-medium", // Improved font family for modern look
    },
    listContainer: {
        padding: 16,
    },
    card: {
        backgroundColor: "#ffffff",
        marginBottom: 16,
        borderRadius: 12,
        padding: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    description: {
        marginTop: 8,
        fontSize: 16, // Slightly larger font size for better readability
        color: "#4a5568", // Medium gray for good contrast with the white card
        lineHeight: 22, // Increased line height for better readability
        fontFamily: "sans-serif", // Modern and clean font
    },
    fab: {
        position: "absolute",
        right: 16,
        bottom: 16,
        width: 64, // Larger FAB for easier tapping
        height: 64,
        borderRadius: 32,
        backgroundColor: "#2563eb", // Vibrant blue for contrast
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 5,
    },
    inputContainer: {
        padding: 16,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        backgroundColor: "#ffffff", // White background for clarity
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
    },
    input: {
        height: 50,
        borderWidth: 1,
        borderColor: "#1e1e1e", // Light border color for a soft appearance
        borderRadius: 8,
        paddingHorizontal: 14,
        marginBottom: 12,
        backgroundColor: "#f9fafb", // Very light gray for input background
        fontSize: 16, // Standardized input text size
        color: "#1a202c", // Dark text color for contrast
        fontFamily: "sans-serif", // Clean font style
    },
    addButton: {
        height: 50,
        backgroundColor: "#38a169", // Vibrant green for better visibility
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 8,
        marginTop: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 3,
        elevation: 3,
    },
    addButtonText: {
        fontSize: 18, // Larger font for better readability
        fontWeight: "600",
        color: "#ffffff", // White text for contrast with green button
        fontFamily: "sans-serif-medium",
    },
    cancelButton: {
        height: 50,
        backgroundColor: "#e53e3e", // Bright red for visibility
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 8,
        marginTop: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 3,
        elevation: 3,
    },
    cancelButtonText: {
        fontSize: 18, // Larger font for clarity
        fontWeight: "600",
        color: "#ffffff", // White text for contrast
        fontFamily: "sans-serif-medium",
    },
    loading: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f3f4f6", // Same as the main background
    },
});

export default TodosScreen;
