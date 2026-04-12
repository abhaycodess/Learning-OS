import { BookOpen, TrendingUp, Star, BarChart3 } from 'lucide-react'
import { BrandMark } from '../../../components/BrandMark.jsx'

const FeatureCard = ({ icon: Icon, title, description, delay }) => (
  <div
    className="group cursor-pointer animate-up"
    style={{ animationDelay: `${delay}s` }}
  >
    <div className="flex items-start gap-4 p-4 rounded-xl transition-all duration-300 hover:bg-white/10 backdrop-blur-sm border border-white/10 hover:border-white/30">
      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-white/40 to-white/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <div className="font-semibold text-white mb-1 group-hover:translate-x-1 transition-transform">
          {title}
        </div>
        <p className="text-sm text-purple-100">{description}</p>
      </div>
    </div>
  </div>
)

export default function LeftBrandPanel() {
  return (
    <div
      className="hidden lg:flex w-1/2 h-screen flex-col justify-between p-16 relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg,#6352c8 0%,#818cf8 50%,#a78bfa 100%)',
      }}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-20">
        <div
          className="absolute top-20 left-20 w-32 h-32 bg-white rounded-full float"
          style={{
            filter: 'blur(40px)',
            animation: 'float 6s ease-in-out infinite',
          }}
        ></div>
        <div
          className="absolute bottom-40 right-32 w-40 h-40 bg-white rounded-full float"
          style={{
            filter: 'blur(50px)',
            animation: 'float 6s ease-in-out infinite 1.5s',
          }}
        ></div>
        <div
          className="absolute top-1/2 right-20 w-24 h-24 bg-white rounded-full float"
          style={{
            filter: 'blur(35px)',
            animation: 'float 6s ease-in-out infinite 3s',
          }}
        ></div>
      </div>

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `
            linear-gradient(0deg, transparent 24%, rgba(255,255,255,.05) 25%, rgba(255,255,255,.05) 26%, transparent 27%, transparent 74%, rgba(255,255,255,.05) 75%, rgba(255,255,255,.05) 76%, transparent 77%, transparent),
            linear-gradient(90deg, transparent 24%, rgba(255,255,255,.05) 25%, rgba(255,255,255,.05) 26%, transparent 27%, transparent 74%, rgba(255,255,255,.05) 75%, rgba(255,255,255,.05) 76%, transparent 77%, transparent)
          `,
          backgroundSize: '50px 50px',
        }}
      ></div>

      {/* Top Section - Logo & Headline */}
      <div className="relative z-10">
        {/* Logo & Brand */}
        <div className="flex items-center gap-3 mb-6 animate-up" style={{ animationDelay: '0.05s' }}>
          <BrandMark
            size={48}
            rounded="xl"
            className="bg-white/10 border-white/30"
          />
          <div>
            <div className="font-heading text-2xl text-white leading-tight">Unlazy</div>
            <div className="text-xs font-semibold tracking-widest uppercase text-white/70">
              Stay Focused. Build Momentum.
            </div>
          </div>
        </div>

        {/* Headline */}
        <div className="animate-up" style={{ animationDelay: '0.1s' }}>
          <h1 className="font-heading text-6xl text-white mb-6 leading-tight">
            Master Your
            <br />
            Learning Journey
          </h1>
          <p className="text-lg text-purple-100 leading-relaxed max-w-xl">
            Transform how you study. The intelligent learning system built for ambitious students who refuse to settle.
          </p>
        </div>
      </div>

      {/* Middle Section - Feature Cards */}
      <div className="relative z-10 space-y-4 my-8">
        <FeatureCard
          icon={BarChart3}
          title="Smart Progress Tracking"
          description="Real-time analytics that show exactly where you excel and where to focus."
          delay={0.15}
        />
        <FeatureCard
          icon={Star}
          title="Personalized AI Guidance"
          description="An intelligent coach adapts to your learning style and challenges."
          delay={0.2}
        />
        <FeatureCard
          icon={TrendingUp}
          title="Visual Learning Insights"
          description="Beautiful charts and metrics that reveal patterns in your progress."
          delay={0.25}
        />
      </div>

      {/* Bottom Section - Social Proof */}
      <div className="relative z-10">
        <p className="text-sm text-purple-200 font-medium animate-up flex items-center gap-2" style={{ animationDelay: '0.3s' }}>
          <span className="text-lg">✓</span> Join 10,000+ students leveling up their learning
        </p>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-8px);
          }
        }

        @keyframes pulse-glow {
          0%, 100% {
            opacity: 0.5;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.05);
          }
        }

        .animate-up {
          animation: fadeUp 0.5s ease both;
        }
      `}</style>
    </div>
  )
}
