import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { Check, Lock, Mail, ShieldCheck, Sparkles } from 'lucide-react';
import { MobileScreen } from '../components/MobileScreen';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { AVATAR_MAP } from '../utils/avatars';

export function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [touched, setTouched] = useState(false);

  const hasMinLength = password.length >= 6;
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>_\-]/.test(password);
  const passwordValid = hasMinLength && hasNumber && hasSpecial;
  const emailValid = /\S+@\S+\.\S+/.test(email);
  const formValid = emailValid && passwordValid;

  const requirementsInvalid = useMemo(() => touched && !passwordValid, [touched, passwordValid]);

  const handleSubmit = () => {
    if (formValid) navigate('/add-child');
  };

  return (
    <MobileScreen>
      <div className="flex-1 overflow-y-auto bg-gradient-to-b from-[#C9EDE1] to-white px-6 py-10 flex flex-col">
        <div className="flex flex-col items-center mb-8">
          <div className="w-24 h-24 rounded-full overflow-hidden shadow-md mb-4">
            <ImageWithFallback
              src={AVATAR_MAP.bunny.image}
              alt="Nuppu Bunny"
              className="w-full h-full object-cover"
            />
          </div>
          <h1 className="text-2xl font-bold text-[#2D3748]">Welcome back</h1>
          <p className="text-sm text-[#718096] mt-1">Log in to continue your journey</p>
        </div>

        <div className="flex flex-col gap-4 flex-1">
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={<Mail className="w-5 h-5" />}
          />

          <div>
            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => setTouched(true)}
              icon={<Lock className="w-5 h-5" />}
            />

            <div
              className={`mt-3 rounded-xl border p-3 space-y-1.5 transition-colors ${
                requirementsInvalid ? 'border-red-300 bg-red-50' : 'border-blue-200 bg-blue-50'
              }`}
            >
              <Requirement met={hasMinLength} label="At least 6 characters" invalid={requirementsInvalid} />
              <Requirement met={hasNumber} label="Contains a number" invalid={requirementsInvalid} />
              <Requirement met={hasSpecial} label="Contains a special character" invalid={requirementsInvalid} />
            </div>
          </div>

          <div className="text-right">
            <button className="text-sm text-[#6B9AC4] font-medium">Forgot password?</button>
          </div>

          <Button fullWidth disabled={!formValid} onClick={handleSubmit} className="mt-2">
            Log In
          </Button>

          <div className="flex items-center gap-3 my-2">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">or</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <Button variant="ghost" fullWidth onClick={() => navigate('/signup')}>
            Create New Account
          </Button>
        </div>

        <div className="flex items-center justify-center gap-6 mt-10 text-xs text-[#4A5568]">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            <ShieldCheck className="w-3.5 h-3.5" />
            GDPR Compliant
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            <Sparkles className="w-3.5 h-3.5" />
            100% Ad-Free & Safe
          </div>
        </div>

        <button
          onClick={() => navigate('/adult-corner')}
          className="text-xs text-[#718096] underline underline-offset-2 mt-4 self-center"
        >
          Adult Corner — subscriptions, tips & about Nuppu
        </button>
      </div>
    </MobileScreen>
  );
}

function Requirement({ met, label, invalid }: { met: boolean; label: string; invalid: boolean }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span
        className={`w-4 h-4 rounded-full flex items-center justify-center ${
          met ? 'bg-green-500' : invalid ? 'bg-red-200' : 'bg-gray-200'
        }`}
      >
        {met && <Check className="w-2.5 h-2.5 text-white" />}
      </span>
      <span className={met ? 'text-[#2D3748]' : invalid ? 'text-red-500' : 'text-[#718096]'}>{label}</span>
    </div>
  );
}
