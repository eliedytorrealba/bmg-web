<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verificá tu correo | BMG Distribuidora</title>
</head>

<body style="
    margin: 0;
    padding: 0;
    background-color: #f4f5f7;
    font-family: Arial, Helvetica, sans-serif;
    color: #202124;
">

<table
    role="presentation"
    width="100%"
    cellspacing="0"
    cellpadding="0"
    border="0"
    style="background-color: #f4f5f7; padding: 32px 12px;"
>
    <tr>
        <td align="center">

            <table
                role="presentation"
                width="100%"
                cellspacing="0"
                cellpadding="0"
                border="0"
                style="
                    max-width: 600px;
                    background-color: #ffffff;
                    border-radius: 12px;
                    overflow: hidden;
                    box-shadow: 0 4px 18px rgba(0, 0, 0, 0.08);
                "
            >

                {{-- Header --}}
                <tr>
                    <td
                        align="center"
                        style="
                            background-color: #151515;
                            padding: 30px 24px;
                        "
                    >
                        <div
                            style="
                                font-size: 28px;
                                line-height: 34px;
                                font-weight: 700;
                                color: #ffffff;
                                letter-spacing: 0.5px;
                            "
                        >
                            BMG
                        </div>

                        <div
                            style="
                                margin-top: 4px;
                                font-size: 14px;
                                line-height: 20px;
                                color: #ffffff;
                                letter-spacing: 2px;
                                text-transform: uppercase;
                            "
                        >
                            Distribuidora
                        </div>
                    </td>
                </tr>

                {{-- Content --}}
                <tr>
                    <td style="padding: 38px 36px 32px 36px;">

                        <h1
                            style="
                                margin: 0 0 22px 0;
                                font-size: 24px;
                                line-height: 32px;
                                color: #202124;
                            "
                        >
                            ¡Hola, {{ $user->name }}!
                        </h1>

                        <p
                            style="
                                margin: 0 0 16px 0;
                                font-size: 16px;
                                line-height: 25px;
                                color: #50545a;
                            "
                        >
                            Gracias por registrarte en
                            <strong>BMG Distribuidora</strong>.
                        </p>

                        <p
                            style="
                                margin: 0 0 28px 0;
                                font-size: 16px;
                                line-height: 25px;
                                color: #50545a;
                            "
                        >
                            Para completar el alta de tu cuenta y comenzar
                            a utilizar nuestros servicios, necesitamos
                            verificar tu dirección de correo electrónico.
                        </p>

                        {{-- CTA --}}
                        <table
                            role="presentation"
                            cellspacing="0"
                            cellpadding="0"
                            border="0"
                            align="center"
                            style="margin: 0 auto 30px auto;"
                        >
                            <tr>
                                <td
                                    align="center"
                                    bgcolor="#171717"
                                    style="border-radius: 6px;"
                                >
                                    <a
                                        href="{{ $verificationUrl }}"
                                        style="
                                            display: inline-block;
                                            padding: 15px 30px;
                                            font-size: 16px;
                                            font-weight: 700;
                                            color: #ffffff;
                                            text-decoration: none;
                                            border-radius: 6px;
                                        "
                                    >
                                        Verificar mi correo
                                    </a>
                                </td>
                            </tr>
                        </table>

                        <p
                            style="
                                margin: 0 0 14px 0;
                                font-size: 14px;
                                line-height: 22px;
                                color: #6b7077;
                            "
                        >
                            Por seguridad, este enlace de verificación
                            tiene una duración limitada.
                        </p>

                        <p
                            style="
                                margin: 0 0 26px 0;
                                font-size: 14px;
                                line-height: 22px;
                                color: #6b7077;
                            "
                        >
                            Si vos no creaste una cuenta en BMG Distribuidora,
                            podés ignorar este mensaje.
                        </p>

                        <div
                            style="
                                border-top: 1px solid #e4e6e8;
                                padding-top: 22px;
                            "
                        >
                            <p
                                style="
                                    margin: 0 0 8px 0;
                                    font-size: 13px;
                                    line-height: 20px;
                                    color: #7a7f85;
                                "
                            >
                                Si el botón no funciona, copiá y pegá este
                                enlace en tu navegador:
                            </p>

                            <p
                                style="
                                    margin: 0;
                                    font-size: 12px;
                                    line-height: 19px;
                                    word-break: break-all;
                                "
                            >
                                <a
                                    href="{{ $verificationUrl }}"
                                    style="
                                        color: #3d65a5;
                                        text-decoration: underline;
                                    "
                                >
                                    {{ $verificationUrl }}
                                </a>
                            </p>
                        </div>

                    </td>
                </tr>

                {{-- Footer --}}
                <tr>
                    <td
                        align="center"
                        style="
                            background-color: #f8f8f8;
                            border-top: 1px solid #ececec;
                            padding: 24px 30px;
                        "
                    >
                        <p
                            style="
                                margin: 0 0 5px 0;
                                font-size: 13px;
                                line-height: 20px;
                                font-weight: 700;
                                color: #3d4146;
                            "
                        >
                            BMG Distribuidora
                        </p>

                        <p
                            style="
                                margin: 0;
                                font-size: 12px;
                                line-height: 19px;
                                color: #8a8e93;
                            "
                        >
                            Este es un correo automático.
                            Por favor, no respondas a este mensaje.
                        </p>
                    </td>
                </tr>

            </table>

        </td>
    </tr>
</table>

</body>
</html>