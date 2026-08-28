import Logo from './Logo'

export default function PantallaCarga({
  texto = 'Preparando tu Smart Parking...',
}) {
  return (
    <>
      <style>{`
        @keyframes loadingDot {
          0%, 100% {
            transform: translateY(0);
            opacity: .35;
          }

          50% {
            transform: translateY(-8px);
            opacity: 1;
          }
        }

        @keyframes loadingPulse {
          0% {
            transform: scale(.82);
            opacity: .8;
          }

          100% {
            transform: scale(1.45);
            opacity: 0;
          }
        }

        @keyframes loadingCard {
          from {
            opacity: 0;
            transform: translateY(12px) scale(.98);
          }

          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>

      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 999999,

          width: '100vw',
          height: '100vh',

          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',

          backgroundImage: `
            linear-gradient(
              rgba(0, 45, 18, 0.62),
              rgba(0, 45, 18, 0.70)
            ),
            url('/images/login-uteq.jpg')
          `,

          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',

          overflow: 'hidden',
        }}
      >

        {/* DESENFOQUE DE FONDO */}

        <div
          style={{
            position: 'absolute',
            inset: 0,

            backdropFilter: 'blur(5px)',
            WebkitBackdropFilter: 'blur(5px)',

            background:
              'rgba(0, 35, 15, 0.10)',
          }}
        />


        {/* TARJETA CENTRAL */}

        <div
          style={{
            position: 'relative',
            zIndex: 2,

            width: 'min(90vw, 440px)',

            padding: '42px 38px 36px',

            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',

            textAlign: 'center',

            borderRadius: 22,

            background:
              'rgba(255, 255, 255, 0.94)',

            border:
              '1px solid rgba(255,255,255,.75)',

            boxShadow:
              '0 25px 70px rgba(0,0,0,.28)',

            backdropFilter:
              'blur(18px)',

            WebkitBackdropFilter:
              'blur(18px)',

            animation:
              'loadingCard .35s ease-out',
          }}
        >

          {/* LOGO */}

          <div
            style={{
              width: '100%',

              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',

              marginBottom: 30,
            }}
          >

            <Logo
              width={280}
              height={70}
            />

          </div>


          {/* ICONO CENTRAL */}

          <div
            style={{
              position: 'relative',

              width: 92,
              height: 92,

              marginBottom: 25,

              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >

            {/* ONDAS */}

            <span
              style={{
                position: 'absolute',

                width: 76,
                height: 76,

                borderRadius: 22,

                border:
                  '2px solid rgba(8,123,38,.30)',

                animation:
                  'loadingPulse 1.7s infinite ease-out',
              }}
            />


            <span
              style={{
                position: 'absolute',

                width: 76,
                height: 76,

                borderRadius: 22,

                border:
                  '2px solid rgba(8,123,38,.30)',

                animation:
                  'loadingPulse 1.7s .7s infinite ease-out',
              }}
            />


            {/* P */}

            <div
              style={{
                position: 'relative',
                zIndex: 3,

                width: 66,
                height: 66,

                borderRadius: 17,

                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',

                background:
                  'linear-gradient(135deg,#087b26,#10a13b)',

                color: '#ffffff',

                fontWeight: 900,
                fontSize: 39,

                lineHeight: 1,

                boxShadow:
                  '0 12px 28px rgba(8,123,38,.28)',
              }}
            >
              P
            </div>

          </div>


          {/* PUNTOS */}

          <div
            style={{
              height: 22,

              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',

              gap: 8,

              marginBottom: 18,
            }}
          >

            {[0, 1, 2].map(
              (indice) => (

                <span
                  key={indice}
                  style={{
                    width: 9,
                    height: 9,

                    borderRadius: '50%',

                    background: '#087b26',

                    animation: `
                      loadingDot
                      1s
                      ${indice * 0.15}s
                      infinite
                      ease-in-out
                    `,
                  }}
                />

              ),
            )}

          </div>


          {/* TEXTO */}

          <h2
            style={{
              margin: '0 0 7px',

              color: '#111827',

              fontSize: 22,

              fontWeight: 800,

              textAlign: 'center',
            }}
          >
            Smart Parking UTEQ
          </h2>


          <p
            style={{
              margin: 0,

              color: '#6b7280',

              fontSize: 14,

              textAlign: 'center',

              lineHeight: 1.5,
            }}
          >
            {texto}
          </p>


          {/* TEXTO INFERIOR */}

          <div
            style={{
              marginTop: 25,

              paddingTop: 17,

              width: '100%',

              borderTop:
                '1px solid #e5e7eb',

              color: '#9ca3af',

              fontSize: 11,

              textAlign: 'center',
            }}
          >
            Universidad Técnica Estatal de Quevedo
          </div>

        </div>

      </div>
    </>
  )
}