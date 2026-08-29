import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Mail, Phone, User } from 'lucide-react';
import { MobileScreen } from '../components/MobileScreen';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { AGE_GROUPS, useChild, type AgeGroupId } from '../context/ChildContext';
import { ProgressBar } from './AddChildProfile';

const AGE_GROUP_ORDER: AgeGroupId[] = ['little', 'big', 'super'];

export function CreateAccount() {
  const navigate = useNavigate();
  const { childData, updateChildData } = useChild();

  const [parentName, setParentName] = useState(childData.parentName);
  const [email, setEmail] = useState(childData.parentEmail);
  const [phone, setPhone] = useState(childData.parentPhone);
  const [childName, setChildName] = useState(childData.name);
  const [ageGroup, setAgeGroup] = useState<AgeGroupId>(childData.ageGroup);

  const emailValid = /\S+@\S+\.\S+/.test(email);
  const phoneValid = phone.replace(/[^0-9]/g, '').length >= 6;
  const formValid = parentName.trim() && emailValid && phoneValid && childName.trim();

  const handleContinue = () => {
    updateChildData({
      parentName: parentName.trim(),
      parentEmail: email.trim(),
      parentPhone: phone.trim(),
      name: childName.trim(),
      ageGroup,
    });
    navigate('/add-child');
  };

  return (
    <MobileScreen>
      <div className="flex-1 overflow-y-auto bg-gradient-to-br from-[#D4C5F9]/30 via-[#C9BBF5]/15 to-white px-6 py-8">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-full bg-white/70 flex items-center justify-center mb-4"
          aria-label="Back"
        >
          <ArrowLeft className="w-4 h-4 text-[#35322B]" />
        </button>
        <ProgressBar step={1} />

        <h1 className="text-2xl font-bold text-[#35322B] mb-1 mt-6">Create your account</h1>
        <p className="text-sm text-[#6B6660] mb-6">Tell us a bit about you and your child</p>

        <p className="text-sm font-semibold text-[#55504A] mb-3">Your details</p>
        <div className="flex flex-col gap-4 mb-6">
          <Input
            label="Your name"
            placeholder="Jane Doe"
            value={parentName}
            onChange={(e) => setParentName(e.target.value)}
            icon={<User className="w-5 h-5" />}
          />
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={<Mail className="w-5 h-5" />}
          />
          <Input
            label="Phone number"
            type="tel"
            placeholder="+358 40 123 4567"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            icon={<Phone className="w-5 h-5" />}
          />
        </div>

        <p className="text-sm font-semibold text-[#55504A] mb-3">Your child's details</p>
        <div className="flex flex-col gap-4 mb-6">
          <Input
            label="Child's name or nickname"
            placeholder="Emma"
            value={childName}
            onChange={(e) => setChildName(e.target.value)}
          />
        </div>

        <p className="text-sm font-semibold text-[#55504A] mb-1">Who's joining today?</p>
        <p className="text-xs text-[#6B6660] mb-3">
          The age group helps us choose the right language, themes, and content for your child.
        </p>
        <div className="grid grid-cols-3 gap-2 mb-8">
          {AGE_GROUP_ORDER.map((id) => {
            const group = AGE_GROUPS[id];
            const selected = ageGroup === id;
            return (
              <button
                key={id}
                onClick={() => setAgeGroup(id)}
                className={`text-center rounded-2xl border-2 px-2 py-3 transition-all ${
                  selected ? 'border-[#6E4FD1] bg-[#C9BBF5]/15' : 'border-gray-200 bg-white'
                }`}
              >
                <p className="text-xs font-semibold text-[#35322B]">{group.label}</p>
                <p className="text-[10px] text-[#6B6660] mt-0.5">{group.range}</p>
              </button>
            );
          })}
        </div>

        <Button fullWidth disabled={!formValid} onClick={handleContinue}>
          Continue
        </Button>
      </div>
    </MobileScreen>
  );
}
