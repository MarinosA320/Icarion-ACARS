// import { MadeWithDyad } from "@/components/made-with-dyad"; // Removed
// import { Button } from "@/components/ui/button"; // Removed as logout is in Navbar
// import { supabase } from "@/integrations/supabase/client"; // Removed as logout is in Navbar
// import { useNavigate } from "react-router-dom"; // Removed as logout is in Navbar

const Index = () => {
  // const navigate = useNavigate(); // Removed

  // const handleLogout = async () => { // Removed
  //   await supabase.auth.signOut();
  //   navigate('/login');
  // };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white p-4 pt-24"> {/* Added pt-24 to account for fixed navbar */}
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to Icarion Virtual Airline!</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
          Your journey begins here.
        </p>
        {/* <Button onClick={handleLogout} className="mt-4"> Removed
          Logout
        </Button> */}
      </div>
      {/* <MadeWithDyad /> Removed */}
    </div>
  );
};

export default Index;