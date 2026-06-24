import { Link } from 'react-router-dom';
import { PlayCircle, Users, Calendar, FolderOpen, ShieldCheck, Quote } from 'lucide-react';

export default function LandingPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-[921px] flex items-center overflow-hidden px-8">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 z-10 py-20">
            <span className="inline-block py-1 px-3 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-300 text-xs font-bold tracking-widest uppercase rounded-full mb-6 border border-indigo-200 dark:border-indigo-800 transition-colors">
              Foundation for Growth
            </span>
            <h1 className="font-extrabold text-5xl lg:text-7xl text-gray-900 dark:text-white leading-[1.1] tracking-tighter mb-8 transition-colors">
              The Digital Home for Your <span className="text-primary-600 dark:text-primary-400 bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-indigo-600">Community.</span>
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-lg md:text-xl max-w-xl mb-10 leading-relaxed font-medium transition-colors">
              UrbanNest provides the architectural stability to manage, grow, and engage your modern apartment community. Professional tools meet elegant design.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/register" className="bg-gradient-to-br from-primary-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-extrabold text-lg shadow-xl shadow-primary-500/30 hover:-translate-y-1 transition-transform flex items-center justify-center">
                Start Your Community
              </Link>
              <button className="flex items-center justify-center gap-2 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border border-gray-200 dark:border-gray-800 shadow-sm">
                <PlayCircle className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                Watch Demo
              </button>
            </div>
          </div>
          <div className="lg:col-span-6 relative h-full min-h-[500px]">
            <div className="absolute -right-20 top-0 w-[120%] h-full bg-gray-100 dark:bg-gray-900 rounded-[4rem] rotate-3 -z-10 border border-white dark:border-gray-800 transition-colors"></div>
            <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl transform lg:translate-x-12 border border-white/40 dark:border-gray-700 ring-4 ring-white/20 dark:ring-gray-800/50 transition-colors">
              <img 
                alt="Collaborative workspace" 
                className="w-full h-full object-cover" 
                src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" 
              />
              <div className="absolute bottom-6 left-6 right-6 p-6 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md rounded-2xl shadow-lg border border-white/50 dark:border-gray-700 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="flex -space-x-3">
                    <div className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-800 bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-700 dark:text-primary-300 font-bold text-xs shadow-sm">JS</div>
                    <div className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-800 bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold text-xs shadow-sm">AR</div>
                    <div className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-800 bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center text-emerald-700 dark:text-emerald-300 font-bold text-xs shadow-sm">MK</div>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Active Today</p>
                    <p className="font-bold text-gray-900 dark:text-white">482 Members engaged</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features Section */}
      <section id="features" className="py-32 bg-white dark:bg-gray-950 border-y border-gray-100 dark:border-gray-900 transition-colors">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="font-extrabold text-4xl text-gray-900 dark:text-white mb-6 tracking-tight">Built for Modern Governance</h2>
            <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">Replacing fragmented tools with a single, authoritative digital foundation for your community's needs.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature Card 1 */}
            <div className="bg-gray-50 dark:bg-gray-900 p-10 rounded-3xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all group border border-gray-100 dark:border-gray-800">
              <div className="w-14 h-14 bg-primary-100 dark:bg-primary-900/50 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-primary-600 transition-colors shadow-sm border border-primary-200/50 dark:border-primary-800/50">
                <Users className="text-primary-600 dark:text-primary-400 group-hover:text-white transition-colors w-7 h-7" />
              </div>
              <h3 className="font-bold text-2xl text-gray-900 dark:text-white mb-4 tracking-tight">Member Management</h3>
              <p className="text-gray-500 dark:text-gray-400 leading-relaxed font-medium">Centralize your directory with dynamic profiles, role-based permissions, and automated onboarding flows.</p>
            </div>
            {/* Feature Card 2 */}
            <div className="bg-gray-50 dark:bg-gray-900 p-10 rounded-3xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all group border border-gray-100 dark:border-gray-800">
              <div className="w-14 h-14 bg-indigo-100 dark:bg-indigo-900/50 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-indigo-600 transition-colors shadow-sm border border-indigo-200/50 dark:border-indigo-800/50">
                <Calendar className="text-indigo-600 dark:text-indigo-400 group-hover:text-white transition-colors w-7 h-7" />
              </div>
              <h3 className="font-bold text-2xl text-gray-900 dark:text-white mb-4 tracking-tight">Event Planning</h3>
              <p className="text-gray-500 dark:text-gray-400 leading-relaxed font-medium">From town halls to social mixers. Manage RSVPs, ticket sales, and multi-track schedules effortlessly.</p>
            </div>
            {/* Feature Card 3 */}
            <div className="bg-gray-50 dark:bg-gray-900 p-10 rounded-3xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all group border border-gray-100 dark:border-gray-800">
              <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-900/50 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-emerald-600 transition-colors shadow-sm border border-emerald-200/50 dark:border-emerald-800/50">
                <FolderOpen className="text-emerald-600 dark:text-emerald-400 group-hover:text-white transition-colors w-7 h-7" />
              </div>
              <h3 className="font-bold text-2xl text-gray-900 dark:text-white mb-4 tracking-tight">Resource Sharing</h3>
              <p className="text-gray-500 dark:text-gray-400 leading-relaxed font-medium">A secure digital library for bylaws, permits, and community assets. Knowledge architecture at its best.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Bento Grid Stats Section */}
      <section className="py-32 bg-gray-50 dark:bg-gray-950 transition-colors">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-6 h-auto md:h-[600px]">
            <div className="md:col-span-2 md:row-span-2 bg-gradient-to-br from-primary-600 to-indigo-700 rounded-[2.5rem] p-12 flex flex-col justify-between text-white relative overflow-hidden shadow-xl shadow-primary-900/10">
              <div className="z-10">
                <h2 className="font-extrabold text-4xl mb-6 tracking-tight">Designed for Institutional Trust</h2>
                <p className="text-primary-100 text-xl opacity-90 font-medium">UrbanNest handles the complexity of compliance so you can focus on building connections.</p>
              </div>
              <div className="flex items-end gap-2 z-10 mt-12 md:mt-0">
                <span className="text-7xl font-extrabold tracking-tighter drop-shadow-md">99.9%</span>
                <span className="text-lg font-bold pb-3 opacity-90 text-primary-100">Uptime Reliability</span>
              </div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-indigo-500/40 rounded-full blur-3xl opacity-50"></div>
            </div>
            <div className="md:col-span-2 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm rounded-[2.5rem] p-8 flex items-center gap-6 group hover:border-primary-100 dark:hover:border-primary-900/50 transition-colors">
              <div className="w-20 h-20 bg-primary-50 dark:bg-primary-900/30 rounded-2xl flex-shrink-0 flex items-center justify-center shadow-inner border border-primary-100/50 dark:border-primary-800/30 group-hover:bg-primary-100 dark:group-hover:bg-primary-900/50 transition-colors duration-300">
                <ShieldCheck className="w-10 h-10 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <h4 className="font-bold text-xl mb-1 text-gray-900 dark:text-white">State-level Security</h4>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium leading-relaxed">Enterprise-grade encryption and GDPR compliance for all member data.</p>
              </div>
            </div>
            <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100/50 dark:border-emerald-900/50 rounded-[2.5rem] p-8 flex flex-col justify-center text-center shadow-sm transition-colors">
              <div className="text-5xl font-black text-emerald-600 dark:text-emerald-400 mb-2 drop-shadow-sm">15k+</div>
              <div className="text-xs font-bold uppercase tracking-widest text-emerald-800/70 dark:text-emerald-400/80">Portals Created</div>
            </div>
            <div className="bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100/50 dark:border-indigo-900/50 rounded-[2.5rem] p-8 flex flex-col justify-center text-center shadow-sm transition-colors">
              <div className="text-5xl font-black text-indigo-600 dark:text-indigo-400 mb-2 drop-shadow-sm">2.4M</div>
              <div className="text-xs font-bold uppercase tracking-widest text-indigo-800/70 dark:text-indigo-400/80">Monthly Users</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-32 bg-white dark:bg-gray-950 overflow-hidden border-t border-gray-100 dark:border-gray-900 transition-colors">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-8">
            <div className="max-w-2xl">
              <span className="text-primary-600 dark:text-primary-500 font-bold tracking-widest uppercase text-xs mb-4 block">Voices of Leadership</span>
              <h2 className="font-extrabold text-4xl text-gray-900 dark:text-white tracking-tight leading-tight">The impact of a unified digital town hall.</h2>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Testimonial 1 */}
            <div className="bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-12 rounded-[3rem] shadow-sm relative group hover:shadow-md transition-all">
              <div className="absolute -top-6 -right-6">
                <Quote className="w-24 h-24 text-gray-200 dark:text-gray-800 opacity-50 group-hover:text-primary-100 dark:group-hover:text-primary-900/50 transition-colors duration-300 transform rotate-180" />
              </div>
              <p className="text-xl italic text-gray-600 dark:text-gray-300 mb-10 leading-relaxed font-medium relative z-10">
                "UrbanNest transformed our fragmented neighborhood watch into a proactive, engaged community. The resource sharing alone has saved our volunteers hundreds of hours in admin work."
              </p>
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center font-bold text-indigo-700 dark:text-indigo-300 text-xl shadow-inner border border-white dark:border-gray-800">
                  SW
                </div>
                <div>
                  <h4 className="font-bold text-lg text-gray-900 dark:text-white">Sarah J. Wellington</h4>
                  <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Director, Oakwood Heights Association</p>
                </div>
              </div>
            </div>
            {/* Testimonial 2 */}
            <div className="bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-12 rounded-[3rem] shadow-sm relative group hover:shadow-md transition-all">
              <div className="absolute -top-6 -right-6">
                <Quote className="w-24 h-24 text-gray-200 dark:text-gray-800 opacity-50 group-hover:text-primary-100 dark:group-hover:text-primary-900/50 transition-colors duration-300 transform rotate-180" />
              </div>
              <p className="text-xl italic text-gray-600 dark:text-gray-300 mb-10 leading-relaxed font-medium relative z-10">
                "Managing multiple non-profits was a logistical nightmare until UrbanNest. The architectural approach to member roles and data makes it the only scalable solution on the market."
              </p>
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center font-bold text-emerald-700 dark:text-emerald-300 text-xl shadow-inner border border-white dark:border-gray-800">
                  MC
                </div>
                <div>
                  <h4 className="font-bold text-lg text-gray-900 dark:text-white">Marcus Chen</h4>
                  <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Founder, Metro Youth Alliance</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-8 bg-gray-50 dark:bg-gray-950 transition-colors">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-br from-primary-600 to-indigo-700 rounded-[4rem] p-16 md:p-24 text-center text-white relative overflow-hidden shadow-2xl shadow-primary-900/20">
            <div className="relative z-10">
              <h2 className="font-extrabold text-4xl md:text-6xl mb-8 tracking-tighter drop-shadow-sm">Ready to architect your<br/>community's future?</h2>
              <div className="flex flex-col sm:flex-row justify-center gap-6">
                <Link to="/register" className="bg-white text-primary-700 px-10 py-5 rounded-2xl font-extrabold text-xl shadow-xl shadow-black/10 hover:bg-gray-50 transition-all">
                  Build My Portal
                </Link>
                <Link to="/login" className="bg-white/10 backdrop-blur-md text-white px-10 py-5 rounded-2xl font-bold text-xl border border-white/20 hover:bg-white/20 transition-colors">
                  Log in
                </Link>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl"></div>
          </div>
        </div>
      </section>
    </>
  );
}
