"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import Link from "next/link";

export default function ThankYouPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(15);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push("/");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  return (
    <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center text-center min-h-[60vh]">
      <div className="mb-8 animate-in fade-in zoom-in duration-500">
        <CheckCircle className="w-24 h-24 text-green-500" />
      </div>
      
      <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
        Płatność przyjęta!
      </h1>
      
      <p className="text-lg text-neutral-300 mb-8 max-w-lg">
        Dziękujemy za dokonanie płatności. Twoje zamówienie zostało przyjęte do realizacji.
        Potwierdzenie wysłaliśmy na Twój adres e-mail.
      </p>

      <div className="space-y-6">
        <Button asChild size="lg" className="px-8">
          <Link href="/">
            Wróć do strony głównej
          </Link>
        </Button>
        
        <p className="text-sm text-neutral-500">
          Automatyczny powrót za {countdown} s
        </p>
      </div>
    </div>
  );
}

