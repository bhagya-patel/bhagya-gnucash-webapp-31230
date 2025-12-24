import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { User, Mail, Lock, ArrowLeft, Chrome, CheckCircle, KeyRound, Eye, EyeOff, Phone } from 'lucide-react';
import { FaFacebookF } from 'react-icons/fa';

type AuthView = 'signin' | 'signup' | 'forgot-password' | 'email-confirmation' | 'update-password' | 'phone-login' | 'phone-verify';

export const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  
  const [view, setView] = useState<AuthView>('signin');
  const [loading, setLoading] = useState(false);
  const [signupEmail, setSignupEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  // For the animated toggle between signin/signup
  const isToggled = view === 'signup';

  // Password strength calculation
  const getPasswordStrength = (pwd: string): { level: 'weak' | 'medium' | 'strong'; score: number } => {
    let score = 0;
    if (pwd.length >= 6) score++;
    if (pwd.length >= 8) score++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score++;
    if (/\d/.test(pwd)) score++;
    if (/[^a-zA-Z0-9]/.test(pwd)) score++;
    
    if (score <= 2) return { level: 'weak', score: 33 };
    if (score <= 3) return { level: 'medium', score: 66 };
    return { level: 'strong', score: 100 };
  };

  const passwordStrength = getPasswordStrength(password);

  useEffect(() => {
    // Check for password recovery event
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setView('update-password');
      } else if (event === 'SIGNED_IN' && view !== 'update-password') {
        navigate('/');
      }
    });

    // Check URL hash for recovery token (Supabase puts it in the URL)
    const hashParams = new URLSearchParams(location.hash.substring(1));
    const accessToken = hashParams.get('access_token');
    const type = hashParams.get('type');
    
    if (type === 'recovery' && accessToken) {
      setView('update-password');
    }

    // Check for existing session (but not if we're in password recovery)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session && view !== 'update-password') {
        // Check if this is a recovery session
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        if (hashParams.get('type') !== 'recovery') {
          navigate('/');
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, location, view]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      toast.success('Logged in successfully');
      navigate('/');
    } catch (error: any) {
      toast.error(error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const redirectUrl = `${window.location.origin}/`;
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            username: username,
          },
        },
      });

      if (error) throw error;
      
      // Show email confirmation view
      setSignupEmail(email);
      setView('email-confirmation');
      setEmail('');
      setPassword('');
      setUsername('');
    } catch (error: any) {
      toast.error(error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const redirectUrl = `${window.location.origin}/auth`;
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });

      if (error) throw error;
      toast.success('Password reset email sent! Check your inbox.');
      setView('signin');
      setEmail('');
    } catch (error: any) {
      toast.error(error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: signupEmail,
      });
      if (error) throw error;
      toast.success('Verification email resent!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to resend email');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    setView(view === 'signin' ? 'signup' : 'signin');
    setEmail('');
    setPassword('');
    setUsername('');
  };

  const handleShowForgotPassword = (e: React.MouseEvent) => {
    e.preventDefault();
    setView('forgot-password');
    setPassword('');
  };

  const handleBackToLogin = (e: React.MouseEvent) => {
    e.preventDefault();
    setView('signin');
    setPassword('');
    setConfirmPassword('');
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) throw error;
      
      toast.success('Password updated successfully!');
      
      // Sign out and redirect to login
      await supabase.auth.signOut();
      setView('signin');
      setPassword('');
      setConfirmPassword('');
      
      // Clear URL hash
      window.history.replaceState(null, '', window.location.pathname);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });
      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign in with Google');
    }
  };

  const handlePhoneLogin = () => {
    setView('phone-login');
    setPhoneNumber('');
    setOtpCode('');
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Format phone number - ensure it has country code
      let formattedPhone = phoneNumber.trim();
      if (!formattedPhone.startsWith('+')) {
        formattedPhone = '+' + formattedPhone;
      }

      const { error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
      });

      if (error) throw error;
      
      toast.success('OTP sent to your phone!');
      setView('phone-verify');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let formattedPhone = phoneNumber.trim();
      if (!formattedPhone.startsWith('+')) {
        formattedPhone = '+' + formattedPhone;
      }

      const { error } = await supabase.auth.verifyOtp({
        phone: formattedPhone,
        token: otpCode,
        type: 'sms',
      });

      if (error) throw error;
      
      toast.success('Phone verified successfully!');
      navigate('/');
    } catch (error: any) {
      toast.error(error.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    try {
      let formattedPhone = phoneNumber.trim();
      if (!formattedPhone.startsWith('+')) {
        formattedPhone = '+' + formattedPhone;
      }

      const { error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
      });

      if (error) throw error;
      toast.success('OTP resent successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleFacebookLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'facebook',
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });
      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign in with Facebook');
    }
  };

  // Phone login view - enter phone number
  if (view === 'phone-login') {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center p-5" style={{ background: '#1a1a2e' }}>
        <div className="auth-wrapper auth-reset-wrapper">
          <div className="credentials-panel signin" style={{ width: '100%', zIndex: 20 }}>
            <form onSubmit={handleSendOtp}>
              <div className="confirmation-icon slide-element" style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                <Phone className="w-16 h-16" style={{ color: '#00ff88' }} />
              </div>
              
              <h2 className="slide-element" style={{ marginBottom: '15px' }}>Phone Login</h2>
              
              <p className="slide-element" style={{ fontSize: '14px', color: '#aaa', textAlign: 'center', marginBottom: '20px' }}>
                Enter your phone number with country code (e.g., +1234567890)
              </p>
              
              <div className="field-wrapper slide-element">
                <input
                  type="tel"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder=" "
                  pattern="^\+?[0-9]{10,15}$"
                  title="Please enter a valid phone number with country code"
                />
                <label>Phone Number</label>
                <Phone className="w-5 h-5" />
              </div>
              
              <button
                type="submit"
                className="auth-submit-button slide-element"
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send OTP'}
              </button>
              
              <div className="switch-link slide-element">
                <a onClick={handleBackToLogin} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                  <ArrowLeft className="w-4 h-4" /> Back to Login
                </a>
              </div>
            </form>
          </div>

          {/* Background Shapes */}
          <div className="background-shape reset-bg"></div>
          <div className="secondary-shape reset-secondary"></div>
        </div>
      </div>
    );
  }

  // Phone OTP verification view
  if (view === 'phone-verify') {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center p-5" style={{ background: '#1a1a2e' }}>
        <div className="auth-wrapper auth-reset-wrapper">
          <div className="credentials-panel signin" style={{ width: '100%', zIndex: 20 }}>
            <form onSubmit={handleVerifyOtp}>
              <div className="confirmation-icon slide-element" style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                <KeyRound className="w-16 h-16" style={{ color: '#00ff88' }} />
              </div>
              
              <h2 className="slide-element" style={{ marginBottom: '15px' }}>Verify OTP</h2>
              
              <p className="slide-element" style={{ fontSize: '14px', color: '#aaa', textAlign: 'center', marginBottom: '10px' }}>
                We've sent a verification code to:
              </p>
              
              <p className="slide-element" style={{ fontSize: '16px', color: '#00ff88', textAlign: 'center', marginBottom: '20px', fontWeight: '600' }}>
                {phoneNumber.startsWith('+') ? phoneNumber : '+' + phoneNumber}
              </p>
              
              <div className="field-wrapper slide-element">
                <input
                  type="text"
                  required
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder=" "
                  maxLength={6}
                  pattern="[0-9]{6}"
                  title="Please enter the 6-digit OTP"
                  style={{ letterSpacing: '0.5em', textAlign: 'center', fontSize: '20px' }}
                />
                <label>Enter 6-digit OTP</label>
                <KeyRound className="w-5 h-5" />
              </div>
              
              <button
                type="submit"
                className="auth-submit-button slide-element"
                disabled={loading}
              >
                {loading ? 'Verifying...' : 'Verify & Login'}
              </button>
              
              <button
                type="button"
                className="auth-submit-button slide-element"
                onClick={handleResendOtp}
                disabled={loading}
                style={{ marginTop: '10px', background: 'transparent', border: '1px solid #00ff88', color: '#00ff88' }}
              >
                {loading ? 'Sending...' : 'Resend OTP'}
              </button>
              
              <div className="switch-link slide-element">
                <a onClick={() => setView('phone-login')} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                  <ArrowLeft className="w-4 h-4" /> Change Phone Number
                </a>
              </div>
            </form>
          </div>

          {/* Background Shapes */}
          <div className="background-shape reset-bg"></div>
          <div className="secondary-shape reset-secondary"></div>
        </div>
      </div>
    );
  }

  // Update password view
  if (view === 'update-password') {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center p-5" style={{ background: '#1a1a2e' }}>
        <div className="auth-wrapper">
          <div className="credentials-panel signin" style={{ width: '100%' }}>
            <form onSubmit={handleUpdatePassword}>
              <div className="confirmation-icon slide-element" style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                <KeyRound className="w-16 h-16" style={{ color: '#00ff88' }} />
              </div>
              
              <h2 className="slide-element" style={{ marginBottom: '15px' }}>Set New Password</h2>
              
              <p className="slide-element" style={{ fontSize: '14px', color: '#aaa', textAlign: 'center', marginBottom: '20px' }}>
                Enter your new password below.
              </p>
              
              <div className="field-wrapper slide-element">
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder=" "
                />
                <label>New Password</label>
                <Lock className="w-5 h-5" />
              </div>
              
              <div className="field-wrapper slide-element">
                <input
                  type="password"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder=" "
                />
                <label>Confirm Password</label>
                <Lock className="w-5 h-5" />
              </div>
              
              <button
                type="submit"
                className="auth-submit-button slide-element"
                disabled={loading}
              >
                {loading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>

          {/* Background Shapes */}
          <div className="background-shape"></div>
          <div className="secondary-shape"></div>
        </div>
      </div>
    );
  }

  // Email confirmation view
  if (view === 'email-confirmation') {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center p-5" style={{ background: '#1a1a2e' }}>
        <div className="auth-wrapper">
          <div className="credentials-panel signin" style={{ width: '100%' }}>
            <div className="email-confirmation-content">
              <div className="confirmation-icon slide-element">
                <CheckCircle className="w-16 h-16" style={{ color: '#00ff88' }} />
              </div>
              
              <h2 className="slide-element" style={{ marginBottom: '15px' }}>Check Your Email</h2>
              
              <p className="slide-element" style={{ fontSize: '14px', color: '#aaa', textAlign: 'center', marginBottom: '10px' }}>
                We've sent a verification link to:
              </p>
              
              <p className="slide-element" style={{ fontSize: '16px', color: '#00ff88', textAlign: 'center', marginBottom: '20px', fontWeight: '600' }}>
                {signupEmail}
              </p>
              
              <p className="slide-element" style={{ fontSize: '13px', color: '#888', textAlign: 'center', marginBottom: '25px' }}>
                Click the link in the email to verify your account. If you don't see it, check your spam folder.
              </p>
              
              <button
                type="button"
                className="auth-submit-button slide-element"
                onClick={handleResendVerification}
                disabled={loading}
                style={{ marginBottom: '15px' }}
              >
                {loading ? 'Sending...' : 'Resend Verification Email'}
              </button>
              
              <div className="switch-link slide-element">
                <a onClick={handleBackToLogin} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                  <ArrowLeft className="w-4 h-4" /> Back to Login
                </a>
              </div>
            </div>
          </div>

          {/* Background Shapes */}
          <div className="background-shape"></div>
          <div className="secondary-shape"></div>
        </div>
      </div>
    );
  }

  // Forgot password view
  if (view === 'forgot-password') {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center p-5" style={{ background: '#1a1a2e' }}>
        <div className="auth-wrapper auth-reset-wrapper">
          <div className="credentials-panel signin" style={{ width: '100%', zIndex: 20 }}>
            <form onSubmit={handleForgotPassword}>
              <h2 className="slide-element" style={{ marginBottom: '15px' }}>Reset Password</h2>
              
              <p className="slide-element" style={{ fontSize: '14px', color: '#aaa', textAlign: 'center', marginBottom: '20px' }}>
                Enter your email and we'll send you a link to reset your password.
              </p>
              
              <div className="field-wrapper slide-element">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder=" "
                />
                <label>Email</label>
                <Mail className="w-5 h-5" />
              </div>
              
              <button
                type="submit"
                className="auth-submit-button slide-element"
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
              
              <div className="switch-link slide-element">
                <a onClick={handleBackToLogin} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                  <ArrowLeft className="w-4 h-4" /> Back to Login
                </a>
              </div>
            </form>
          </div>

          {/* Background Shapes - positioned behind content */}
          <div className="background-shape reset-bg"></div>
          <div className="secondary-shape reset-secondary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-5" style={{ background: '#1a1a2e' }}>
      <div className={`auth-wrapper ${isToggled ? 'toggled' : ''}`}>
        {/* Sign In Panel */}
        <div className="credentials-panel signin">
          <form onSubmit={handleLogin}>
            <h2 className="slide-element">Login</h2>
            
            <div className="field-wrapper slide-element">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder=" "
              />
              <label>Email</label>
              <Mail className="w-5 h-5" />
            </div>
            
            <div className="field-wrapper slide-element">
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder=" "
              />
              <label>Password</label>
              <Lock className="w-5 h-5" />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="slide-element" style={{ textAlign: 'right', marginTop: '10px' }}>
              <a 
                onClick={handleShowForgotPassword} 
                className="forgot-password-link"
                style={{ fontSize: '13px', color: '#00ff88', cursor: 'pointer' }}
              >
                Forgot Password?
              </a>
            </div>
            
            <button
              type="submit"
              className="auth-submit-button slide-element"
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Login'}
            </button>

            <div className="social-divider slide-element">
              <span>or continue with</span>
            </div>

            <div className="social-buttons slide-element">
              <button type="button" className="social-btn google" onClick={handleGoogleLogin}>
                <Chrome className="w-5 h-5" />
              </button>
              <button type="button" className="social-btn facebook" onClick={handleFacebookLogin}>
                <FaFacebookF className="w-5 h-5" />
              </button>
              <button type="button" className="social-btn phone" onClick={handlePhoneLogin}>
                <Phone className="w-5 h-5" />
              </button>
            </div>
            
            <div className="switch-link slide-element">
              Don't have an account?{' '}
              <a onClick={handleToggle} className="register-trigger">
                Sign Up
              </a>
            </div>
          </form>
        </div>

        {/* Sign Up Panel */}
        <div className="credentials-panel signup">
          <form onSubmit={handleSignup}>
            <h2 className="slide-element">Register</h2>
            
            <div className="field-wrapper slide-element">
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder=" "
              />
              <label>Username</label>
              <User className="w-5 h-5" />
            </div>
            
            <div className="field-wrapper slide-element">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder=" "
              />
              <label>Email</label>
              <Mail className="w-5 h-5" />
            </div>
            
            <div className="field-wrapper slide-element">
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder=" "
              />
              <label>Password</label>
              <Lock className="w-5 h-5" />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            
            {password && (
              <div className="password-strength-container slide-element">
                <div className="password-strength-bar">
                  <div 
                    className={`password-strength-fill ${passwordStrength.level}`}
                    style={{ width: `${passwordStrength.score}%` }}
                  />
                </div>
                <span className={`password-strength-text ${passwordStrength.level}`}>
                  {passwordStrength.level.charAt(0).toUpperCase() + passwordStrength.level.slice(1)}
                </span>
              </div>
            )}
            
            <button
              type="submit"
              className="auth-submit-button slide-element"
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Register'}
            </button>

            <div className="social-divider slide-element">
              <span>or continue with</span>
            </div>

            <div className="social-buttons slide-element">
              <button type="button" className="social-btn google" onClick={handleGoogleLogin}>
                <Chrome className="w-5 h-5" />
              </button>
              <button type="button" className="social-btn facebook" onClick={handleFacebookLogin}>
                <FaFacebookF className="w-5 h-5" />
              </button>
              <button type="button" className="social-btn phone" onClick={handlePhoneLogin}>
                <Phone className="w-5 h-5" />
              </button>
            </div>
            
            <div className="switch-link slide-element">
              Already have an account?{' '}
              <a onClick={handleToggle} className="login-trigger">
                Sign In
              </a>
            </div>
          </form>
        </div>

        {/* Welcome Section - Sign In */}
        <div className="welcome-section signin">
          <h2 className="slide-element">WELCOME<br />BACK!</h2>
        </div>

        {/* Welcome Section - Sign Up */}
        <div className="welcome-section signup">
          <h2 className="slide-element">WELCOME!</h2>
        </div>

        {/* Background Shapes */}
        <div className="background-shape"></div>
        <div className="secondary-shape"></div>
      </div>
    </div>
  );
};
