import React , {useState} from 'react';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from '../Firebase/firebaseConfig';
import { GrUpload } from "react-icons/gr";
import { useNavigate } from "react-router-dom";
import './AuthenticationPages.css';

function Register() {


    const [email,setEmail] = useState('');
    const [password,setPassword] = useState('');
    const [confirmPassword,setConfirmPassword] = useState('');
    const [idImage,setIdImage] = useState(null);
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

        //Email domain validation
        if(!email.endsWith('@std.uwu.ac.lk')){
            setError("Please use your student email to register.");
            return;
        }

        //ID image upload validation
        if(!idImage){
            setError("Student ID image is required for verification.");
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
        <h2>Student Registration</h2>
        <p>Create your student account to get started</p>

        {/*Error Message */}
        {error && <p className='error_message'>{error}</p>}

        {/* Form */}
        <form className='auth-form' onSubmit={handleRegister}>

        {/* Email */}
        <label htmlFor="email">Email:</label><br />
        <input type="email" placeholder='student@std.uwu.ac.lk' value={email} onChange={(e) => setEmail(e.target.value)} required /> <br/>
        <span>Use your university email address</span><br/> 

        {/* Password */}
        <label htmlFor="password">Password:</label><br />
        <input type="password" placeholder='Enter Your Password' value={password} onChange={(e) => setPassword(e.target.value)} required /><br />

        {/* Confirm Password */}
        <label htmlFor="confirmPassword">Confirm Password:</label><br />
        <input type="password" placeholder='Confirm Password' value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required /><br />

        {/* Student ID upload */}
        <label htmlFor="idImage">Upload Student ID:</label><br />
        <input type="file" accept="image/*" onChange={(e) => setIdImage(e.target.files[0])} required /><br />
        <div className='upload-instructions'> 
        <GrUpload /> 
        <span>
            Upload a clear photo of your student ID for verification purposes
        </span><br/><br/>
        </div>

        {/* Register button */}
        <button type="submit">Register</button>

       </form>
      </div> 
    </div>
  )
}

export default Register
