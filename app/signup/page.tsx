'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Github, Chrome, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function SignUpPage() {
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fdfcfb] dark:bg-[#0a0a0a] p-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[100px]" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-[450px] z-10"
      >
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2 mb-4"
            >
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg shadow-primary/20">
                D
              </div>
              <span className="text-2xl font-bold tracking-tighter font-playfair">
                DRISHYAM <span className="text-primary">NEWS</span>
              </span>
            </motion.div>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Create an account</h1>
          <p className="text-muted-foreground">Join the future of digital journalism</p>
        </div>

        <Card className="border-none shadow-2xl shadow-black/5 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">Sign up</CardTitle>
              <Badge variant="secondary" className="font-normal">Premium Access</Badge>
            </div>
            <CardDescription>
              Enter your information to get started
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="w-full bg-white/50 dark:bg-zinc-800/50 hover:bg-white dark:hover:bg-zinc-800 transition-all border-zinc-200 dark:border-zinc-800">
                <Chrome className="mr-2 h-4 w-4" />
                Google
              </Button>
              <Button variant="outline" className="w-full bg-white/50 dark:bg-zinc-800/50 hover:bg-white dark:hover:bg-zinc-800 transition-all border-zinc-200 dark:border-zinc-800">
                <Github className="mr-2 h-4 w-4" />
                GitHub
              </Button>
            </div>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-zinc-200 dark:border-zinc-800" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-zinc-900 px-2 text-muted-foreground">
                  Or continue with email
                </span>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="name" 
                    placeholder="John Doe" 
                    className="pl-10 bg-white/50 dark:bg-zinc-800/50 focus:bg-white dark:focus:bg-zinc-800 transition-all" 
                    required 
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="m@example.com" 
                    className="pl-10 bg-white/50 dark:bg-zinc-800/50 focus:bg-white dark:focus:bg-zinc-800 transition-all" 
                    required 
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="password" 
                    type="password" 
                    className="pl-10 bg-white/50 dark:bg-zinc-800/50 focus:bg-white dark:focus:bg-zinc-800 transition-all" 
                    required 
                  />
                </div>
              </div>
              <div className="flex items-start space-x-2 py-2">
                <Checkbox id="terms" required className="mt-1" />
                <label
                  htmlFor="terms"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-muted-foreground"
                >
                  I agree to the{" "}
                  <Link href="/terms" className="text-primary hover:underline underline-offset-4 font-semibold">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="text-primary hover:underline underline-offset-4 font-semibold">
                    Privacy Policy
                  </Link>
                </label>
              </div>
              <Button type="submit" className="w-full h-11 text-base shadow-xl shadow-primary/20" disabled={isLoading}>
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                    />
                    Creating account...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    Create account
                    <ArrowRight className="h-4 w-4" />
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <div className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/admin/login" className="text-primary hover:underline underline-offset-4 font-semibold">
                Sign in
              </Link>
            </div>
            
            <div className="grid grid-cols-1 gap-2 pt-4 border-t border-zinc-100 dark:border-zinc-800 w-full">
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground justify-center uppercase tracking-widest font-bold">
                <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                Zero-Ads Experience
                <span className="mx-1">•</span>
                <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                Premium Newsletters
                <span className="mx-1">•</span>
                <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                Offline Reading
              </div>
            </div>
          </CardFooter>
        </Card>

        <p className="px-8 text-center text-xs text-muted-foreground mt-8">
          By clicking continue, you agree to our Terms of Service and Privacy Policy. 
          Drishyam News uses high-level encryption to protect your data.
        </p>
      </motion.div>
    </div>
  );
}
