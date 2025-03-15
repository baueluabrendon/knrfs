
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export const AuthHeader = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-[#FFD700] py-4 px-6 flex justify-between items-center">
      <h1 className="text-2xl font-bold text-black">Welcome to K&R Financial Services</h1>
      <Button 
        className="bg-[#22C55E] hover:bg-[#1EA34D] text-white rounded-md px-6"
        onClick={() => navigate('/apply')}
      >
        Apply Now
      </Button>
    </div>
  );
};
