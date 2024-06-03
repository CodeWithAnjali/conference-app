import { GoogleAuthProvider, onAuthStateChanged, signInWithRedirect } from "firebase/auth";
import { createContext, useContext, useEffect, useState } from "react";
import { auth, firestore } from "../firebase.config";
import { collection, doc, getDoc, getDocs, query, setDoc, where } from "firebase/firestore";
import { get } from "firebase/database";

/**
 * @typedef { React.Context<{ user: import("firebase/auth").User | null }> } AuthContextObject
 */

/**
 * @type {AuthContextObject}
 */
const AuthContext = createContext({
    user: null
});

/**
 * 
 * @param {string} uid
 * @returns {Promise<boolean>} 
 */
async function checkUserExist(uid) {
    try {
        const usersRef = collection(firestore, "users");

        const snapshot = await getDocs(query(collection(firestore, "users"), where("uid", "==", uid)));
        if (snapshot.docs.length < 0) {
            return false;
        }
    } catch(error) {
        console.log("Error Checking");
        return false;
    }
    return true;
}

/**
 * 
 * @param {import("firebase/auth").User} user 
 */
async function saveUser(user) {
    try {
        const userDoc = doc(firestore, `users/${user.uid}`);
        await setDoc(userDoc, {
            uid: user.uid,
            photoURL: user.photoURL,
            displayName: user.displayName,
            email: user.email,
        });
        console.log("Saved User");
    } catch (error) {
        console.log(error);
    }
}

export function authenticateUser() {
    const googleAuthProvider = new GoogleAuthProvider();
    signInWithRedirect(auth, googleAuthProvider)
        .then(() => {
            const user = auth.currentUser;
            console.log(user);
        }).catch((reason) => {
            alert(reason);
        })
}

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                checkUserExist(user.uid)
                .then((result) => {
                    if (!result) {
                        console.log("User doesn't exists saving");
                        saveUser(user);
                    }
                });
                setCurrentUser(user);
            }
        });

        return () => {
            unsubscribe();
        };
    }, []);


    return (
        <AuthContext.Provider
            value={{
                user: currentUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}
