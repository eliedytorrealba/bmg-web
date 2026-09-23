<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>Nueva consulta | BMG Distribuidora</title>
</head>

<body style="
    margin: 0;
    padding: 0;
    background-color: #f4f4f5;
    font-family: Arial, Helvetica, sans-serif;
    color: #18181b;
">
    <table
        role="presentation"
        width="100%"
        cellspacing="0"
        cellpadding="0"
        border="0"
        style="background-color: #f4f4f5; padding: 32px 16px;"
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
                        max-width: 640px;
                        background-color: #ffffff;
                        border-radius: 18px;
                        overflow: hidden;
                        box-shadow: 0 4px 18px rgba(0,0,0,0.08);
                    "
                >
                    <!-- Header -->
                    <tr>
                        <td
                            style="
                                background-color: #18181b;
                                padding: 28px 32px;
                                text-align: center;
                            "
                        >
                            <div
                                style="
                                    font-size: 26px;
                                    font-weight: 700;
                                    color: #ffffff;
                                    letter-spacing: 0.5px;
                                "
                            >
                                BMG Distribuidora
                            </div>

                            <div
                                style="
                                    margin-top: 8px;
                                    font-size: 14px;
                                    color: #d4d4d8;
                                "
                            >
                                Nueva consulta desde el sitio web
                            </div>
                        </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                        <td style="padding: 32px;">

                            <h1
                                style="
                                    margin: 0 0 10px;
                                    font-size: 24px;
                                    line-height: 1.3;
                                    color: #18181b;
                                "
                            >
                                Nueva consulta recibida
                            </h1>

                            <p
                                style="
                                    margin: 0 0 28px;
                                    font-size: 15px;
                                    line-height: 1.7;
                                    color: #52525b;
                                "
                            >
                                Un cliente envió una consulta desde el formulario
                                de contacto de BMG Distribuidora.
                            </p>

                            <!-- Customer data -->
                            <table
                                role="presentation"
                                width="100%"
                                cellspacing="0"
                                cellpadding="0"
                                border="0"
                                style="
                                    border-collapse: separate;
                                    border-spacing: 0;
                                    background-color: #fafafa;
                                    border: 1px solid #e4e4e7;
                                    border-radius: 12px;
                                "
                            >
                                <tr>
                                    <td style="padding: 16px 18px; border-bottom: 1px solid #e4e4e7;">
                                        <strong>Nombre:</strong><br>
                                        {{ $contactMessage->name }}
                                    </td>
                                </tr>

                                <tr>
                                    <td style="padding: 16px 18px; border-bottom: 1px solid #e4e4e7;">
                                        <strong>Empresa:</strong><br>
                                        {{ $contactMessage->company ?: 'No informada' }}
                                    </td>
                                </tr>

                                <tr>
                                    <td style="padding: 16px 18px; border-bottom: 1px solid #e4e4e7;">
                                        <strong>Correo electrónico:</strong><br>

                                        <a
                                            href="mailto:{{ $contactMessage->email }}"
                                            style="color: #2563eb; text-decoration: none;"
                                        >
                                            {{ $contactMessage->email }}
                                        </a>
                                    </td>
                                </tr>

                                <tr>
                                    <td style="padding: 16px 18px; border-bottom: 1px solid #e4e4e7;">
                                        <strong>Teléfono:</strong><br>
                                        {{ $contactMessage->phone }}
                                    </td>
                                </tr>

                                <tr>
                                    <td style="padding: 16px 18px;">
                                        <strong>Asunto:</strong><br>
                                        {{ $contactMessage->subject }}
                                    </td>
                                </tr>
                            </table>

                            <!-- Message -->
                            <div
                                style="
                                    margin-top: 28px;
                                    padding: 22px;
                                    background-color: #f4f4f5;
                                    border-left: 4px solid #2563eb;
                                    border-radius: 8px;
                                "
                            >
                                <div
                                    style="
                                        margin-bottom: 10px;
                                        font-size: 14px;
                                        font-weight: 700;
                                        color: #18181b;
                                    "
                                >
                                    Mensaje del cliente
                                </div>

                                <div
                                    style="
                                        font-size: 15px;
                                        line-height: 1.7;
                                        color: #3f3f46;
                                        white-space: pre-line;
                                    "
                                >{{ $contactMessage->message }}</div>
                            </div>

                            <p
                                style="
                                    margin: 28px 0 0;
                                    font-size: 14px;
                                    line-height: 1.6;
                                    color: #71717a;
                                "
                            >
                                Podés responder directamente a este correo.
                                La respuesta será enviada a
                                <strong>{{ $contactMessage->email }}</strong>.
                            </p>

                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td
                            style="
                                padding: 22px 32px;
                                background-color: #fafafa;
                                border-top: 1px solid #e4e4e7;
                                text-align: center;
                                font-size: 12px;
                                line-height: 1.6;
                                color: #71717a;
                            "
                        >
                            Este mensaje fue generado automáticamente desde
                            el formulario de contacto de BMG Distribuidora.
                        </td>
                    </tr>
                </table>

            </td>
        </tr>
    </table>
</body>
</html>