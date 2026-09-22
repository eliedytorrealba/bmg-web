<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ResetPasswordNotification extends Notification
{
    use Queueable;

    public function __construct(
        private readonly string $token
    ) {
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $resetUrl = $this->resetUrl(
            $notifiable
        );

        $expiration = (int) config(
            'auth.passwords.' .
            config('auth.defaults.passwords') .
            '.expire',
            60
        );

        return (new MailMessage)
            ->subject(
                'Restablecé tu contraseña | BMG Distribuidora'
            )
            ->view(
                'emails.reset-password',
                [
                    'user' => $notifiable,
                    'resetUrl' => $resetUrl,
                    'expiration' => $expiration,
                ]
            );
    }

    private function resetUrl(
        object $notifiable
    ): string {
        $frontendUrl = rtrim(
            (string) config('app.frontend_url', 'http://localhost:5173'),
            '/'
        );

        return $frontendUrl .
            '/restablecer-contrasena?token=' .
            urlencode($this->token) .
            '&email=' .
            urlencode(
                $notifiable->getEmailForPasswordReset()
            );
    }

    public function toArray(object $notifiable): array
    {
        return [];
    }
}