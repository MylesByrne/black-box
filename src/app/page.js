'use client';
import Image from "next/image";
import TypeWriter from "@/components/Typewriter";
import Link from "next/link";
import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Background Image */}
      <div className="fixed inset-0 z-0">
        <Image
          src="/images/ocean-bg.gif"
          alt="Ocean waves"
          fill
          className="object-cover opacity-30"
          priority
        />
      </div>

      {/* Content */}
      <div className="relative z-10">

        {/* Hero Section */}
        <main className="pt-16">
          <div className="relative overflow-hidden">
            <div className="max-w-7xl mx-auto">
              <div className="relative z-10 pb-8 sm:pb-16 md:pb-20 lg:pb-28 xl:pb-32">
                <div className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
                  <div className="text-center lg:text-left">
                    <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                      <span className="block">Welcome to</span>
                      <span className="block text-gray-600">
                        <TypeWriter text="Black Box" delay={75} />
                      </span>
                    </h1>
                    
                    {/* Sign Up/Login Buttons */}
                    <div className="mt-8 flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
                      <Link
                        href="/signup"
                        className="bg-gray-700 text-white px-8 py-3 rounded-lg text-base font-medium hover:bg-gray-800 transition-colors shadow-md"
                      >
                        Sign Up
                      </Link>
                      <Link
                        href="/login"
                        className="bg-white text-gray-700 border border-gray-300 px-8 py-3 rounded-lg text-base font-medium hover:bg-gray-50 transition-colors shadow-md"
                      >
                        Login
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
