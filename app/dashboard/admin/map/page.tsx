import RealTimeMap from "@/components/pages/driver/RealtimeMap";
import Tracker from "@/components/pages/driver/Tracker";
import RoleGuard from "@/components/pages/RoleGuard";


export default function AdminMapPage() {
  return (
    // <RoleGuard allowedRoles={['admin']}>
    //   <div className="h-screen flex flex-col">
    //     <header className="bg-blue-600 text-white p-4">
    //       <h1 className="text-xl font-bold">Admin Live Tracking</h1>
    //       <p>Viewing all students and drivers in real-time</p>
    //     </header>
    //     <RealTimeMap role="admin" />
    //   </div>
    // </RoleGuard>

    <Tracker/>
  )
}