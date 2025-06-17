'use client';
import Image from "next/image";
import TypeWriter from "@/components/Typewriter";
import Link from "next/link";
import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import styles from './test/GoldStar.module.css';

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  return (
    <div className="min-h-screen bg-gray-50 relative">      {/* Spinning Black Box Background Animation */}
      <div className="fixed inset-0 z-0 flex items-center justify-end overflow-hidden" style={{paddingRight: 'calc(20% + 150px)'}}>
        {/* Light overlay over entire screen */}
        <div className={styles.screenOverlay}></div>
        
        <div className="relative">
          {/* Main spinning 3D black box */}
          <div className={styles.spinningBox}>
            <div className={`${styles.boxFace} ${styles.front}`}></div>
            <div className={`${styles.boxFace} ${styles.back}`}></div>
            <div className={`${styles.boxFace} ${styles.right}`}></div>
            <div className={`${styles.boxFace} ${styles.left}`}></div>
            <div className={`${styles.boxFace} ${styles.top}`}></div>
            <div className={`${styles.boxFace} ${styles.bottom}`}></div>
          </div>
          
          {/* White lines radiating out */}
          <div className={styles.outskirtLines}>
            <div className={`${styles.line} ${styles.lineTop}`}></div>
            <div className={`${styles.line} ${styles.lineRight}`}></div>
            <div className={`${styles.line} ${styles.lineBottom}`}></div>
            <div className={`${styles.line} ${styles.lineLeft}`}></div>
            {/* Diagonal lines at 45 degree angles */}
            <div className={`${styles.line} ${styles.lineNorthEast}`}></div>
            <div className={`${styles.line} ${styles.lineSouthEast}`}></div>
            <div className={`${styles.line} ${styles.lineSouthWest}`}></div>
            <div className={`${styles.line} ${styles.lineNorthWest}`}></div>
          </div>
        </div>
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
