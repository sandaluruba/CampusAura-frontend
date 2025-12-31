import React, {useState} from 'react'
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from '../Firebase/firebaseConfig';
import { useNavigate , Link } from "react-router-dom";
import './AuthenticationPages.css';


function Login() {

    const [email,setEmail] = useState('');
    const [password,setPassword] = useState('');
    const [error,setError] = useState('');

    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        try{
            await signInWithEmailAndPassword(auth, email, password);
            navigate('/');
        }catch(err){
            setError(err.message);
        }
    }

  return (
      <div className='auth-container'>
        <div className='auth-card'> 
         <h1>CampusAura</h1>
         <h2>Student Login</h2>
         <p>Sign in to access your student portal</p>

            {/*Error Message */}
            {error && <p className='error_message'>{error}</p>}

            {/* Form */}
            <form className='auth-form' onSubmit={handleLogin}>

                   {/* Email */}
                    <label htmlFor="email">Email:</label><br />
                    <input type="email" id="email" value={email} placeholder='abc@gmail.com' onChange={(e) => setEmail(e.target.value)} required /> <br/>

                    {/* Password */}
                    <label htmlFor="password">Password:</label>
                    <a className='forgetpwd'>Forget Password</a><br/>
                    <input type="password" id="password" value={password} placeholder='Enter Your password' onChange={(e) => setPassword(e.target.value)} required /><br /><br/>

                    {/* Login button */}
                    <button type="submit">Login</button><br/>

                <div className='auth-Link'>     
                    <p>Don't have an account? <Link to="/SignUp">Sign Up</Link></p>
                </div>

            </form>
        </div>
         
      </div>
  )
}

export default Login
