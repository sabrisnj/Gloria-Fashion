import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, Clock, CheckCircle, ChevronRight, ChevronLeft, UserPlus, Info, History } from 'lucide-react';
import { Client } from '../types';
import { parseISO, format, addDays, startOfToday, isSunday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Link } from 'react-router-dom';

const SERVICES = [
  "Colocação de Piercing (Orelha)",
  "Colocação de Piercing (Nariz)",
  "Colocação de Piercing (Boca/Língua)",
  "Colocação de Piercing (Umbigo)",
  "Colocação de Piercing (outras partes)",
  "Colocação de Alargador",
  "Troca de Joia",
  "Limpeza e Manutenção",
  "Consultoria de Estilo"
];

const TIME_SLOTS = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30",
  "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
  "17:00", "17:30", "18:00", "18:30", "19:00", "19:30"
];

interface AppointmentFormProps {
  client: Client | null;
  onLogout?: () => void;
}

export function AppointmentForm({ client, onLogout }: AppointmentFormProps) {
  const [step, setStep] = useState(1);
  const [service, setService] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [referrer, setReferrer] = useState('');
  const [consent, setConsent] = useState(false);
  const [notifications, setNotifications] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!client || !service || !date || !time || !consent) {
      alert('Por favor, preencha todos os campos e aceite os termos.');
      return;
    }
    setLoading(true);
    try {
      console.log('Submitting appointment:', {
        client_id: client.id,
        service,
        date,
        time,
        referrer_phone: referrer || null,
        consent: 1,
        notifications: notifications ? 1 : 0
      });

      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: client.id,
          service,
          date,
          time,
          referrer_phone: referrer || null,
          consent: 1,
          notifications: notifications ? 1 : 0
        }),
      });
      
      let data;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        data = await response.json();
      } else {
        const text = await response.text();
        console.error('Non-JSON response received:', text);
        throw new Error('O servidor retornou uma resposta inesperada. Por favor, tente novamente mais tarde.');
      }

      console.log('Server response:', data);
      
      if (response.ok && data.id) {
        setSuccess(true);
      } else {
        if (response.status === 404 && onLogout) {
          alert('Seu cadastro não foi encontrado no servidor. Por favor, realize o cadastro novamente.');
          onLogout();
          return;
        }
        throw new Error(data.error || 'Erro ao agendar');
      }
    } catch (error: any) {
      console.error('Appointment submission error:', error);
      alert(error.message || 'Erro ao agendar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  if (success) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-12 space-y-6"
      >
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-inner border-4 border-green-50">
          <CheckCircle size={48} />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-display font-bold text-ink">Agendamento Solicitado!</h2>
          <p className="text-gray-custom">Sua solicitação foi enviada e aguarda confirmação da Glória Fashion.</p>
        </div>
        <div className="card bg-gray-50 text-left p-4 space-y-2 border-peach/20">
          <p className="text-xs font-bold uppercase text-gray-custom">Resumo</p>
          <p className="text-sm text-ink"><strong>Serviço:</strong> {service}</p>
          <p className="text-sm text-ink"><strong>Data:</strong> {date && format(parseISO(date), "dd 'de' MMMM", { locale: ptBR })}</p>
          <p className="text-sm text-ink"><strong>Horário:</strong> {time}</p>
        </div>
        <Link 
          to="/perfil" 
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          Ver Meus Agendamentos
        </Link>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-ink">Agendar</h1>
          <p className="text-xs text-gray-custom font-bold uppercase tracking-widest">Passo {step} de 4</p>
        </div>
        <Link to="/perfil" className="text-primary flex items-center gap-1 text-xs font-bold uppercase tracking-tighter hover:underline">
          <History size={14} /> Meus Agendamentos
        </Link>
      </header>

      <div className="flex gap-2 mb-8">
        {[1, 2, 3, 4].map(i => (
          <div 
            key={i} 
            className={`h-1 flex-grow rounded-full transition-all ${step >= i ? 'bg-primary' : 'bg-gray-200'}`}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
            <h3 className="font-bold flex items-center gap-2 text-ink">
              <Info size={18} className="text-primary" />
              Qual serviço você deseja?
            </h3>
            <div className="grid gap-3">
              {SERVICES.map(s => (
                <button
                  key={s}
                  onClick={() => { setService(s); nextStep(); }}
                  className={`text-left p-4 rounded-xl border-2 transition-all ${service === s ? 'border-primary bg-peach/10 text-primary' : 'border-gray-100 bg-white text-ink hover:border-peach/30'}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-bold flex items-center gap-2 text-ink">
                <Calendar size={18} className="text-primary" />
                Escolha a data
              </h3>
              <div className="grid grid-cols-4 gap-2">
                {Array.from({ length: 12 }).map((_, i) => {
                  const d = addDays(startOfToday(), i + 1);
                  if (isSunday(d)) return null;
                  const dateStr = format(d, 'yyyy-MM-dd');
                  return (
                    <button
                      key={dateStr}
                      onClick={() => setDate(dateStr)}
                      className={`flex flex-col items-center p-2 rounded-xl border-2 transition-all ${date === dateStr ? 'border-primary bg-peach/10 text-primary' : 'border-gray-100 bg-white text-ink'}`}
                    >
                      <span className="text-[10px] uppercase font-bold opacity-60">{format(d, 'EEE', { locale: ptBR })}</span>
                      <span className="text-lg font-display font-bold">{format(d, 'dd')}</span>
                    </button>
                  );
                })}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-gray-custom">Ou digite uma data específica:</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-custom" size={18} />
                  <input 
                    type="date" 
                    className="input-field pl-10 border-gray-200"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    min={format(new Date(), 'yyyy-MM-dd')}
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button onClick={prevStep} className="flex-grow py-3 rounded-xl border border-gray-200 font-medium">Voltar</button>
              <button 
                onClick={nextStep} 
                disabled={!date}
                className="flex-grow btn-primary disabled:opacity-50"
              >
                Continuar
              </button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-bold flex items-center gap-2 text-ink">
                <Clock size={18} className="text-primary" />
                Escolha o horário
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {TIME_SLOTS.map(t => (
                  <button
                    key={t}
                    onClick={() => setTime(t)}
                    className={`p-2 rounded-lg border transition-all text-sm font-medium ${time === t ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'bg-white text-ink border-gray-100 hover:border-peach/30'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button onClick={prevStep} className="flex-grow py-3 rounded-xl border border-gray-200 font-medium">Voltar</button>
              <button 
                onClick={nextStep} 
                disabled={!time}
                className="flex-grow btn-primary disabled:opacity-50"
              >
                Continuar
              </button>
            </div>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-ink">Confirmação e Termos</h2>
              
              <div className="card bg-peach/5 border-peach/20 space-y-3">
                <div className="flex items-center gap-3 text-primary">
                  <Info size={20} />
                  <p className="font-bold text-sm">Resumo do Agendamento</p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-[10px] text-gray-custom uppercase font-bold">Serviço</p>
                    <p className="font-medium text-ink">{service}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-custom uppercase font-bold">Data e Hora</p>
                    <p className="font-medium text-ink">{date && format(parseISO(date), "dd/MM/yyyy")} às {time}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold uppercase text-gray-custom flex items-center gap-2">
                  <UserPlus size={14} /> Quem indicou? (Opcional)
                </label>
                <input 
                  type="text" 
                  placeholder="Nome, WhatsApp ou Código (GLORIA-ID)" 
                  className="input-field border-gray-200"
                  value={referrer}
                  onChange={(e) => setReferrer(e.target.value)}
                />
              </div>

              <div className="space-y-4 pt-2">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="relative flex items-center mt-1">
                    <input 
                      type="checkbox" 
                      className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-gray-300 checked:bg-primary checked:border-primary transition-all"
                      checked={notifications}
                      onChange={(e) => setNotifications(e.target.checked)}
                    />
                    <CheckCircle className="absolute h-5 w-5 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
                  </div>
                  <span className="text-xs text-gray-custom leading-tight">Aceito receber notificações sobre meu agendamento e promoções exclusivas via WhatsApp.</span>
                </label>

                <div className="card bg-gray-50 p-4 space-y-3 border-gray-100">
                  <h4 className="text-[10px] font-bold uppercase text-gray-custom">Termo de Responsabilidade e Consentimento</h4>
                  <div className="max-h-32 overflow-y-auto text-[10px] text-gray-custom space-y-2 pr-2 custom-scrollbar">
                    <p>Ao prosseguir com este agendamento para aplicação de piercing ou alargamento, declaro estar ciente de que:</p>
                    <ul className="list-disc pl-4 space-y-1">
                      <li>O procedimento envolve riscos inerentes, como inflamações ou reações alérgicas, se os cuidados pós-procedimento não forem seguidos.</li>
                      <li>Comprometo-me a seguir todas as orientações de assepsia e cuidados fornecidas pela profissional.</li>
                      <li>Declaro não possuir condições médicas que impeçam o procedimento (ex: problemas de coagulação, diabetes descontrolada).</li>
                      <li>Autorizo a realização do procedimento escolhido.</li>
                    </ul>
                  </div>
                  <label className="flex items-start gap-3 cursor-pointer pt-2">
                    <div className="relative flex items-center mt-0.5">
                      <input 
                        type="checkbox" 
                        className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-gray-300 checked:bg-primary checked:border-primary transition-all"
                        checked={consent}
                        onChange={(e) => setConsent(e.target.checked)}
                      />
                      <CheckCircle className="absolute h-5 w-5 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
                    </div>
                    <span className="text-xs font-bold text-ink leading-tight">Li e concordo com o Termo de Responsabilidade e Consentimento.</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button onClick={prevStep} className="flex-grow py-3 rounded-xl border border-gray-200 font-medium text-gray-custom hover:text-ink">Voltar</button>
              <button 
                onClick={handleSubmit} 
                disabled={loading || !consent}
                className="flex-grow btn-primary disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
              >
                {loading ? 'Processando...' : 'Confirmar Agendamento'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
