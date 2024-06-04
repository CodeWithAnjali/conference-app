import { GoogleAuthProvider, onAuthStateChanged, signInWithRedirect } from "firebase/auth";
import { createContext, useContext, useEffect, useState } from "react";
import { auth, firestore } from "../firebase.config";
import { collection, doc, getDocs, query, setDoc, where } from "firebase/firestore";

/**
 * @typedef { React.Context<{ user: import("firebase/auth").User | null, loaded: boolean, IsLoggedIn: () => Promise<import("../types").IsLoggedInFunctionResult> }> } AuthContextObject
 */

/**
 * @type {AuthContextObject}
 */
const AuthContext = createContext({
    user: null,
    loaded: false
});

/**
 * 
 * @param {string} uid
 * @returns {Promise<boolean>} 
 */
async function checkUserExist(uid) {
    try {
        // const usersRef = collection(firestore, "users");

        const snapshot = await getDocs(query(collection(firestore, "users"), where("uid", "==", uid)));
        if (snapshot.docs.length <= 0) {
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
        .then(async () => {
            const unsubscribe = onAuthStateChanged((auth, (user) => {
                checkUserExist(user.uid).then(exists => {
                    if (!exists) {
                        saveUser(user);
                        unsubscribe();
                    }
                })

            }))

        }).catch((reason) => {
            alert(reason);
        })
}

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [loaded, setLoaded] = useState(false);

    /**
     * 
     * @returns {Promise<import("../types").IsLoggedInFunctionResult>}
     */
    async function IsLoggedIn() {
        try {
          const user = await new Promise((resolve, reject) =>
            auth.onAuthStateChanged(
              user => {
                if (user) {
                  resolve(user)
                } else {
                  reject(null);
                }
              },
              error => reject(error)
            )
          )
          setCurrentUser(user);
          setLoaded(true);
          return { user, result: true }
        } catch (error) {
            setLoaded(true);
            return {user: null, result: false }
        }
    }

    useEffect(() => {
        IsLoggedIn().then(({ result, user}) => {
            if (result) {
                console.log("User is logged In")
                setCurrentUser(user);
            } else {
                console.log("User isn't logged in");                
                setCurrentUser(null);
            }
        }).catch((err) => {
            console.log(err);
        })
    }, [])

    // useEffect(() => {
    //     const unsubscribe = onAuthStateChanged(auth, (user) => {
    //         if (user) {
    //             checkUserExist(user.uid)
    //             .then((result) => {
    //                 if (!result) {
    //                     console.log("User doesn't exists saving");
    //                     saveUser(user);
    //                 }
    //             });
    //             setCurrentUser(user);
    //         }
    //     });

    //     return () => {
    //         unsubscribe();
    //     };
    // }, []);


    return (
        <AuthContext.Provider
            value={{
                user: currentUser,
                IsLoggedIn,
                loaded
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}
