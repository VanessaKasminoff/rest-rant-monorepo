import { createContext, useEffect, useState } from "react";


export const CurrentUser = createContext()

function CurrentUserProvider({ children }){

    const [currentUser, setCurrentUser] = useState(null)

    useEffect(() => {
        try {
            const getLoggedInUser = async () => {
                let response = await fetch(`http://localhost:3030/authentication/profile`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                })
                let user = await response.json()
                setCurrentUser(user)
            }
                getLoggedInUser()
        } catch (error) {
            console.error('Error fetching user:', error)
            setCurrentUser(null)
        };
    }, [])

    return (
        <CurrentUser.Provider value={{ currentUser, setCurrentUser }}>
            {children}
        </CurrentUser.Provider>
    )
}

export default CurrentUserProvider