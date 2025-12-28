import React , {useState} from 'react';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from '../Firebase/firebaseConfig'; 
import { useNavigate , Link } from "react-router-dom";
import './AuthenticationPages.css';

function NormalUserSignUp() {

    const [email,setEmail] = useState('');
    const [password,setPassword] = useState('');
    const [confirmPassword,setConfirmPassword] = useState('');
    const [error,setError] = useState('');

    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');

        //Paassword match validation
        if(password !== confirmPassword){
            setError("Passwords do not match");
            return;
        }

        //Verify email is not empty
        if(!email){
            setError("Email is required");
            return;
        }

        try{
            await createUserWithEmailAndPassword(auth, email, password);
            //alert("Registration successful!");
            navigate('/');
        }catch(err){
            setError(err.message);
        }
    }

  return (
    <div className='auth-container'>
      <div className='auth-card'>
      <h1>CampusAura</h1>
      <h2>User Registration</h2>
      <p>Create your account to get started</p>

      {/*Error Message */}
      {error && <p className='error_message'>{error}</p>}

      {/* Form */}
        <form className='auth-form' onSubmit={handleRegister}>

        {/* Email */}
        <label htmlFor="email">Email:</label><br />
        <input type="email" id="email" value={email} placeholder='abc@gmail.com' onChange={(e) => setEmail(e.target.value)} required /> <br/>

        {/* Password */}
        <label htmlFor="password">Password:</label><br />
        <input type="password" id="password" value={password} placeholder='Enter Your Password' onChange={(e) => setPassword(e.target.value)} required /><br />

        {/* Confirm Password */}
        <label htmlFor="confirmPassword">Confirm Password:</label><br />
        <input type="password" id="confirmPassword" value={confirmPassword} placeholder='Confirm Password' onChange={(e) => setConfirmPassword(e.target.value)} required /><br /><br/>

        {/* Register button */}
        <button type="submit">Register</button><br/><br/>

      <div className='auth-Link'> 
        <span>Register As Student   </span><Link to="/register">Student Registration</Link>
      </div>

        </form>
        </div>
    </div>
  )
}

export default NormalUserSignUp
