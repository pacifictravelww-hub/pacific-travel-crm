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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUser } from '@/lib/userContext';
import { RoleGuard } from '@/components/RoleGuard';
import { getAllProfiles, updateProfile, deactivateUser, deleteUser, Profile } from '@/lib/profile';
import { supabase } from '@/lib/supabase';
import { Camera, CheckCircle, XCircle, UserPlus, Trash2, UserX, Clock, KeyRound } from 'lucide-react';
import { supabase as supabaseClient } from '@/lib/supabase';

const roleLabels: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  developer: { label: 'מפתח', variant: 'destructive' },
  admin: { label: 'מנהל', variant: 'default' },
  agent: { label: 'סוכן', variant: 'secondary' },
  customer: { label: 'לקוח', variant: 'outline' },
};

function PendingUserRow({
  user,
  onApprove,
  onReject,
}: {
  user: Profile;
  onApprove: (id: string, role: string) => void;
  onReject: (id: string) => void;
}) {
  const [approveRole, setApproveRole] = useState<string>(user.role || 'agent');

  return (
    <TableRow>
      <TableCell className="font-medium">{user.full_name || '—'}</TableCell>
      <TableCell>{user.email}</TableCell>
      <TableCell>
        <Badge variant={roleLabels[user.role]?.variant || 'outline'}>
          {roleLabels[user.role]?.label || user.role}
        </Badge>
      </TableCell>
      <TableCell className="text-sm text-slate-500">
        {new Date(user.created_at).toLocaleDateString('he-IL')}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Select value={approveRole} onValueChange={setApproveRole}>
            <SelectTrigger className="w-28 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">מנהל</SelectItem>
              <SelectItem value="agent">סוכן</SelectItem>
              <SelectItem value="customer">לקוח</SelectItem>
            </SelectContent>
          </Select>
          <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white h-8" onClick={() => onApprove(user.id, approveRole)}>
            אשר
          </Button>
          <Button size="sm" variant="destructive" className="h-8" onClick={() => onReject(user.id)}>
            דחה
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

export default function SettingsPage() {
  const { user, profile, refreshProfile } = useUser();
  const [displayName, setDisplayName] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [logoUrl, setLogoUrl] = useState('');
  const [uploadingLogo, setUploadingLogo] = useState(false);

  // Pending approvals
  const [pendingUsers, setPendingUsers] = useState<Profile[]>([]);
  const [loadingPending, setLoadingPending] = useState(false);
  const [approvalMsg, setApprovalMsg] = useState('');

  const loadPendingUsers = async () => {
    setLoadingPending(true);
    const { data } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });
    setPendingUsers((data as Profile[]) || []);
    setLoadingPending(false);
  };

  const handleApprove = async (userId: string, role: string) => {
    // Fetch the user's email + name before updating
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('email, full_name')
      .eq('id', userId)
      .single();

    await supabaseClient
      .from('profiles')
      .update({ status: 'approved', role, updated_at: new Date().toISOString() })
      .eq('id', userId);

    // Send approval email
    if (profile?.email) {
      try {
        await fetch('/api/email/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'user_approved',
            to: profile.email,
            data: {
              userName: profile.full_name || profile.email,
              loginUrl: `${window.location.origin}/login`,
            },
          }),
        });
      } catch (e) {
        console.warn('Approval email failed:', e);
      }
    }

    setApprovalMsg('המשתמש אושר ונשלח אליו אימייל!');
    setTimeout(() => setApprovalMsg(''), 3000);
    loadPendingUsers();
  };

  const handleReject = async (userId: string) => {
    await supabaseClient
      .from('profiles')
      .update({ status: 'suspended', updated_at: new Date().toISOString() })
      .eq('id', userId);
    setApprovalMsg('המשתמש נדחה.');
    setTimeout(() => setApprovalMsg(''), 3000);
    loadPendingUsers();
  };

  // User management
  const [users, setUsers] = useState<Profile[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('agent');
  const [addingUser, setAddingUser] = useState(false);
  const [addMsg, setAddMsg] = useState('');
  const [editingUser, setEditingUser] = useState<Profile | null>(null);
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState('agent');
  const [editPhone, setEditPhone] = useState('');
  const [editActive, setEditActive] = useState(true);
  const [savingEdit, setSavingEdit] = useState(false);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.full_name || '');
      setAvatarUrl((profile as any).avatar_url || '');
    }
    // Load agency logo from Supabase Storage public URL
    const { data } = supabase.storage.from('avatars').getPublicUrl('agency/logo');
    if (data?.publicUrl) {
      // Check if it actually exists
      fetch(data.publicUrl, { method: 'HEAD' }).then(r => {
        if (r.ok) setLogoUrl(data.publicUrl + '?t=' + Date.now());
      }).catch(() => {});
    }
  }, [profile]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    const ext = file.name.split('.').pop();
    const path = `agency/logo.${ext}`;
    const { error } = await supabase.storage.from('avatars').upload(path, file, { upsert: true });
    if (!error) {
      const { data } = supabase.storage.from('avatars').getPublicUrl(path);
      const url = data.publicUrl + '?t=' + Date.now();
      setLogoUrl(url);
      // Broadcast to sidebar
      localStorage.setItem('agency_logo_url', url);
      window.dispatchEvent(new StorageEvent('storage', { key: 'agency_logo_url', newValue: url }));
      setSaveMsg('לוגו הועלה בהצלחה!');
      setTimeout(() => setSaveMsg(''), 3000);
    } else {
      setSaveMsg(`שגיאה: ${error.message}`);
      setTimeout(() => setSaveMsg(''), 5000);
    }
    setUploadingLogo(false);
    // Reset input so same file can be re-selected
    e.target.value = '';
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploadingAvatar(true);
    const ext = file.name.split('.').pop();
    const path = `${user.id}/avatar.${ext}`;
    const { error } = await supabase.storage.from('avatars').upload(path, file, { upsert: true });
    if (!error) {
      const { data } = supabase.storage.from('avatars').getPublicUrl(path);
      const url = data.publicUrl + '?t=' + Date.now();
      setAvatarUrl(url);
      await updateProfile(user.id, { avatar_url: url } as any);
      setSaveMsg('תמונה הועלתה בהצלחה!');
      setTimeout(() => setSaveMsg(''), 3000);
    } else {
      console.error('Avatar upload error:', error);
      setSaveMsg(`שגיאה: ${error.message}`);
      setTimeout(() => setSaveMsg(''), 5000);
    }
    setUploadingAvatar(false);
  };

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

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const handleDeleteUser = async (id: string) => {
    await deleteUser(id);
    setConfirmDeleteId(null);
    loadUsers();
  };

  const [resetMsg, setResetMsg] = useState<{ id: string; msg: string } | null>(null);
  const handleSendPasswordReset = async (email: string, userId: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) {
      setResetMsg({ id: userId, msg: `שגיאה: ${error.message}` });
    } else {
      setResetMsg({ id: userId, msg: '✅ נשלח!' });
    }
    setTimeout(() => setResetMsg(null), 4000);
  };

  const openEditUser = (u: Profile) => {
    setEditingUser(u);
    setEditName(u.full_name || '');
    setEditRole(u.role || 'agent');
    setEditPhone(u.phone || '');
    setEditActive(u.is_active !== false);
  };

  const handleSaveEditUser = async () => {
    if (!editingUser) return;
    setSavingEdit(true);
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: editName, role: editRole, phone: editPhone, is_active: editActive, updated_at: new Date().toISOString() })
      .eq('id', editingUser.id);
    // Also update app_metadata role via service
    if (!error) {
      await fetch('/api/admin/update-user-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: editingUser.id, role: editRole }),
      }).catch(() => {});
      loadUsers();
      setEditingUser(null);
    }
    setSavingEdit(false);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto" dir="rtl">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">הגדרות</h1>

      <Tabs defaultValue="profile" dir="rtl" onValueChange={(val) => {
          if (val === 'users') loadUsers();
          if (val === 'approvals') loadPendingUsers();
        }}>
        <TabsList className="mb-6 w-full justify-start">
          <TabsTrigger value="profile">פרופיל</TabsTrigger>
          <TabsTrigger value="general">כללי</TabsTrigger>
          <TabsTrigger value="integrations">אינטגרציות</TabsTrigger>
          {(profile?.role === 'admin' || profile?.role === 'developer') && (
            <TabsTrigger value="users">ניהול משתמשים</TabsTrigger>
          )}
          {(profile?.role === 'admin' || profile?.role === 'developer') && (
            <TabsTrigger value="approvals">
              אישורים ממתינים
              {pendingUsers.length > 0 && (
                <span className="mr-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">{pendingUsers.length}</span>
              )}
            </TabsTrigger>
          )}
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
                  {avatarUrl && <AvatarImage src={avatarUrl} alt={displayName} />}
                  <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white text-2xl">
                    {(displayName || user?.email || '?').slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 text-sm border border-slate-200 rounded-md hover:bg-slate-50 transition-colors">
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={uploadingAvatar} />
                  <Camera className="w-4 h-4 text-slate-600" />
                  <span className="text-slate-700">{uploadingAvatar ? 'מעלה...' : 'שנה תמונה'}</span>
                </label>
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
                            <div className="flex flex-col gap-1">
                              {/* Approval status */}
                              {(u as Profile & { status?: string }).status === 'approved' ? (
                                <span className="flex items-center gap-1 text-green-600 text-xs font-medium">
                                  <CheckCircle className="w-3.5 h-3.5" /> מאושר
                                </span>
                              ) : (u as Profile & { status?: string }).status === 'pending' ? (
                                <span className="flex items-center gap-1 text-amber-500 text-xs font-medium">
                                  <Clock className="w-3.5 h-3.5" /> ממתין לאישור
                                </span>
                              ) : (u as Profile & { status?: string }).status === 'suspended' ? (
                                <span className="flex items-center gap-1 text-red-500 text-xs font-medium">
                                  <XCircle className="w-3.5 h-3.5" /> מושעה
                                </span>
                              ) : (
                                <span className="text-xs text-slate-400">—</span>
                              )}
                              {/* Active/Inactive */}
                              {!u.is_active && (
                                <span className="flex items-center gap-1 text-slate-400 text-xs">
                                  <XCircle className="w-3 h-3" /> לא פעיל
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 flex-wrap">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openEditUser(u)}
                                className="text-blue-600 hover:text-blue-800 h-8 px-2"
                                title="ערוך משתמש"
                              >
                                ✏️
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleSendPasswordReset(u.email, u.id)}
                                className="text-amber-600 hover:text-amber-800 h-8 px-2"
                                title="שלח לינק לאיפוס סיסמה"
                              >
                                <KeyRound className="w-4 h-4" />
                              </Button>
                              {resetMsg?.id === u.id && (
                                <span className="text-xs text-green-600 mr-1">{resetMsg.msg}</span>
                              )}
                              {u.is_active && u.id !== user?.id && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeactivate(u.id)}
                                  className="text-slate-500 hover:text-red-500 h-8 px-2"
                                  title="השבת משתמש"
                                >
                                  <UserX className="w-4 h-4" />
                                </Button>
                              )}
                              {profile?.role === 'developer' && u.id !== user?.id && (
                                confirmDeleteId === u.id ? (
                                  <div className="flex items-center gap-1">
                                    <span className="text-xs text-red-500">בטוח?</span>
                                    <Button variant="ghost" size="sm" onClick={() => handleDeleteUser(u.id)}
                                      className="text-red-500 hover:text-red-700 h-7 px-2 text-xs">כן</Button>
                                    <Button variant="ghost" size="sm" onClick={() => setConfirmDeleteId(null)}
                                      className="text-slate-500 h-7 px-2 text-xs">לא</Button>
                                  </div>
                                ) : (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setConfirmDeleteId(u.id)}
                                    className="text-slate-400 hover:text-red-600 h-8 px-2"
                                    title="מחק משתמש (מפתח בלבד)"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                )
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

        {/* Pending Approvals Tab */}
        <TabsContent value="approvals">
          <Card>
            <CardHeader>
              <CardTitle>אישורים ממתינים</CardTitle>
              <CardDescription>משתמשים הממתינים לאישור גישה למערכת</CardDescription>
            </CardHeader>
            <CardContent>
              {approvalMsg && (
                <div className="mb-4 text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg p-3">{approvalMsg}</div>
              )}
              {loadingPending ? (
                <div className="text-center py-8 text-slate-400">טוען...</div>
              ) : pendingUsers.length === 0 ? (
                <div className="text-center py-12">
                  <Clock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-400">אין משתמשים ממתינים לאישור</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">שם</TableHead>
                      <TableHead className="text-right">אימייל</TableHead>
                      <TableHead className="text-right">תפקיד מבוקש</TableHead>
                      <TableHead className="text-right">תאריך הרשמה</TableHead>
                      <TableHead className="text-right">פעולות</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingUsers.map((u) => (
                      <PendingUserRow
                        key={u.id}
                        user={u}
                        onApprove={handleApprove}
                        onReject={handleReject}
                      />
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
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
                <Label>לוגו סוכנות</Label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-xl border-2 border-slate-200 flex items-center justify-center overflow-hidden bg-slate-50">
                    {logoUrl
                      ? <img src={logoUrl} alt="לוגו" className="w-full h-full object-contain p-1" />
                      : <span className="text-3xl">✈️</span>
                    }
                  </div>
                  <div className="space-y-2">
                    <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 text-sm border border-slate-200 rounded-md hover:bg-slate-50 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleLogoUpload}
                        disabled={uploadingLogo}
                      />
                      <Camera className="w-4 h-4 text-slate-600" />
                      <span className="text-slate-700">{uploadingLogo ? 'מעלה...' : 'העלה לוגו'}</span>
                    </label>
                    <p className="text-xs text-slate-400">PNG / JPG / SVG מומלץ — מינימום 200×200px</p>
                  </div>
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

      {/* Edit User Modal */}
      <Dialog open={!!editingUser} onOpenChange={open => !open && setEditingUser(null)}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>עריכת משתמש — {editingUser?.email}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>שם מלא</Label>
              <Input value={editName} onChange={e => setEditName(e.target.value)} placeholder="שם מלא" />
            </div>
            <div className="space-y-2">
              <Label>טלפון</Label>
              <Input value={editPhone} onChange={e => setEditPhone(e.target.value)} placeholder="050-0000000" className="ltr" />
            </div>
            <div className="space-y-2">
              <Label>תפקיד</Label>
              <Select value={editRole} onValueChange={setEditRole}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="developer">👑 מפתח</SelectItem>
                  <SelectItem value="admin">⭐ מנהל</SelectItem>
                  <SelectItem value="agent">סוכן</SelectItem>
                  <SelectItem value="customer">לקוח</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="edit-active"
                checked={editActive}
                onChange={e => setEditActive(e.target.checked)}
                className="w-4 h-4 accent-blue-600"
              />
              <Label htmlFor="edit-active" className="cursor-pointer">משתמש פעיל</Label>
            </div>
          </div>
          <DialogFooter className="gap-2 mt-4">
            <Button variant="outline" onClick={() => setEditingUser(null)}>ביטול</Button>
            <Button onClick={handleSaveEditUser} disabled={savingEdit}>
              {savingEdit ? 'שומר...' : 'שמור שינויים'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
