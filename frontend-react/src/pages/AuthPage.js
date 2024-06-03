import { useNavigate } from "react-router-dom";
// import { GoogleButton } from "../components/GoogleButton";
import {  useAuth } from "../contexts/AuthContext";
import { useEffect } from "react";

export default function AuthenticatePage() {
	const {user} = useAuth();
	const navigate = useNavigate();

	useEffect(() => {
		if (user) {
			navigate("/");
		}
	}, [user, navigate]);
 
	return (
		<div>
			{/* <GoogleButton title="SignIn With Google" handle={() => authenticateUser()} /> */}
		</div>
	)
}