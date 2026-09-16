import React, { useState } from 'react';
import { Star, ThumbsUp, Heart, Check, Sparkles, X, Copy, QrCode, Smartphone, CreditCard, Banknote, UserCheck, ShieldCheck } from 'lucide-react';
import { ServiceRating } from '../types';

interface RatingModalProps {
  serviceTitle: string;
  providerName: string;
  providerAvatar?: string;
  providerPhone?: string;
  providerPixKey?: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmitRating: (rating: ServiceRating, paymentMethod?: 'pix' | 'dinheiro' | 'cartao') => void;
  servicePrice: number;
}

const RATING_TAGS = [
  'Super Pontual',
  'Trabalho Impecável',
  'Muito Educado',
  'Preço Justo',
  'Deixou Tudo Limpo',
  'Explicou o Laudo M1',
  'Rápido e Eficiente',
  'Ferramentas Profissionais'
];

export const RatingModal: React.FC<RatingModalProps> = ({
  serviceTitle,
  providerName,
  providerAvatar,
  providerPhone,
  providerPixKey,
  isOpen,
  onClose,
  onSubmitRating,
  servicePrice
}) => {
  const [step, setStep] = useState<1 | 2>(1); // Step 1: Payment Conference, Step 2: Provider Rating
  const [score, setScore] = useState<number>(5);
  const [hoverScore, setHoverScore] = useState<number>(0);
  const [selectedTags, setSelectedTags] = useState<string[]>(['Super Pontual', 'Trabalho Impecável']);
  const [comment, setComment] = useState<string>('Profissional excelente da M1 Brasil! Chegou rápido, tirou as fotos antes e depois e resolveu o problema com total qualidade.');
  const [tipAmount, setTipAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'dinheiro' | 'cartao'>('pix');
  const [copiedPix, setCopiedPix] = useState<boolean>(false);

  if (!isOpen) return null;

  const totalAmount = servicePrice + tipAmount;
  const effectivePixKey = providerPixKey || providerPhone || 'pix-prestador@m1br.com.br';

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleConfirmPaymentStep = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2); // Go to Step 2: Rating
  };

  const handleConfirmRatingAndSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitRating({
      score,
      comment,
      tags: selectedTags,
      createdAt: `Hoje às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`,
      tipAmount: tipAmount > 0 ? tipAmount : undefined
    }, paymentMethod);
    onClose();
  };

  const handleCopyPix = () => {
    navigator.clipboard.writeText(effectivePixKey);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[99999] bg-black/85 backdrop-blur-md flex flex-col items-center justify-start pt-20 pb-12 px-4 overflow-y-auto animate-fade-in">
      <div className="spam-content-container relative w-full max-w-lg bg-slate-950 rounded-3xl overflow-visible shadow-2xl border border-slate-850 text-white mt-2 md:mt-8 mb-12">
        
        {/* Header with celebration banner */}
        <div className="bg-black p-6 text-white text-center relative border-b border-slate-900">
          
          <div className="relative inline-block mb-3">
            {providerAvatar ? (
              <img
                src={providerAvatar}
                alt={providerName}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-emerald-500 shadow-lg mx-auto"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-slate-900 text-emerald-400 font-bold text-2xl flex items-center justify-center border-2 border-emerald-500 shadow-lg mx-auto">
                {providerName.charAt(0)}
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center border-2 border-black shadow-sm font-black">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>

          <h3 className="text-xl font-black text-white uppercase tracking-tight">
            {step === 1 ? 'Pagamento Direto ao Prestador' : 'Avaliar Atendimento M1'}
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
            {step === 1 ? (
              <>Conclua o pagamento de <strong className="text-emerald-400">R$ {totalAmount.toFixed(2)}</strong> diretamente ao prestador <strong className="text-emerald-400">{providerName}</strong>.</>
            ) : (
              <>Sua opinião é valiosa! Avalie o serviço de <strong className="text-emerald-400">{providerName}</strong> para fechar o chamado.</>
            )}
          </p>
        </div>

        {/* STEP 1: DIRECT PAYMENT TO PROVIDER (PAYMENT CONFERENCE) */}
        {step === 1 ? (
          <div className="p-6 space-y-6">
            
            {/* Amount Visualizer Panel */}
            <div className="bg-emerald-500/10 border-2 border-emerald-500/30 rounded-2xl p-4 text-center space-y-1">
              <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider block">
                Valor Total a Pagar Diretamente ao Prestador
              </span>
              <div className="text-3xl font-black text-emerald-400 font-mono">
                R$ {totalAmount.toFixed(2)}
              </div>
              <div className="flex justify-center items-center gap-4 text-[10px] text-slate-400 font-bold pt-2 border-t border-slate-900 mt-2">
                <span>Serviço: R$ {servicePrice.toFixed(2)}</span>
                {tipAmount > 0 && <span>Gorjeta: R$ {tipAmount.toFixed(2)}</span>}
              </div>
            </div>

            {/* Optional Tip / Gorjeta selection right on Payment step */}
            <div className="bg-slate-900 p-3.5 rounded-2xl border border-slate-850">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                  Deseja adicionar uma gorjeta ao profissional?
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[0, 10, 20, 30].map(tip => (
                  <button
                    type="button"
                    key={tip}
                    onClick={() => setTipAmount(tip)}
                    className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      tipAmount === tip
                        ? 'bg-emerald-500 text-slate-950 font-black shadow-sm'
                        : 'bg-slate-950 text-slate-400 border border-slate-850 hover:bg-slate-850'
                    }`}
                  >
                    {tip === 0 ? 'Sem gorjeta' : `+ R$ ${tip},00`}
                  </button>
                ))}
              </div>
            </div>

            {/* Provider Direct Recipient Card */}
            <div className="bg-slate-900 p-3.5 rounded-2xl border border-slate-850 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Recebedor Direto</span>
                  <span className="text-xs font-black text-white">{providerName}</span>
                  {providerPhone && (
                    <span className="text-[10px] text-slate-400 block">{providerPhone}</span>
                  )}
                </div>
              </div>
              <span className="px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-black uppercase tracking-wider">
                100% Direto
              </span>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                Selecione Como Pagou / Pagará ao Prestador:
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('pix')}
                  className={`py-2.5 px-2 rounded-xl text-xs font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                    paymentMethod === 'pix'
                      ? 'bg-emerald-500 text-slate-950 font-black shadow-md'
                      : 'bg-slate-900 text-slate-400 border border-slate-850 hover:bg-slate-850'
                  }`}
                >
                  <Smartphone className="w-4 h-4" />
                  <span>Pix Direto</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('dinheiro')}
                  className={`py-2.5 px-2 rounded-xl text-xs font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                    paymentMethod === 'dinheiro'
                      ? 'bg-emerald-500 text-slate-950 font-black shadow-md'
                      : 'bg-slate-900 text-slate-400 border border-slate-850 hover:bg-slate-850'
                  }`}
                >
                  <Banknote className="w-4 h-4" />
                  <span>Dinheiro</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('cartao')}
                  className={`py-2.5 px-2 rounded-xl text-xs font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                    paymentMethod === 'cartao'
                      ? 'bg-emerald-500 text-slate-950 font-black shadow-md'
                      : 'bg-slate-900 text-slate-400 border border-slate-850 hover:bg-slate-850'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Maquininha</span>
                </button>
              </div>
            </div>

            {/* Method Details */}
            {paymentMethod === 'pix' && (
              <div className="space-y-4">
                {/* Simulated Pix QR Code Box */}
                <div className="relative w-36 h-36 mx-auto bg-white p-2 rounded-2xl border-4 border-slate-850 shadow-md flex flex-col items-center justify-center">
                  <div className="w-full h-full bg-slate-100 flex items-center justify-center rounded-xl p-1">
                    <div className="w-28 h-28 border-4 border-slate-950 p-1 flex flex-wrap content-start bg-white">
                      <div className="w-7 h-7 border-3 border-slate-950 bg-white"></div>
                      <div className="w-10 h-7 flex flex-wrap p-0.5 gap-0.5">
                        <div className="w-1.5 h-1.5 bg-slate-950"></div>
                        <div className="w-3 h-1.5 bg-slate-950"></div>
                        <div className="w-1.5 h-3 bg-slate-950"></div>
                      </div>
                      <div className="w-7 h-7 border-3 border-slate-950 bg-white ml-auto"></div>
                      <div className="w-full flex justify-between gap-1 mt-1 px-0.5">
                        <div className="w-2 h-2 bg-slate-950"></div>
                        <div className="w-3 h-2 bg-slate-950"></div>
                        <div className="w-2 h-2 bg-slate-950"></div>
                      </div>
                      <div className="w-7 h-7 border-3 border-slate-950 bg-white mt-auto"></div>
                      <div className="w-14 h-7 flex flex-wrap content-end gap-0.5 p-0.5 mt-auto ml-auto">
                        <div className="w-2 h-2 bg-emerald-500 rounded-xs"></div>
                        <div className="w-3 h-2 bg-slate-950"></div>
                        <div className="w-2 h-2 bg-slate-950"></div>
                      </div>
                    </div>
                  </div>
                  <div className="absolute w-7 h-7 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-white text-[8px] font-black shadow-md">
                    Pix
                  </div>
                </div>

                {/* Pix Copy and Paste Button */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                    Chave Pix Direta do Prestador ({providerName})
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={effectivePixKey}
                      className="bg-slate-900 border border-slate-850 p-2.5 rounded-xl text-slate-300 text-xs font-mono flex-1 focus:outline-none select-all truncate font-bold"
                    />
                    <button
                      onClick={handleCopyPix}
                      className={`px-4 rounded-xl text-xs font-black flex items-center gap-1 cursor-pointer transition-colors ${
                        copiedPix
                          ? 'bg-emerald-500 text-slate-950'
                          : 'bg-slate-900 text-slate-300 hover:bg-slate-850 hover:text-white border border-slate-800'
                      }`}
                    >
                      {copiedPix ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedPix ? 'Copiado!' : 'Copiar Chave'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === 'dinheiro' && (
              <div className="p-4 bg-slate-900 rounded-2xl border border-slate-850 space-y-2 text-left">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                  <Banknote className="w-5 h-5" />
                  <span>Pagamento em Espécie / Dinheiro em Mãos</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Entregue a quantia exata de <strong>R$ {totalAmount.toFixed(2)}</strong> diretamente ao profissional <strong>{providerName}</strong> presente no local.
                </p>
              </div>
            )}

            {paymentMethod === 'cartao' && (
              <div className="p-4 bg-slate-900 rounded-2xl border border-slate-850 space-y-2 text-left">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                  <CreditCard className="w-5 h-5" />
                  <span>Pagamento na Maquininha do Prestador</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Realize o pagamento por aproximação ou chip na maquininha levada pelo profissional <strong>{providerName}</strong> no valor de <strong>R$ {totalAmount.toFixed(2)}</strong>.
                </p>
              </div>
            )}

            {/* Instruction Footer callout */}
            <div className="p-3.5 bg-slate-900/70 rounded-xl border border-slate-850 text-[10px] text-slate-400 leading-relaxed text-left flex gap-2.5">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <p>
                <strong>Regulamento M1 Brasil:</strong> O valor total é recebido diretamente pelo prestador credenciado. Em seguida, o prestador repassa a porcentagem da taxa de intermediação à Central M1 e o Administrador confirma no Painel de Chamados, liberando a garantia formal do serviço.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2">
              <button
                onClick={handleConfirmPaymentStep}
                className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-sm font-black rounded-2xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Check className="w-5 h-5" />
                <span>Confirmar Pagamento e ir para Avaliação</span>
              </button>
            </div>

          </div>
        ) : (
          /* STEP 2: RATING AND COMMENTS */
          <form onSubmit={handleConfirmRatingAndSubmit} className="p-6 space-y-5">
            {/* Star Rating */}
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setScore(star)}
                    onMouseEnter={() => setHoverScore(star)}
                    onMouseLeave={() => setHoverScore(0)}
                    className="p-1.5 transition-transform hover:scale-125 focus:outline-none cursor-pointer"
                  >
                    <Star
                      className={`w-9 h-9 ${
                        (hoverScore || score) >= star
                          ? 'text-amber-400 fill-amber-400 drop-shadow-sm'
                          : 'text-slate-750'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <p className="text-xs font-semibold text-slate-400">
                {score === 5 && '🌟 Excelente! Superou as expectativas'}
                {score === 4 && '👍 Muito Bom! Atendimento de qualidade'}
                {score === 3 && '👌 Bom, dentro do esperado'}
                {score === 2 && '⚠️ Razoável, precisa melhorar'}
                {score === 1 && '❌ Insatisfatório'}
              </p>
            </div>

            {/* Quick Compliment Tags */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block text-center">
                Destaques do Profissional
              </label>
              <div className="flex flex-wrap justify-center gap-1.5">
                {RATING_TAGS.map(tag => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <button
                      type="button"
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-500 text-slate-950 shadow-xs'
                          : 'bg-slate-900 text-slate-400 hover:bg-slate-850 hover:text-white border border-slate-800'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 inline mr-1" />}
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Text Feedback */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Comentário sobre o serviço
                </label>
                <span className="text-[10px] text-slate-500 font-medium">Selecione uma mensagem rápida:</span>
              </div>
              
              {/* Message Quick Presets */}
              <div className="flex flex-wrap gap-1.5 pb-1">
                {[
                  'Excelente profissional, recomendo!',
                  'Atendimento nota 10, super rápido!',
                  'Muito educado, deixou tudo limpo!',
                  'Resolveu o problema perfeitamente!'
                ].map((preset) => (
                  <button
                    type="button"
                    key={preset}
                    onClick={() => setComment(preset)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                      comment === preset
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-850 hover:bg-slate-850'
                    }`}
                  >
                    "{preset}"
                  </button>
                ))}
              </div>

              <textarea
                rows={3}
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="Conte como foi sua experiência com o profissional..."
                className="w-full text-xs p-3 bg-slate-900 border border-slate-850 rounded-xl text-white placeholder-slate-500 focus:outline-emerald-500 font-sans leading-relaxed"
              />
            </div>

            {/* Submit CTA */}
            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-sm font-black shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Enviar Avaliação & Encerrar Atividade</span>
              <Sparkles className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full py-2 bg-transparent text-slate-400 hover:text-white text-xs font-bold cursor-pointer transition-colors block text-center"
            >
              ← Voltar para Detalhes de Pagamento
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
