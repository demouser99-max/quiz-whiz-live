import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuth = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error(error);
        navigate("/auth");
        return;
      }

      if (data.session) {
        navigate("/dashboard");
      } else {
        navigate("/auth");
      }
    };

    handleAuth();
  }, []);

  return <p>Signing you in...</p>;
}
