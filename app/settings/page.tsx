'use client';

import { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useUser } from '@/lib/userContext';
import { RoleGuard } from '@/components/RoleGuard';
import { getAllProfiles, updateProfile, deactivateUser, Profile } from '@/lib/profile';
import { supabase } from '@/lib/supabase';
import { Camera, CheckCircle, XCircle, UserPlus, Trash2, UserX } from 'lucide-react';

const roleLabels: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  developer: { label: 'מפתח', variant: 'destructive' },
  admin: { label: 'מנהל', variant: 'default' },
  agent: { label: 'סוכן', variant: 'secondary' },
  customer: { label: 'לקוח', variant: 'outline' },
};

export default function SettingsPage() {
  const { user, profile, refreshProfile } = useUser();
  const [displayName, setDisplayName] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  // User management
  const [users, setUsers] = useState<Profile[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('agent');
  const [addingUser, setAddingUser] = useState(false);
  const [addMsg, setAddMsg] = useState('');

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.full_name || '');
    }
  }, [profile]);

  const loadUsers = async () => {
    setLoadingUsers(true);
    const data = await getAllProfiles();
    setUsers(data);
    setLoadingUsers(false);
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await updateProfile(user.id, { full_name: displayName });
    if (!error) {
      setSaveMsg('הפרופיל עודכן בהצלחה');
      await refreshProfile();
    } else {
      setSaveMsg('שגיאה בשמירה');
    }
    setSaving(false);
    setTimeout(() => setSaveMsg(''), 3000);
  };

  const handleAddUser = async () => {
    setAddingUser(true);
    setAddMsg('');
    const { error } = await supabase.auth.admin.inviteUserByEmail(newEmail, {
      data: { full_name: newName, role: newRole },
    });
    if (error) {
      setAddMsg(`שגיאה: ${error.message}`);
    } else {
      setAddMsg('הזמנה נשלחה בהצלחה!');
      setNewEmail('');
      setNewName('');
      setNewRole('agent');
      loadUsers();
    }
    setAddingUser(false);
  };

  const handleDeactivate = async (id: string) => {
    await deactivateUser(id);
    loadUsers();
  };

  return (
    <div className="p-6 max-w-5xl mx-auto" dir="rtl">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">הגדרות</h1>

      <Tabs defaultValue="profile">
        <TabsList className="mb-6">
          <TabsTrigger value="profile">פרופיל</TabsTrigger>
          <TabsTrigger value="users" onClick={loadUsers}>ניהול משתמשים</TabsTrigger>
          <TabsTrigger value="integrations">אינטגרציות</TabsTrigger>
          <TabsTrigger value="general">כללי</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>פרופיל אישי</CardTitle>
              <CardDescription>עדכן את פרטי הפרופיל שלך</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar */}
              <div className="flex items-center gap-4">
                <Avatar className="w-20 h-20">
                  <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white text-2xl">
                    {(displayName || user?.email || '?').slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Camera className="w-4 h-4" />
                  <span>שנה תמונה</span>
                </Button>
              </div>

              {/* Fields */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>שם תצוגה</Label>
                  <Input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="שם מלא"
                  />
                </div>
                <div className="space-y-2">
                  <Label>אימייל</Label>
                  <Input value={user?.email || ''} readOnly className="bg-slate-100 text-slate-500" />
                  <p className="text-xs text-slate-400">לא ניתן לשנות את האימייל</p>
                </div>
                <div className="space-y-2">
                  <Label>תפקיד</Label>
                  <Badge variant={roleLabels[profile?.role || 'agent']?.variant}>
                    {roleLabels[profile?.role || 'agent']?.label || profile?.role}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button onClick={handleSaveProfile} disabled={saving}>
                  {saving ? 'שומר...' : 'שמור שינויים'}
                </Button>
                {saveMsg && <span className="text-sm text-green-600">{saveMsg}</span>}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* User Management Tab */}
        <TabsContent value="users">
          <RoleGuard roles={['admin', 'developer']}>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>ניהול משתמשים</CardTitle>
                    <CardDescription>נהל את משתמשי המערכת</CardDescription>
                  </div>
                  <Button onClick={() => setShowAddUser(true)} className="flex items-center gap-2">
                    <UserPlus className="w-4 h-4" />
                    <span>הוסף משתמש</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loadingUsers ? (
                  <div className="text-center py-8 text-slate-400">טוען משתמשים...</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-right">שם</TableHead>
                        <TableHead className="text-right">אימייל</TableHead>
                        <TableHead className="text-right">תפקיד</TableHead>
                        <TableHead className="text-right">סטטוס</TableHead>
                        <TableHead className="text-right">פעולות</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((u) => (
                        <TableRow key={u.id}>
                          <TableCell className="font-medium">{u.full_name || '—'}</TableCell>
                          <TableCell>{u.email}</TableCell>
                          <TableCell>
                            <Badge variant={roleLabels[u.role]?.variant || 'outline'}>
                              {roleLabels[u.role]?.label || u.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {u.is_active ? (
                              <span className="flex items-center gap-1 text-green-600 text-sm">
                                <CheckCircle className="w-4 h-4" /> פעיל
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-slate-400 text-sm">
                                <XCircle className="w-4 h-4" /> לא פעיל
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {u.is_active && u.id !== user?.id && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeactivate(u.id)}
                                  className="text-slate-500 hover:text-red-500"
                                >
                                  <UserX className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </RoleGuard>
          <div className="hidden" id="no-access-users">
            <Card>
              <CardContent className="py-12 text-center text-slate-400">
                אין לך הרשאה לצפות בדף זה
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Integrations Tab */}
        <TabsContent value="integrations">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { name: 'Facebook', icon: '📘', desc: 'חבר את דף הפייסבוק שלך לניהול לידים', connected: false },
              { name: 'WhatsApp', icon: '💬', desc: 'שלח הודעות WhatsApp ישירות מהמערכת', connected: false },
              { name: 'Google Calendar', icon: '📅', desc: 'סנכרן פגישות עם Google Calendar', connected: false },
            ].map((integration) => (
              <Card key={integration.name}>
                <CardHeader>
                  <div className="text-3xl mb-2">{integration.icon}</div>
                  <CardTitle className="text-lg">{integration.name}</CardTitle>
                  <CardDescription>{integration.desc}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className={`flex items-center gap-1 text-sm ${integration.connected ? 'text-green-600' : 'text-slate-400'}`}>
                      {integration.connected ? (
                        <><CheckCircle className="w-4 h-4" /> מחובר</>
                      ) : (
                        <><XCircle className="w-4 h-4" /> לא מחובר</>
                      )}
                    </span>
                    <Button variant="outline" size="sm">חבר</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* General Tab */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>הגדרות כלליות</CardTitle>
              <CardDescription>הגדרות הסוכנות שלך</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>שם הסוכנות</Label>
                <Input defaultValue="Pacific Travel" />
              </div>
              <div className="space-y-2">
                <Label>לוגו</Label>
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 bg-blue-500 rounded-xl flex items-center justify-center text-white text-2xl">✈</div>
                  <Button variant="outline" size="sm">
                    <Camera className="w-4 h-4 ml-2" />
                    העלה לוגו
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>אזור זמן</Label>
                <Select defaultValue="asia-jerusalem">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asia-jerusalem">Asia/Jerusalem (UTC+2)</SelectItem>
                    <SelectItem value="utc">UTC</SelectItem>
                    <SelectItem value="europe-london">Europe/London</SelectItem>
                    <SelectItem value="america-new_york">America/New_York</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>שפה</Label>
                <Select defaultValue="he">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="he">עברית</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="ar">العربية</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button>שמור הגדרות</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add User Modal */}
      <Dialog open={showAddUser} onOpenChange={setShowAddUser}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>הוסף משתמש חדש</DialogTitle>
            <DialogDescription>שלח הזמנה לכתובת אימייל</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>אימייל</Label>
              <Input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="user@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label>שם מלא</Label>
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="שם מלא"
              />
            </div>
            <div className="space-y-2">
              <Label>תפקיד</Label>
              <Select value={newRole} onValueChange={setNewRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="developer">מפתח</SelectItem>
                  <SelectItem value="admin">מנהל</SelectItem>
                  <SelectItem value="agent">סוכן</SelectItem>
                  <SelectItem value="customer">לקוח</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {addMsg && (
              <p className={`text-sm ${addMsg.startsWith('שגיאה') ? 'text-red-500' : 'text-green-600'}`}>
                {addMsg}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddUser(false)}>ביטול</Button>
            <Button onClick={handleAddUser} disabled={addingUser || !newEmail}>
              {addingUser ? 'שולח...' : 'שלח הזמנה'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
