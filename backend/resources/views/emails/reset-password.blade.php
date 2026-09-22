<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Restablecer contraseña | BMG Distribuidora</title>
</head>

<body style="
    margin: 0;
    padding: 0;
    background-color: #f3f4f6;
    font-family: Arial, Helvetica, sans-serif;
    color: #1f2937;
">
    <table
        role="presentation"
        width="100%"
        cellspacing="0"
        cellpadding="0"
        border="0"
        style="background-color: #f3f4f6;"
    >
        <tr>
            <td
                align="center"
                style="padding: 32px 16px;"
            >
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
                    "
                >
                    <tr>
                        <td
                            align="center"
                            style="
                                background-color: #111827;
                                padding: 28px 24px;
                            "
                        >
                            <div
                                style="
                                    color: #ffffff;
                                    font-size: 30px;
                                    font-weight: 700;
                                    letter-spacing: 3px;
                                "
                            >
                                BMG
                            </div>

                            <div
                                style="
                                    margin-top: 4px;
                                    color: #d1d5db;
                                    font-size: 12px;
                                    letter-spacing: 4px;
                                "
                            >
                                DISTRIBUIDORA
                            </div>
                        </td>
                    </tr>

                    <tr>
                        <td
                            style="
                                padding: 36px 32px;
                            "
                        >
                            <h1
                                style="
                                    margin: 0 0 20px;
                                    color: #111827;
                                    font-size: 24px;
                                    line-height: 1.3;
                                "
                            >
                                Restablecé tu contraseña
                            </h1>

                            <p
                                style="
                                    margin: 0 0 16px;
                                    font-size: 16px;
                                    line-height: 1.6;
                                "
                            >
                                ¡Hola, {{ $user->name }}!
                            </p>

                            <p
                                style="
                                    margin: 0 0 24px;
                                    font-size: 16px;
                                    line-height: 1.6;
                                "
                            >
                                Recibimos una solicitud para
                                restablecer la contraseña de tu
                                cuenta en BMG Distribuidora.
                            </p>

                            <table
                                role="presentation"
                                width="100%"
                                cellspacing="0"
                                cellpadding="0"
                                border="0"
                            >
                                <tr>
                                    <td
                                        align="center"
                                        style="padding: 8px 0 28px;"
                                    >
                                        <a
                                            href="{{ $resetUrl }}"
                                            style="
                                                display: inline-block;
                                                background-color: #111827;
                                                color: #ffffff;
                                                text-decoration: none;
                                                font-size: 16px;
                                                font-weight: 700;
                                                padding: 14px 28px;
                                                border-radius: 8px;
                                            "
                                        >
                                            Restablecer contraseña
                                        </a>
                                    </td>
                                </tr>
                            </table>

                            <p
                                style="
                                    margin: 0 0 16px;
                                    font-size: 14px;
                                    line-height: 1.6;
                                    color: #4b5563;
                                "
                            >
                                Este enlace estará disponible durante
                                {{ $expiration }} minutos.
                            </p>

                            <p
                                style="
                                    margin: 0 0 24px;
                                    font-size: 14px;
                                    line-height: 1.6;
                                    color: #4b5563;
                                "
                            >
                                Si no solicitaste un cambio de
                                contraseña, podés ignorar este correo.
                                Tu contraseña actual continuará
                                funcionando.
                            </p>

                            <div
                                style="
                                    border-top: 1px solid #e5e7eb;
                                    padding-top: 20px;
                                "
                            >
                                <p
                                    style="
                                        margin: 0 0 8px;
                                        font-size: 13px;
                                        line-height: 1.5;
                                        color: #6b7280;
                                    "
                                >
                                    Si el botón no funciona, copiá y
                                    pegá el siguiente enlace en tu
                                    navegador:
                                </p>

                                <p
                                    style="
                                        margin: 0;
                                        font-size: 12px;
                                        line-height: 1.5;
                                        word-break: break-all;
                                    "
                                >
                                    <a
                                        href="{{ $resetUrl }}"
                                        style="
                                            color: #374151;
                                            text-decoration: underline;
                                        "
                                    >
                                        {{ $resetUrl }}
                                    </a>
                                </p>
                            </div>
                        </td>
                    </tr>

                    <tr>
                        <td
                            align="center"
                            style="
                                background-color: #f9fafb;
                                border-top: 1px solid #e5e7eb;
                                padding: 24px;
                            "
                        >
                            <p
                                style="
                                    margin: 0 0 6px;
                                    color: #374151;
                                    font-size: 13px;
                                    font-weight: 700;
                                "
                            >
                                BMG Distribuidora
                            </p>

                            <p
                                style="
                                    margin: 0;
                                    color: #9ca3af;
                                    font-size: 12px;
                                    line-height: 1.5;
                                "
                            >
                                Este es un correo automático.
                                No es necesario responderlo.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>