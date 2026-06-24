import { useState } from 'react';
import { ShieldCheck, Target, Users, Landmark, Cpu, MessageSquare, Send, Mail, Phone, MapPin } from 'lucide-react';

export default function About() {
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    subject: 'general',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formState.name || !formState.email || !formState.message) {
      alert("Please fill in all required fields.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formState)
      });
      if (res.ok) {
        setSubmitted(true);
        setFormState({ name: '', email: '', subject: 'general', message: '' });
      } else {
        const errorData = await res.json();
        alert(errorData.error || "Failed to send message. Please try again.");
      }
    } catch (err) {
      console.error("Error submitting contact form:", err);
      alert("Network error. Please make sure the backend server is running.");
    } finally {
      setLoading(false);
    }
  };

  const values = [
    {
      icon: <ShieldCheck className="w-8 h-8 text-primary-600 dark:text-primary-400" />,
      title: 'Institutional Trust',
      description: 'Your security and privacy are built directly into our platform architecture. GDPR compliance, secure data storage, and bcrypt hash encryption form our core.'
    },
    {
      icon: <Users className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />,
      title: 'Community First',
      description: 'We build features that empower residents, administrative managers, and gate security guards alike. Creating seamless, inclusive, and collaborative interfaces.'
    },
    {
      icon: <Cpu className="w-8 h-8 text-cyan-600 dark:text-cyan-400" />,
      title: 'Seamless Innovation',
      description: 'Replacing obsolete registry books and paper receipts with fast, state-of-the-art web technology. We bring real-time connectivity to housing portals.'
    },
    {
      icon: <Landmark className="w-8 h-8 text-purple-600 dark:text-purple-400" />,
      title: 'Operational Excellence',
      description: 'From parsing tenant databases using Excel tools to processing complaints workflows, we make administrative tasks efficient and transparent.'
    }
  ];

  const milestones = [
    {
      year: '2023',
      title: 'Foundation Laid',
      description: 'Conception of the UrbanNest portal to bridge structural gaps in residential management workflows.'
    },
    {
      year: '2024',
      title: 'Alpha Deployments',
      description: 'Tested across 15 high-density apartment blocks, refining visitor logging and residents complaints dashboards.'
    },
    {
      year: '2025',
      title: 'The Digital Shift',
      description: 'Version 2.0 launched featuring Excel exports/imports, Nodemailer OTP resets, and real-time announcements modules.'
    },
    {
      year: '2026',
      title: 'Scale & Growth',
      description: 'Empowering over 15,000 community portals with 2.4 million monthly active users globally.'
    }
  ];

  const team = [
    {
      initials: 'SW',
      name: 'Sarah Wellington',
      role: 'Co-Founder & Chief Product Officer',
      bio: 'Former architectural strategist turned software founder. Sarah designs the structural product workflows of UrbanNest.',
      color: 'bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300'
    },
    {
      initials: 'MC',
      name: 'Marcus Chen',
      role: 'Co-Founder & Chief Technology Officer',
      bio: 'Systems engineer with 12+ years experience building highly secure distributed databases and real-time notification servers.',
      color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300'
    },
    {
      initials: 'AR',
      name: 'Aisha Rahman',
      role: 'Director of Customer Experience',
      bio: 'Passionate about society relations and onboarding. Aisha manages our priority support squads and training protocols.',
      color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300'
    }
  ];

  return (
    <div className="py-20 px-8 transition-colors duration-300">
      {/* Hero Header */}
      <div className="max-w-7xl mx-auto text-center mt-12 mb-20">
        <span className="inline-block py-1 px-3 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-300 text-xs font-bold tracking-widest uppercase rounded-full mb-4 border border-indigo-200 dark:border-indigo-800 transition-colors">
          About UrbanNest
        </span>
        <h1 className="font-extrabold text-4xl sm:text-6xl text-gray-900 dark:text-white leading-tight tracking-tighter mb-6">
          Architecting the Digital Future of <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-indigo-600">Community Living.</span>
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-lg md:text-xl max-w-3xl mx-auto font-medium leading-relaxed">
          UrbanNest is a comprehensive community portal designed to foster safety, transparency, and operational efficiency within modern apartment complexes.
        </p>
      </div>

      {/* Story Section */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-center mb-32">
        <div className="lg:col-span-6">
          <span className="text-primary-600 dark:text-primary-500 font-bold tracking-widest uppercase text-xs mb-3 block">
            Our Story
          </span>
          <h2 className="font-extrabold text-3xl sm:text-4xl text-gray-900 dark:text-white tracking-tight mb-6 leading-tight">
            How we became the digital foundation for thriving communities.
          </h2>
          <div className="space-y-4 text-gray-500 dark:text-gray-400 font-medium leading-relaxed text-base">
            <p>
              In modern residential complexes, governance is often fragmented. Paper registers at gates, Excel templates passed between treasurers, and text messages regarding complaints create friction and insecurity.
            </p>
            <p>
              UrbanNest was founded to replace these disparate, offline systems with a unified digital ecosystem. We built a platform where guards can log visitors in seconds, administrators can manage utilities and bills, and residents can communicate and track files effortlessly.
            </p>
            <p>
              By combining robust role-based security with beautiful, fast user experiences, we help societies transitions from legacy spreadsheets into an organized, cloud-native administration.
            </p>
          </div>
        </div>
        <div className="lg:col-span-6 relative">
          <div className="absolute -left-10 top-10 w-full h-full bg-indigo-500/10 rounded-[2.5rem] -rotate-2 -z-10"></div>
          <div className="rounded-[2.5rem] overflow-hidden shadow-xl border border-gray-100 dark:border-gray-800">
            <img 
              alt="Community building and collaboration" 
              className="w-full h-80 lg:h-96 object-cover" 
              src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" 
            />
          </div>
        </div>
      </div>

      {/* Core Values Section */}
      <div className="max-w-7xl mx-auto mb-32">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Target className="w-10 h-10 text-primary-500 mx-auto mb-4" />
          <h2 className="font-extrabold text-3xl text-gray-900 dark:text-white tracking-tight">Core Values Driving Us</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">The principles behind every line of code we write and database schema we design.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {values.map((val, idx) => (
            <div 
              key={idx}
              className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-8 rounded-3xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all"
            >
              <div className="w-14 h-14 bg-gray-50 dark:bg-gray-800/80 rounded-2xl flex items-center justify-center mb-6 shadow-inner border border-gray-100 dark:border-gray-800/50">
                {val.icon}
              </div>
              <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-3">{val.title}</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed font-medium">{val.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline Section */}
      <div className="max-w-7xl mx-auto mb-32 bg-gray-50 dark:bg-gray-900/30 rounded-[3rem] p-8 md:p-16 border border-gray-100 dark:border-gray-800">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-extrabold text-3xl text-gray-900 dark:text-white tracking-tight">Our Growth Milestones</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">A look back at how we reached our current scale.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
          {milestones.map((m, idx) => (
            <div key={idx} className="relative group">
              <div className="text-6xl font-black text-primary-200 dark:text-gray-800 mb-4 transition-colors group-hover:text-primary-500">{m.year}</div>
              <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-2">{m.title}</h4>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed font-medium">{m.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Leadership Team Section */}
      <div className="max-w-7xl mx-auto mb-32">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-extrabold text-3xl text-gray-900 dark:text-white tracking-tight">Meet the Architects</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">The leadership steering the product vision and security posture of UrbanNest.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {team.map((t, idx) => (
            <div 
              key={idx}
              className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-8 text-center hover:shadow-lg transition-all"
            >
              <div className={`w-24 h-24 rounded-3xl mx-auto flex items-center justify-center font-bold text-3xl mb-6 shadow-inner ${t.color}`}>
                {t.initials}
              </div>
              <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-1">{t.name}</h3>
              <p className="text-primary-600 dark:text-primary-400 text-sm font-semibold mb-4">{t.role}</p>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed font-medium">{t.bio}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Contact & Inquiry Form */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-start" id="contact">
        <div className="lg:col-span-5 space-y-8">
          <div>
            <span className="text-primary-600 dark:text-primary-500 font-bold tracking-widest uppercase text-xs mb-3 block">
              Connect With Us
            </span>
            <h2 className="font-extrabold text-3xl sm:text-4xl text-gray-900 dark:text-white tracking-tight leading-tight">
              Have questions? Let's discuss your community.
            </h2>
            <p className="text-gray-500 dark:text-gray-400 font-medium leading-relaxed mt-4">
              Get in touch with our team for general questions, setup support, custom enterprise licensing requests, or feedback on existing features.
            </p>
          </div>

          <div className="space-y-6 font-semibold text-gray-700 dark:text-gray-300">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-primary-500">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Email Us</p>
                <a href="mailto:mailforsample3@gmail.com" className="hover:text-primary-500 transition-colors">mailforsample3@gmail.com</a>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-indigo-500">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Call Support</p>
                <a href="tel:+18005550199" className="hover:text-indigo-500 transition-colors">+1 (800) 555-0199</a>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-cyan-500">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Office Headquarters</p>
                <p className="text-sm">100 Silicon Blvd, Suite 400, San Francisco, CA</p>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[2.5rem] p-8 md:p-10 shadow-lg relative">
          {submitted ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                <Send className="w-7 h-7" />
              </div>
              <h3 className="font-extrabold text-2xl text-gray-900 dark:text-white mb-2">Message Sent Successfully!</h3>
              <p className="text-gray-500 dark:text-gray-400 font-medium max-w-md mx-auto leading-relaxed">
                Thank you for contacting UrbanNest. A member of our community support team will reach out to you within 24 business hours.
              </p>
              <button 
                onClick={() => setSubmitted(false)}
                className="mt-8 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-white px-6 py-3 rounded-xl font-bold text-sm transition-all"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2" htmlFor="name">
                    Your Name <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    id="name"
                    required
                    value={formState.name}
                    onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                    placeholder="Enter your name" 
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2" htmlFor="email">
                    Your Email <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="email" 
                    id="email"
                    required
                    value={formState.email}
                    onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                    placeholder="name@domain.com" 
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2" htmlFor="subject">
                  Inquiry Topic
                </label>
                <select 
                  id="subject"
                  value={formState.subject}
                  onChange={(e) => setFormState({ ...formState, subject: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-gray-900 dark:text-white"
                >
                  <option value="general">General Inquiry</option>
                  <option value="sales">Sales & Pricing Packages</option>
                  <option value="support">Technical Support</option>
                  <option value="abuse">Report an Issue / Bug</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2" htmlFor="message">
                  Your Message <span className="text-red-500">*</span>
                </label>
                <textarea 
                  id="message"
                  required
                  rows="4"
                  value={formState.message}
                  onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                  placeholder="How can our community team help you?" 
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-gray-900 dark:text-white resize-none"
                ></textarea>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-4 bg-gradient-to-br from-primary-600 to-indigo-600 hover:shadow-lg hover:shadow-primary-500/20 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all cursor-pointer focus:outline-none disabled:opacity-75"
              >
                {loading ? (
                  <span>Sending...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Message</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
