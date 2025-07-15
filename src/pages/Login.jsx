import React from 'react';

function Login() {
  return (
    <div style={{ width: 1440, height: 960, position: 'relative', background: 'white' }}>
      <div
        style={{
          width: 400,
          left: 520,
          top: 360,
          position: 'absolute',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          alignItems: 'center',
          gap: 24,
          display: 'inline-flex',
        }}
      >
        <div
          style={{
            flexDirection: 'column',
            justifyContent: 'flex-start',
            alignItems: 'center',
            gap: 4,
            display: 'flex',
          }}
        >
          <div
            style={{
              textAlign: 'center',
              color: '#054071',
              fontSize: 24,
              fontFamily: 'Inter',
              fontWeight: '600',
              lineHeight: 36,
              wordWrap: 'break-word',
            }}
          >
            로그인
          </div>
          <div
            style={{
              textAlign: 'center',
              color: '#054071',
              fontSize: 16,
              fontFamily: 'Inter',
              fontWeight: '400',
              lineHeight: 24,
              wordWrap: 'break-word',
            }}
          >
            ID와 Password를 입력하세요.
          </div>
        </div>
        <div
          style={{
            flexDirection: 'column',
            justifyContent: 'flex-start',
            alignItems: 'flex-start',
            gap: 16,
            display: 'flex',
          }}
        >
          <div
            style={{
              width: 400,
              height: 40,
              paddingLeft: 16,
              paddingRight: 16,
              paddingTop: 8,
              paddingBottom: 8,
              background: 'white',
              borderRadius: 8,
              outline: '1px #E0E0E0 solid',
              outlineOffset: '-1px',
              justifyContent: 'flex-start',
              alignItems: 'center',
              gap: 16,
              display: 'inline-flex',
            }}
          >
            <div
              style={{
                flex: '1 1 0',
                color: '#828282',
                fontSize: 20,
                fontFamily: 'Inter',
                fontWeight: '500',
                lineHeight: 30,
                wordWrap: 'break-word',
              }}
            >
              ID
            </div>
          </div>
          <div
            style={{
              width: 400,
              height: 40,
              paddingLeft: 16,
              paddingRight: 16,
              paddingTop: 8,
              paddingBottom: 8,
              background: 'white',
              borderRadius: 8,
              outline: '1px #E0E0E0 solid',
              outlineOffset: '-1px',
              justifyContent: 'flex-start',
              alignItems: 'center',
              gap: 16,
              display: 'inline-flex',
            }}
          >
            <div
              style={{
                flex: '1 1 0',
                color: '#828282',
                fontSize: 20,
                fontFamily: 'Inter',
                fontWeight: '500',
                lineHeight: 30,
                wordWrap: 'break-word',
              }}
            >
              Password
            </div>
          </div>
          <div
            style={{
              width: 400,
              height: 40,
              paddingLeft: 16,
              paddingRight: 16,
              background: '#1171C0',
              borderRadius: 8,
              justifyContent: 'center',
              alignItems: 'center',
              gap: 8,
              display: 'inline-flex',
            }}
          >
            <div
              style={{
                justifyContent: 'center',
                display: 'flex',
                flexDirection: 'column',
                color: 'white',
                fontSize: 16,
                fontFamily: 'Inter',
                fontWeight: '500',
                lineHeight: 24,
                wordWrap: 'break-word',
              }}
            >
              Login
            </div>
          </div>
        </div>
      </div>
      <div
        style={{
          left: 563,
          top: 615,
          position: 'absolute',
          textAlign: 'center',
          color: '#054071',
          fontSize: 19,
          fontFamily: 'Inter',
          fontWeight: '400',
          lineHeight: 28.5,
          wordWrap: 'break-word',
        }}
      >
        아직 계정이 없으신가요?
      </div>
      <div
        style={{
          left: 669,
          top: 296,
          position: 'absolute',
          textAlign: 'center',
          justifyContent: 'center',
          display: 'flex',
          flexDirection: 'column',
          color: '#1171C0',
          fontSize: 32,
          fontFamily: 'Inter',
          fontWeight: '600',
          lineHeight: 48,
          wordWrap: 'break-word',
        }}
      >
        See Cure
      </div>
      <img
        style={{
          width: 53,
          height: 33,
          left: 607,
          top: 303,
          position: 'absolute',
        }}
        src="https://placehold.co/53x33"
        alt="logo"
      />
      <div
        style={{
          width: 149,
          height: 26,
          left: 730,
          top: 617,
          position: 'absolute',
          textAlign: 'center',
          justifyContent: 'center',
          display: 'flex',
          flexDirection: 'column',
          color: '#4588CB',
          fontSize: 19,
          fontFamily: 'Roboto',
          fontWeight: '400',
          textDecoration: 'underline',
          lineHeight: 32,
          wordWrap: 'break-word',
        }}
      >
        회원가입
      </div>
    </div>
  );
}

export default Login;
