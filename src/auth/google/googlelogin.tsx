import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../../contexts/authcontext"; // Adjust path as needed

type GoogleProfile = {
  name?: string;
  email: string;
  picture?: string;
};

export function GoogleLoginComponent() {
  const { user, profile, loginWithGoogle, logout } = useAuth();

  const handleLoginSuccess = (response: any) => {
    const { credential } = response;
    loginWithGoogle(credential);
  };

  return (
    <div className="flex flex-col items-center justify-center">
      {!user ? (
        <GoogleLogin onSuccess={handleLoginSuccess} onError={() => console.log("Login Failed")} />
      ) : (
        <div className="mt-4">
          <h2>Welcome, {(profile as GoogleProfile)?.name}</h2>
          <p>Email: {profile?.email}</p>
          {(profile as GoogleProfile)?.picture && (
            <img
              src={(profile as GoogleProfile).picture}
              alt="Profile"
              className="mt-2 w-20 h-20 rounded-full"
            />
          )}
          <button onClick={logout} className="mt-2 px-4 py-2 bg-red-500 text-white rounded">
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
