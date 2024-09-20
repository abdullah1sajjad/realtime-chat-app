import Button from "@/components/ui/Button";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { FunctionComponent } from "react";

interface DashboardProps {}

const Dashboard: FunctionComponent<DashboardProps> = async () => {
  const session = await getServerSession(authOptions);
  return (
    <div className="p-8">
      <Button>Home</Button> {JSON.stringify(session)}
    </div>
  );
};

export default Dashboard;
