import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900">
        {/* Video Background Placeholder */}
        <div className="absolute inset-0 w-full h-full bg-black/50">
          {/* Tu będzie video w tle */}
        </div>
        
        {/* Background gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
      </section>
    </div>
  );
}
