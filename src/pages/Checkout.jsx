import { useState } from 'react';
import { ArrowLeft, ArrowUpRight, Check, CreditCard, Globe2, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage.js';
import { createHostedCheckout } from '../lib/billing.js';
import { findOffer } from '../content/publicSite.js';

/** @param {{ slug: string, status?: 'success' | 'cancelled' | null, onNavigate: (route: string) => void }} props */
export function Checkout({ slug, status = null, onNavigate }) {
  const { lang, toggle } = useLanguage();
  const offer = findOffer(slug);
  const [provider, setProvider] = useState('stripe');
  const [state, setState] = useState('idle');
  const [message, setMessage] = useState('');

  if (status) {
    const success = status === 'success';
    return (
      <main className="public-checkout public-checkout--result">
        <div>
          <ShieldCheck size={32} />
          <p>FANNI · KUPURI MEDIA</p>
          <h1>{success
            ? (lang === 'en' ? 'Payment received.' : 'Pago recibido.')
            : (lang === 'en' ? 'Checkout cancelled.' : 'Pago cancelado.')}</h1>
          <p>{success
            ? (lang === 'en' ? 'Fanni will verify the signed payment event before access or work begins.' : 'Fanni verificará el evento de pago firmado antes de iniciar acceso o trabajo.')
            : (lang === 'en' ? 'No payment was recorded. You can return to the offer or ask Fanni a question.' : 'No se registró ningún pago. Puedes volver a la oferta o preguntarle a Fanni.')}</p>
          <button type="button" onClick={() => onNavigate(success ? '/app/chat' : '/')}>{success ? (lang === 'en' ? 'Continue with Fanni' : 'Continuar con Fanni') : (lang === 'en' ? 'Return home' : 'Volver al inicio')} <ArrowUpRight size={19} /></button>
        </div>
      </main>
    );
  }

  if (!offer) {
    return (
      <main className="public-checkout public-checkout--result">
        <div><h1>{lang === 'en' ? 'Offer not found' : 'Oferta no encontrada'}</h1><button type="button" onClick={() => onNavigate('/')}>{lang === 'en' ? 'Return home' : 'Volver al inicio'}</button></div>
      </main>
    );
  }

  async function beginCheckout() {
    setState('loading');
    setMessage('');
    try {
      const payload = await createHostedCheckout({
        productKey: offer.checkoutProduct,
        provider,
        language: lang
      });
      window.location.assign(payload.url);
    } catch (error) {
      if (error.message === 'BILLING_NOT_CONFIGURED') {
        window.sessionStorage.setItem('fanni_public_intent', `purchase:${offer.slug}`);
        setMessage(lang === 'en'
          ? 'The hosted payment runtime is not configured on this deployment yet. Continue with Fanni to reserve the offer without entering payment details here.'
          : 'El sistema de pago alojado todavía no está configurado en este despliegue. Continúa con Fanni para reservar la oferta sin ingresar datos de pago aquí.');
        setState('fallback');
        return;
      }
      setMessage(lang === 'en' ? 'Checkout could not be created. No payment was taken.' : 'No se pudo crear el pago. No se realizó ningún cargo.');
      setState('error');
    }
  }

  return (
    <div className="public-checkout">
      <header className="public-detail__nav">
        <button type="button" onClick={() => onNavigate('/')}><ArrowLeft size={18} /> FANNI</button>
        <button type="button" onClick={toggle}>{lang === 'en' ? 'ES' : 'EN'}</button>
      </header>

      <main className="public-checkout__layout">
        <section className="public-checkout__offer">
          <p>{lang === 'en' ? 'Bounded paid engagement' : 'Trabajo pagado con límites claros'}</p>
          <h1>{offer.name[lang]}</h1>
          <div className="public-checkout__price">
            <strong>{typeof offer.price === 'string' ? offer.price : offer.price[lang]}</strong>
            <span>{offer.cadence[lang]}</span>
          </div>
          {offer.setup && <p className="public-checkout__setup">{offer.setup}</p>}
          <p className="public-checkout__promise">{offer.promise[lang]}</p>
          <ul>
            {offer.includes[lang].map(item => <li key={item}><Check size={18} /> {item}</li>)}
          </ul>
        </section>

        <section className="public-checkout__panel" aria-labelledby="payment-heading">
          <p>{lang === 'en' ? 'Secure hosted payment' : 'Pago seguro alojado'}</p>
          <h2 id="payment-heading">{lang === 'en' ? 'Choose the payment route.' : 'Elige la ruta de pago.'}</h2>
          <div className="public-checkout__providers" role="radiogroup" aria-label={lang === 'en' ? 'Payment provider' : 'Proveedor de pago'}>
            <button type="button" role="radio" aria-checked={provider === 'stripe'} className={provider === 'stripe' ? 'is-active' : ''} onClick={() => setProvider('stripe')}>
              <CreditCard size={22} />
              <span><strong>Stripe</strong><small>{lang === 'en' ? 'Primary route for Mexico and MXN billing' : 'Ruta principal para México y cobro en MXN'}</small></span>
            </button>
            <button type="button" role="radio" aria-checked={provider === 'creem'} className={provider === 'creem' ? 'is-active' : ''} onClick={() => setProvider('creem')}>
              <Globe2 size={22} />
              <span><strong>Creem</strong><small>{lang === 'en' ? 'International Merchant-of-Record route' : 'Ruta internacional de Merchant of Record'}</small></span>
            </button>
          </div>

          <button type="button" className="public-checkout__submit" disabled={state === 'loading'} onClick={beginCheckout}>
            {state === 'loading' ? (lang === 'en' ? 'Creating secure checkout…' : 'Creando pago seguro…') : (lang === 'en' ? 'Continue to secure checkout' : 'Continuar al pago seguro')} <ArrowUpRight size={19} />
          </button>

          {message && <div className={`public-checkout__message public-checkout__message--${state}`} role="status"><p>{message}</p>{state === 'fallback' && <button type="button" onClick={() => onNavigate('/app/chat')}>{lang === 'en' ? 'Continue with Fanni' : 'Continuar con Fanni'} <ArrowUpRight size={18} /></button>}</div>}

          <p className="public-checkout__safety"><ShieldCheck size={17} /> {lang === 'en'
            ? 'Fanni never asks for card numbers in chat. Access is granted only after a signed provider webhook is verified.'
            : 'Fanni nunca solicita números de tarjeta en el chat. El acceso se otorga solo después de verificar un webhook firmado.'}</p>
        </section>
      </main>
    </div>
  );
}
