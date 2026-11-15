import { Mail } from 'lucide-react';
import { mail, REFUND_DAYS, Section, SUPPORT_EMAIL } from './LegalScreen';

const ACTUALIZADO = '25 de septiembre de 2026';

/** Spanish version of the support, refunds, terms and privacy page. */
export function LegalScreenEs() {
  const links: [string, string][] = [
    ['support', 'Soporte'],
    ['refunds', 'Reembolsos'],
    ['terms', 'Términos de venta'],
    ['privacy', 'Privacidad'],
    ['affiliation', 'Afiliación'],
  ];
  return (
    <div className="mx-auto max-w-3xl space-y-4 px-4 pb-24 pt-6 sm:px-6" lang="es">
      <div>
        <h1 className="text-3xl font-semibold">Soporte, términos y privacidad</h1>
        <p className="mt-1 text-sm text-night-200">Última actualización: {ACTUALIZADO}</p>
        <nav aria-label="En esta página" className="mt-3 flex flex-wrap gap-2 text-sm">
          {links.map(([id, label]) => (
            <a
              key={id}
              href="#/legal"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="chip hover:bg-white/15"
            >
              {label}
            </a>
          ))}
        </nav>
      </div>

      <Section id="support" title="Soporte">
        <p>¿Tienes preguntas, una clave que no se activa o cualquier otra cosa? Escribe a {mail}. Normalmente respondemos en un plazo de dos días hábiles.</p>
        <p>
          Para ayudarte más rápido, incluye el correo electrónico que usaste al comprar y, si es posible, los últimos caracteres de tu clave de licencia. Por favor,
          nunca envíes los datos completos de tu tarjeta.
        </p>
        <a className="btn btn-gold btn-md" href={`mailto:${SUPPORT_EMAIL}?subject=Soporte%20de%20Ministry%20Showdown`}>
          <Mail className="btn-icon" aria-hidden />
          <span>Escribir a soporte</span>
        </a>
      </Section>

      <Section id="refunds" title="Política de reembolsos">
        <p>
          Si Ministry Showdown o un paquete de preguntas no es adecuado para tu familia, escribe a {mail} dentro de los{' '}
          <strong>{REFUND_DAYS} días posteriores a la compra</strong> y te devolveremos todo tu dinero. Sin preguntas complicadas; solo dinos el correo electrónico
          que usaste al comprar.
        </p>
        <ul className="space-y-1">
          <li>El reembolso se hace al método de pago original mediante nuestro proveedor de pagos, Lemon Squeezy. Tu banco puede tardar unos días en reflejarlo.</li>
          <li>Cuando se reembolsa un pedido, su clave de licencia deja de funcionar, y el juego o paquete que desbloqueó se vuelve a bloquear en tus dispositivos.</li>
          <li>Después de {REFUND_DAYS} días no podemos ofrecer reembolsos, pero siempre intentaremos resolver cualquier problema. Por favor, prueba la demostración gratis antes de comprar.</li>
          <li>Si se te cobró dos veces o nunca te llegó una clave, escríbenos en cualquier momento y lo arreglaremos.</li>
        </ul>
      </Section>

      <Section id="terms" title="Términos de venta">
        <ul className="space-y-1">
          <li>
            <strong>A quién le compras.</strong> Ministry Showdown fue creado por Rashad Washington. Los pedidos los procesa Lemon Squeezy, que actúa como vendedor
            registrado (merchant of record): se encarga del pago, los recibos y los impuestos, y sus términos también se aplican a tu compra.
          </li>
          <li>
            <strong>Qué recibes.</strong> Una compra de un solo pago de una licencia personal para tu hogar. No hay suscripciones. El juego completo desbloquea la
            aplicación y el paquete inicial; cada paquete de preguntas desbloquea ese paquete; el Megapaquete y la Edición completa incluyen todos los paquetes
            disponibles el día de tu compra; los paquetes que salgan después se venden por separado.
          </li>
          <li>
            <strong>Dispositivos.</strong> Cada clave de licencia se puede activar en un número limitado de dispositivos a la vez. Puedes liberar un dispositivo desde
            la Tienda (&ldquo;Quitar de este dispositivo&rdquo;) para usar la clave en otro. Los teléfonos que se unen a un juego como timbre, jugador o control no
            necesitan su propia clave.
          </li>
          <li>
            <strong>Por favor, no compartas las claves</strong> fuera de tu hogar ni revendas o redistribuyas el juego o sus preguntas. Compartir una clave
            públicamente puede hacer que se desactive.
          </li>
          <li>
            <strong>Tus propias preguntas</strong> te pertenecen. Los grupos de preguntas que escribes o compartes son tu contenido.
          </li>
          <li>
            <strong>Disponibilidad.</strong> Ministry Showdown funciona en tu navegador web y sin internet una vez activado. Trabajamos para mantenerlo disponible y
            podemos actualizarlo con el tiempo, pero se ofrece tal como está, sin garantía de servicio ininterrumpido. En la medida en que la ley lo permita, nuestra
            responsabilidad por cualquier problema se limita a la cantidad que pagaste.
          </li>
          <li>
            <strong>Los puntos</strong> de las preguntas son valores del juego creados para divertirse, no estadísticas reales de encuestas.
          </li>
        </ul>
        <p className="text-sm text-night-200">
          Esta traducción se ofrece para tu comodidad. Si hay alguna diferencia con la versión en inglés, prevalece la versión en inglés.
        </p>
      </Section>

      <Section id="privacy" title="Política de privacidad">
        <p>
          <strong>En pocas palabras:</strong> tus juegos, preguntas, puntajes e historial se quedan en tu propio dispositivo. No hay anuncios, ni rastreo, ni cuentas.
        </p>
        <ul className="space-y-1">
          <li>
            <strong>Se guarda solo en tu dispositivo:</strong> los grupos de preguntas, la configuración, el historial de juegos, los nombres de equipos y jugadores, y
            el juego en curso. Se guardan en el almacenamiento de tu navegador y nunca se nos envían. Si borras los datos del sitio en tu navegador, se eliminan;
            también puedes borrarlos en Configuración → Datos.
          </li>
          <li>
            <strong>Cuando compras:</strong> Lemon Squeezy recopila tu nombre, correo electrónico y datos de pago y facturación para procesar el pedido y enviarte tu
            clave de licencia. Nosotros recibimos tu nombre y correo electrónico con el pedido para poder darte soporte. Nunca vemos el número completo de tu tarjeta.
            Consulta la política de privacidad de Lemon Squeezy para saber cómo maneja tus datos.
          </li>
          <li>
            <strong>Cuando activas una clave:</strong> la aplicación envía la clave y una descripción breve del dispositivo (como &ldquo;Chrome en Windows&rdquo;) a
            nuestro servidor, que la verifica con Lemon Squeezy. Más o menos una vez por semana, cuando tienes internet, la aplicación vuelve a verificar la clave de
            la misma manera. Los paquetes de preguntas que compraste se descargan de nuestro servidor en ese momento.
          </li>
          <li>
            <strong>Control desde el teléfono:</strong> cuando conectas un teléfono al televisor, un servicio de conexión gratuito (PeerJS) ayuda brevemente a que los
            dos dispositivos se encuentren usando un código de sala aleatorio. Después, los datos del juego viajan directamente entre tus dispositivos.
          </li>
          <li>
            <strong>Alojamiento:</strong> el sitio está alojado en Netlify, que, como cualquier proveedor web, puede guardar registros técnicos estándar, como
            direcciones IP, por motivos de seguridad y confiabilidad.
          </li>
          <li>
            <strong>Niños:</strong> el juego está diseñado para familias. No pide ni recopila información personal de niños. Las compras las hacen adultos mediante
            Lemon Squeezy.
          </li>
          <li>
            <strong>Tus opciones:</strong> para preguntar qué información de compra tenemos sobre ti o pedir que la eliminemos, escribe a {mail}.
          </li>
        </ul>
      </Section>

      <Section id="affiliation" title="Afiliación">
        <p>
          Ministry Showdown es un juego independiente diseñado para la adoración en familia. No es producido por los testigos de Jehová ni por la Watch Tower Bible
          and Tract Society, ni está afiliado a ellos ni cuenta con su respaldo. Está inspirado en el formato general de los programas clásicos de encuestas y no está
          afiliado a ningún programa de televisión.
        </p>
      </Section>
    </div>
  );
}
