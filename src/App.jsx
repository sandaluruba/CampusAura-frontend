import { Route,Routes } from "react-router-dom"
import Login from "./AuthenticationUI/login";
import Register from "./AuthenticationUI/register";
import NormalUserSignUp from "./AuthenticationUI/SignUp";
 

function App() {
  

  return (
     <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/SignUp" element={<NormalUserSignUp />} />
     </Routes>
  )
}

export default App
