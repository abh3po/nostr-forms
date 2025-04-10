import { useContext } from "react";
import { UserContext } from "../../provider/UserProvider";


export function useUserContext() {
    const context = useContext(UserContext);
  
    if (!context) {
      throw new Error("UserContext must be used within a UserContextProvider");
    }
  
    return context;
}

export default UserContext;