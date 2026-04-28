'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, ShieldCheck, LayoutDashboard } from 'lucide-react';
import { createSession } from '@/lib/actions/auth-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await createSession(email, password);

      if (result.success) {
        router.push('/admin');
        router.refresh();
      } else {
        setError(result.error || 'Authentication failed');
      }
    } catch (err: any) {
      console.error('[Login] Auth error:', err);
      setError('Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fdfcfb] dark:bg-[#09090b] p-4 relative overflow-hidden">
      {/* Background decoration consistent with signup */}
      <div className="absolute inset-0 z-0 opacity-[0.03] dark:opacity-[0.07] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)', backgroundSize: '32px 32px' }} />
      
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[10%] left-[10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[10%] right-[10%] w-[40%] h-[40%] bg-zinc-400/10 rounded-full blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[420px] z-10"
      >
        <div className="text-center mb-8">
          <Link href="/" className="inline-block group">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg shadow-primary/30 group-hover:rotate-6 transition-transform">
                D
              </div>
              <span className="text-2xl font-black tracking-tighter font-playfair uppercase">
                DRISHYAM <span className="text-primary font-sans">ADMIN</span>
              </span>
            </div>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Welcome Back</h1>
          <p className="text-muted-foreground">Sign in to manage your news portal</p>
        </div>

        <Card className="border border-zinc-200 dark:border-zinc-800 shadow-2xl shadow-black/5 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">Sign In</CardTitle>
              <Badge variant="outline" className="text-[10px] uppercase tracking-widest font-bold border-primary/20 text-primary">
                Secure Access
              </Badge>
            </div>
            <CardDescription>
              Access the administrative dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm flex items-center gap-2"
              >
                <div className="w-1 h-1 rounded-full bg-red-500" />
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="admin@drishyam.com" 
                    className="pl-10 bg-zinc-50 dark:bg-zinc-950" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required 
                    suppressHydrationWarning
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link href="#" className="text-xs text-primary hover:underline font-medium">Forgot password?</Link>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="••••••••"
                    className="pl-10 bg-zinc-50 dark:bg-zinc-950" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required 
                    suppressHydrationWarning
                  />
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full h-11 text-base font-bold shadow-lg shadow-primary/20 mt-2" 
                disabled={loading}
                suppressHydrationWarning
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                    />
                    Authenticating...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    Sign In
                    <ArrowRight className="h-4 w-4" />
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <div className="text-center text-sm text-muted-foreground">
              Don&apos;t have an admin account?{" "}
              <Link href="/admin/signup" className="text-primary hover:underline underline-offset-4 font-bold">
                Register here
              </Link>
            </div>
            
            <div className="flex items-center justify-center gap-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 w-full opacity-50">
              <ShieldCheck className="h-4 w-4" />
              <LayoutDashboard className="h-4 w-4" />
            </div>
          </CardFooter>
        </Card>

        <div className="mt-8 text-center">
          <Link
            href="/"
            className="text-xs text-muted-foreground hover:text-foreground transition-all flex items-center justify-center gap-2 font-medium uppercase tracking-widest"
          >
            <span className="text-lg">←</span> Back to Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
