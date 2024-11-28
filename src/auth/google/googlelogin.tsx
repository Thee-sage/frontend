
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../../contexts/authcontext";

type GoogleProfile = {
  name?: string;
  email: string;
  picture?: string;
};

const GoogleLoginComponent = () => {
  const { user, profile, loginWithGoogle, logout } = useAuth();

  const handleLoginSuccess = (response: any) => {
    const { credential } = response;
    loginWithGoogle(credential);
  };

  return (
    <div>
      {!user ? (
        <div>
          <GoogleLogin
            onSuccess={handleLoginSuccess}
            onError={() => console.log("Login Failed")}
            theme="outline"
            size="large"
            text="continue_with"
            shape="rectangular"
            width="300"
            useOneTap={false}
          />
        </div>
      ) : (
        <div>
          <h2>Welcome, {(profile as GoogleProfile)?.name}</h2>
          <p>Email: {profile?.email}</p>
          {(profile as GoogleProfile)?.picture && (
            <img
              src={(profile as GoogleProfile).picture}
              alt="Profile"
            />
          )}
          <button onClick={logout}>
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default GoogleLoginComponent;