'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { registerAdmin } from '@/lib/actions/auth-actions';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Mail, Lock, User, ShieldCheck, ArrowRight, LayoutDashboard, Database, UserPlus, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function CreateUserPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const result = await registerAdmin(name, email, password);
      
      if (result.success) {
        toast.success('Admin account provisioned successfully');
        setName('');
        setEmail('');
        setPassword('');
        // No redirect needed, we are already in the dashboard
      } else {
        setError(result.error || 'Provisioning failed');
        toast.error(result.error || 'Provisioning failed');
      }
    } catch (err) {
      console.error('[CreateUser] Error:', err);
      setError('An unexpected error occurred');
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Access Management</h1>
          <p className="text-muted-foreground">Provision new administrator accounts with secure credentials</p>
        </div>
        <Badge variant="outline" className="w-fit px-4 py-1.5 border-primary/20 bg-primary/5 text-primary text-xs font-bold uppercase tracking-widest">
          Root Administrator Action
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-zinc-200 dark:border-zinc-800 shadow-xl shadow-black/5">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <UserPlus className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Register New Administrator</CardTitle>
                <CardDescription>Enter the details for the new portal manager</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-6 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                <Shield className="h-4 w-4" />
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="admin-name" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Full Name</Label>
                  <div className="relative group">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input 
                      id="admin-name" 
                      placeholder="e.g. John Doe" 
                      className="pl-10 h-11" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required 
                      suppressHydrationWarning
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin-email" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email Address</Label>
                  <div className="relative group">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input 
                      id="admin-email" 
                      type="email" 
                      placeholder="admin@drishyam.com" 
                      className="pl-10 h-11" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required 
                      suppressHydrationWarning
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="admin-password" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Initial Secure Password</Label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input 
                    id="admin-password" 
                    type="password" 
                    placeholder="••••••••••••"
                    className="pl-10 h-11" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required 
                    suppressHydrationWarning
                  />
                </div>
                <p className="text-[10px] text-muted-foreground italic">New administrators should be instructed to change their password upon first login.</p>
              </div>

              <Button type="submit" className="w-full md:w-auto px-8 h-12 text-base font-bold shadow-lg shadow-primary/20" disabled={isLoading}>
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                    />
                    Provisioning...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    Provision Admin Account
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" />
                Security Policy
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-4">
              <p>Only active administrators can provision new accounts. This ensures a chain of trust within the organization.</p>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                  <p className="text-xs">All actions are logged with timestamp and author.</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                  <p className="text-xs">Passwords must be at least 8 characters long.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-transparent border border-primary/10 flex flex-col items-center text-center gap-4">
            <div className="w-12 h-12 bg-white dark:bg-zinc-900 rounded-full flex items-center justify-center shadow-sm">
              <LayoutDashboard className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-bold">Need Help?</h3>
              <p className="text-xs text-muted-foreground">Refer to the documentation for access level details.</p>
            </div>
            <Button variant="link" className="text-xs font-bold uppercase tracking-widest p-0 h-auto">View Docs</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
