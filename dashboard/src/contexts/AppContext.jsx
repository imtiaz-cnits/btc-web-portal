import {createContext, useContext, useState} from "react";
import {useNavigate} from "react-router-dom";

export const AppContext = createContext();

export const AppContextProvider = ({children}) => {

    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    // This is where you can define any global state or functions
    const value = {navigate, user, setUser};

    return <AppContext.Provider value={value}>
        {children}
    </AppContext.Provider>;
}

export const useAppContext = () => {[]
    return useContext(AppContext);
}
