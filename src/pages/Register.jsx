import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';
import { Home, User, Mail, Lock, Phone } from 'lucide-react';
import cityscapeBg from '../assets/login_bg.png';
import { useAuth } from '../context/AuthContext';
import SocialLogin from '../components/common/SocialLogin';

export default function Register() {
  const [formData, setFormData] = useState({
    firstname: "", lastname: "", username: "", email: "", phone: "",
    password: "", confirm_password: "", role: "", floor_no: "", door_no: "",
    apartment: "", family_details: "", family_members: 1, communication: "",
    photo: null, terms: false, worker_type: "", work: "", time: "", seperate_work: ""
  });
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    // Parse URL hash fragment
    const hash = window.location.hash;
    if (hash) {
      const params = new URLSearchParams(hash.substring(1));
      const idToken = params.get("id_token");
      const state = params.get("state");
      
      if (idToken) {
        // Clear hash from URL immediately
        window.history.replaceState(null, null, window.location.pathname);
        
        let provider = "google";
        if (state && state.startsWith("apple")) {
          provider = "apple";
        }
        
        handleSocialAuth(provider, idToken);
      }
    }
  }, []);

  const handleSocialAuth = async (provider, token) => {
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/auth/${provider}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: token }),
      });
      
      const data = await res.json();
      if (res.ok && data.user) {
        alert(data.message || "Authentication successful!");
        login(data.user, data.token);
        
        setTimeout(() => {
          navigate(data.user.role === 'security' ? "/security/visitor-log" : "/dashboard");
        }, 500);
      } else {
        alert(data.error || `${provider} authentication failed.`);
      }
    } catch (err) {
      console.error(`${provider} auth error:`, err);
      alert("Connection error during social sign in.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : type === "file" ? files[0] : value
    }));
  };

  const getDoorOptions = (floorNo) => {
    if (!floorNo) return [];
    const prefixes = { 1: "f", 2: "s", 3: "t", 4: "fo", 5: "fi" };
    const prefix = prefixes[floorNo];
    return Array.from({ length: 10 }, (_, i) => `${prefix}${i + 1}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirm_password) return alert("Passwords do not match!");
    if (!/^\\d{10}$/.test(formData.phone)) return alert("Please enter a valid 10-digit phone number.");
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/signup`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      alert(await res.text());
    } catch (err) { alert("Signup failed"); }
  };

  const renderInput = (label, name, type="text", props={}) => (
    <div className="space-y-1.5 w-full">
      <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">{label}</label>
      <input type={type} name={name} value={formData[name] || ""} onChange={handleChange} 
        className="w-full px-4 py-3 bg-gray-50/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 font-medium text-gray-900 dark:text-white" {...props}/>
    </div>
  );

  const renderSelect = (label, name, options, props={}) => (
    <div className="space-y-1.5 w-full">
      <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">{label}</label>
      <select name={name} value={formData[name] || ""} onChange={handleChange}
        className="w-full px-4 py-3 bg-gray-50/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:border-primary-500 font-medium text-gray-900 dark:text-white" {...props}>
        <option value="">-- Select --</option>
        {options.map((opt, i) => (
          <option key={i} value={typeof opt === 'object' ? opt.val : opt}>{typeof opt === 'object' ? opt.lbl : opt}</option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-4 py-12" style={{ backgroundImage: `url(${cityscapeBg})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed', backgroundRepeat: 'no-repeat' }}>
      <div className="max-w-4xl w-full bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-10 rounded-[3rem] shadow-xl relative overflow-hidden">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-primary-600 rounded-2xl flex items-center justify-center text-white shadow-lg"><Home className="w-8 h-8" /></div>
        </div>
        <h2 className="text-3xl font-extrabold text-center text-gray-900 dark:text-white tracking-tight mb-2">Community Sign Up</h2>
        <p className="text-center text-gray-500 dark:text-gray-400 font-medium mb-8">Join UrbanNest Apartment Portal</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {renderSelect("Role*", "role", [
              {val: "admin", lbl: "Admin"}, {val: "member", lbl: "Member"}, {val: "worker", lbl: "Worker"}
            ], {required: true})}
            {renderInput("Username*", "username", "text", {required: true})}
            {renderInput("First Name*", "firstname", "text", {required: true})}
            {renderInput("Last Name", "lastname")}
            {renderInput("Email Address*", "email", "email", {required: true})}
            {renderInput("Phone Number*", "phone", "tel", {required: true})}
            {renderInput("Password*", "password", "password", {required: true})}
            {renderInput("Confirm Password*", "confirm_password", "password", {required: true})}
          </div>

          {/* Member Settings */}
          {formData.role === "member" && (
            <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-6 border border-gray-200 dark:border-gray-700">
              <h3 className="md:col-span-2 text-xl font-bold text-gray-900 dark:text-white">Resident Details</h3>
              {renderSelect("Floor Number", "floor_no", ["1", "2", "3", "4", "5"])}
              {renderSelect("Door No", "door_no", getDoorOptions(formData.floor_no))}
              {renderInput("Flat/Apartment Name", "apartment")}
              {renderSelect("Family Details", "family_details", [{val: "single", lbl: "Single"}, {val: "married", lbl: "Married"}])}
              
              {formData.family_details === "married" && (
                <>
                  {renderInput("Number of Members", "family_members", "number", {min: 1, max: 25})}
                  <div className="md:col-span-2 space-y-6 mt-4">
                    {[...Array(Number(formData.family_members || 1))].map((_, idx) => (
                      <div key={idx} className="p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl grid grid-cols-1 md:grid-cols-2 gap-4">
                        <h4 className="md:col-span-2 text-sm font-bold text-gray-700 dark:text-gray-300 border-b border-gray-100 dark:border-gray-800 pb-2">Member {idx + 1}</h4>
                        {renderInput("Name*", `family_member_${idx+1}`, "text", {required: true})}
                        {renderInput("Age*", `family_member_${idx+1}age`, "text", {required: true})}
                        {renderSelect("Gender*", `family_member_${idx+1}gender`, ["male", "female"], {required: true})}
                        {renderSelect("Occupation*", `family_member_${idx+1}occupation`, ["student", "working", "homemaker", "retired"], {required: true})}
                        
                        {formData[`family_member_${idx+1}occupation`] === "student" && (
                          <>
                            {renderSelect("School/College", `family_member_${idx+1}student_school`, ["school", "college"])}
                            {formData[`family_member_${idx+1}student_school`] === "school" && renderInput("School Name", `family_member_${idx+1}student_school_name`)}
                            {formData[`family_member_${idx+1}student_school`] === "college" && renderInput("College Name", `family_member_${idx+1}student_college_name`)}
                          </>
                        )}
                        {formData[`family_member_${idx+1}occupation`] === "working" && renderInput("Office Name", `family_member_${idx+1}office_name`)}
                      </div>
                    ))}
                  </div>
                </>
              )}
              {renderSelect("Preferred Communication", "communication", ["email", "sms"])}
            </div>
          )}

          {/* Worker Settings */}
          {formData.role === "worker" && (
            <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-6 border border-gray-200 dark:border-gray-700">
              <h3 className="md:col-span-2 text-xl font-bold text-gray-900 dark:text-white">Worker Details</h3>
              {renderSelect("Worker Type", "worker_type", [{val: "seperate", lbl: "Separate"}, {val: "shared", lbl: "Shared (Apartment)"}])}
              
              {formData.worker_type === "shared" && renderInput("Work Description*", "work", "text", {required: true})}
              {formData.worker_type === "seperate" && (
                <>
                  {renderInput("Working House Door No*", "seperate_work", "text", {required: true})}
                  {renderInput("Work Description*", "work", "text", {required: true})}
                </>
              )}
              {renderInput("Working Time*", "time", "text", {required: true})}
            </div>
          )}

          <div className="space-y-4">
            <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Profile Photo</label>
            <input type="file" name="photo" onChange={handleChange} className="w-full text-gray-700 dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100" />
            <div className="flex items-center gap-2">
              <input type="checkbox" name="terms" checked={formData.terms} onChange={handleChange} required className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">I agree to the Community Rules & Privacy Policy</span>
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full py-4 text-lg font-bold rounded-2xl mt-6 shadow-xl disabled:opacity-75 disabled:cursor-not-allowed">
            {loading ? "Registering..." : "Register Account"}
          </Button>

          <div className="relative flex items-center py-4">
            <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
            <span className="flex-shrink-0 mx-4 text-gray-400 dark:text-gray-500 text-sm font-bold uppercase tracking-wider">Or register with</span>
            <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
          </div>

          <SocialLogin 
            onAuthStart={() => setLoading(true)}
            onAuthSuccess={handleSocialAuth}
            onAuthFailure={(err) => { setLoading(false); alert("⚠️ " + err); }}
          />
        </form>
        <p className="text-center text-gray-500 font-medium mt-8">Already have an account? <Link to="/login" className="text-indigo-600 font-bold hover:text-indigo-700">Login here</Link></p>
      </div>
    </div>
  );
}
