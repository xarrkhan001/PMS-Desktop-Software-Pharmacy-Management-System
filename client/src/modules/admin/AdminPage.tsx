import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Shield, Settings, UserCog, Database, History, AlertCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const users = [
    { id: 1, name: "Admin User", role: "Super Admin", status: "Active" },
    { id: 2, name: "Dr. Hamza", role: "Pharmacist", status: "Active" },
    { id: 3, name: "Staff Member 1", role: "Sales", status: "Inactive" },
];

const logs = [
    { id: 1, user: "Admin", action: "Updated Medicine Stock", target: "Panadol 500mg", time: "2 mins ago", type: "update" },
    { id: 2, user: "Dr. Hamza", action: "Deleted Supplier", target: "XYZ Pharma", time: "1 hour ago", type: "delete" },
    { id: 3, user: "Admin", action: "Login Successful", target: "System", time: "3 hours ago", type: "info" },
    { id: 4, user: "System", action: "Low Stock Alert", target: "Amoxicillin", time: "5 hours ago", type: "alert" },
];

export default function AdminPage() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Admin Console</h1>
                    <p className="text-muted-foreground mt-1">System configuration and user management.</p>
                </div>
                <Button variant="destructive">
                    <Shield className="mr-2 h-4 w-4" /> System Lockdown
                </Button>
            </div>

            <Tabs defaultValue="users" className="space-y-4">
                <TabsList className="bg-slate-100 dark:bg-slate-800 p-1">
                    <TabsTrigger value="users">
                        <UserCog className="mr-2 h-4 w-4" /> Users & Roles
                    </TabsTrigger>
                    <TabsTrigger value="settings">
                        <Settings className="mr-2 h-4 w-4" /> General Settings
                    </TabsTrigger>
                    <TabsTrigger value="logs">
                        <History className="mr-2 h-4 w-4" /> Activity Logs
                    </TabsTrigger>
                    <TabsTrigger value="database">
                        <Database className="mr-2 h-4 w-4" /> Database
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="users" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>User Management</CardTitle>
                            <CardDescription>Manage access for pharmacy staff.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex justify-between mb-4">
                                <Input placeholder="Search users..." className="max-w-sm" />
                                <Button>Create User</Button>
                            </div>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {users.map((user) => (
                                        <TableRow key={user.id}>
                                            <TableCell className="font-medium">{user.name}</TableCell>
                                            <TableCell>{user.role}</TableCell>
                                            <TableCell>
                                                <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${user.status === 'Active' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-slate-100 text-slate-800 border border-slate-200'}`}>
                                                    {user.status}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="outline" size="sm" className="mr-2">Edit</Button>
                                                <Button variant="ghost" size="sm" className="text-destructive">Revoke</Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="logs" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>System Activity Logs</CardTitle>
                            <CardDescription>Track every action performed in the system.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {logs.map((log) => (
                                    <div key={log.id} className="flex items-start gap-4 p-3 rounded-lg border bg-slate-50/50 dark:bg-slate-900/50">
                                        <div className={`mt-1 p-2 rounded-full ${log.type === 'delete' ? 'bg-red-100 text-red-600' :
                                            log.type === 'alert' ? 'bg-amber-100 text-amber-600' :
                                                'bg-blue-100 text-blue-600'
                                            }`}>
                                            {log.type === 'alert' ? <AlertCircle className="h-4 w-4" /> : <History className="h-4 w-4" />}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium">
                                                <span className="text-primary">{log.user}</span> {log.action} <span className="text-slate-900 dark:text-white font-bold">{log.target}</span>
                                            </p>
                                            <p className="text-xs text-muted-foreground">{log.time}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="settings">
                    <Card>
                        <CardHeader>
                            <CardTitle>Pharmacy Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Pharmacy Name</label>
                                    <Input defaultValue="MediCore PMS" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Contact Number</label>
                                    <Input defaultValue="+92 300 0000000" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">License Number</label>
                                    <Input defaultValue="PH-1234-5678" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Tax ID (NTN)</label>
                                    <Input defaultValue="1234567-8" />
                                </div>
                            </div>
                            <Button>Save Changes</Button>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
