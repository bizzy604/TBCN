export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 to-purple-600 p-12 flex-col justify-between">
        <div>
          <h1 className="text-white text-3xl font-bold">Brand Coach Network</h1>
        </div>
        
        <div className="space-y-6">
          <h2 className="text-white text-4xl font-bold leading-tight">
            Transform Your Coaching Business
          </h2>
          <p className="text-white/80 text-lg">
            Join thousands of coaches building thriving practices with our proven frameworks,
            supportive community, and expert guidance.
          </p>
          
          <div className="grid grid-cols-2 gap-4 pt-8">
            <div className="bg-white/10 rounded-lg p-4">
              <p className="text-white text-3xl font-bold">5,000+</p>
              <p className="text-white/70 text-sm">Active Coaches</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <p className="text-white text-3xl font-bold">98%</p>
              <p className="text-white/70 text-sm">Satisfaction Rate</p>
            </div>
          </div>
        </div>
        
        <div className="text-white/60 text-sm">
          © {new Date().getFullYear()} Brand Coach Network. All rights reserved.
        </div>
      </div>
      
      {/* Right Side - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  );
}
